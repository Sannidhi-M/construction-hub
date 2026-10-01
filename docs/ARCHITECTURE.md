# Construction Materials E-Commerce Platform — Architecture & v1 Plan

## Context

We're launching an e-commerce platform for construction materials (cement, steel, sand, aggregates, bricks, tiles) in a single district in Karnataka. The business already runs deliveries manually (no delivery integration needed) and collects payment via UPI outside any gateway. The goal of this document is to lock in a concrete architecture and build sequence for a v1 that is deliberately simple but production-quality — no speculative multi-district, multi-payment-gateway, or notification infrastructure.

The working directory (`/Users/sannidihim/construction-hub`, git repo `construction-hub` on GitHub) already contains a **Medusa DTC Starter** scaffold: a Turborepo monorepo with `apps/backend` (Medusa v2) and `apps/storefront` (Next.js 15.5/React 19). Investigation found:
- `apps/backend` is essentially a **blank Medusa v2 skeleton** — `medusa-config.ts` only has `projectConfig` (no modules registered at all), no Stripe/DTC-specific dependencies, and `src/modules`/`workflows`/`subscribers`/`jobs` are empty placeholders. The only real artifact is `src/migration-scripts/initial-data-seed.ts`, which seeds generic Medusa demo apparel data (Shirts/Sweatshirts, a Denmark/EUR region) — irrelevant and to be replaced.
- `apps/storefront` has a **substantial, working DTC funnel**: `[countryCode]`-based routing, product browsing (PDP/store/categories), cart, a Stripe-based checkout, and a full account module (login, addresses, orders, profile). This is real, reusable plumbing.

**Decision: reuse + strip down**, not a fresh build. The backend costs the same either way (near-empty). The storefront's browse/cart/account plumbing is expensive to rebuild from scratch and only needs its Stripe payment step and multi-region/locale layer removed — bounded, mechanical work, much cheaper than reconstructing PDP/cart/account UX from zero.

All product/business decisions below were confirmed directly with the user; this plan does not assume anything beyond them.

## Confirmed Decisions

- **Units**: Fixed-pack variants, integer quantity (e.g. "Cement 50kg bag", "Bricks bundle of 500") — maps directly onto Medusa's native product/variant/option model. No custom unit-of-measure or decimal-quantity logic.
- **Auth**: Both email/password (Medusa's stock `auth-emailpass` provider) and phone + OTP (custom auth provider, SMS via **MSG91**).
- **Payment**: Static UPI QR (business's own fixed UPI ID), no payment gateway/aggregator. Verification is **pure manual, no proof captured** on the order — admin checks their own bank/UPI app and marks orders verified in Medusa Admin.
- **Payment-state modeling**: Medusa's **built-in System payment provider** (`pp_system`), not a custom provider module. Medusa documents this provider explicitly as a cash-on-delivery-style placeholder — no gateway call, merchant manages the payment lifecycle themselves — which matches the UPI-QR case directly. The order is created while the payment session sits in Medusa's `pending_authorization` state (a state Medusa designs for exactly this: bank transfers, vouchers, pay-later methods), and later transitions to `authorized`/`captured` once the admin confirms. This still keeps payment history inside Medusa's native ledger, without writing a custom `IPaymentProvider` implementation. See §2.4.
- **Delivery area check**: Pincode allowlist for the single target district, checked at the address step.
- **Minimum order value**: enforced (no delivery fee otherwise).
- **Notifications**: none for v1 — customers check status by logging in.
- **Cancellation**: admin-only, via stock Medusa Admin order cancel; no in-app refund automation (refunds happen manually, off-platform).
- **Daily price updates**: via the standard Medusa Admin UI, one variant at a time — no bulk tooling for v1.
- **Fulfillment/delivery**: Medusa's **built-in manual fulfillment provider** (`@medusajs/fulfillment-manual`) — no custom delivery module. One shipping option ("Business Delivery," ₹0, since there's no delivery fee) bound to it. Admin progresses an order through Medusa's native fulfillment lifecycle (Create Fulfillment → Mark as Shipped → Mark as Delivered) exactly as designed; "Mark as Shipped" is the "Out for Delivery" step, "Mark as Delivered" is the final step. See §2.6.
- **GST/tax**: not finalized — **default to tax-inclusive flat pricing** for v1 (no separate Tax module configuration), revisit before launch if the business needs a shown tax line.
- **Deployment**: **Medusa Cloud for both backend and storefront**, using Cloud's "Storefronts on Cloud" feature, which requires (and this repo already has) a Turbo/Nx monorepo layout — single platform, no separate Vercel account needed.
- **SMS/OTP provider**: MSG91.

## 1. High-level Architecture

```
Customer Browser
      │ HTTPS
      ▼
Next.js Storefront (Medusa Cloud storefront hosting)
apps/storefront — App Router, no [countryCode] routing, server actions → Medusa SDK
      │ Medusa Store API (HTTPS, JWT/cookie auth)
      ▼
Medusa v2 Backend (Medusa Cloud)
apps/backend
  ├─ Core modules (as shipped): Product, Pricing, Inventory, Customer, Cart,
  │  Order, Fulfillment, Region
  ├─ Custom modules:
  │    - phone-otp-auth       (Auth Module provider: authenticate + validateCallback)
  │    - msg91-notification   (Notification Module provider, channel: sms)
  │    - delivery-area        (pincode allowlist)
  ├─ Built-in System payment provider (pp_system) — no custom payment module
  ├─ Built-in manual fulfillment provider — no custom delivery module
  ├─ Subscriber: send-otp.ts (phone-auth.otp.generated → Notification Module)
  └─ Admin UI + custom widgets (order verification, pincode management)
      │                    │
      ▼                    ▼
  PostgreSQL           Redis
  (Medusa Cloud)        (event bus, OTP cache, workflow locks)

External: MSG91, called only from the msg91-notification provider. No payment gateway anywhere in this diagram —
the UPI QR is a static image/string rendered by the storefront; no network call to
a payment processor is ever made.
```

Key boundary: admin never receives a webhook. Verification is a human action in Medusa Admin after checking their own bank app manually.

## 2. Data Model

### 2.1 Categories & catalog
Use Medusa's native `ProductCategory` — flat taxonomy: Cement, Steel & TMT Bars, Sand, Aggregates/Jelly, Bricks & Blocks, Tiles. One INR region for the target Karnataka district (no multi-country tax complexity), one stock location representing the business's yard.

**Search**: Medusa's built-in Store API search (`POST /store/products/search` with a `q` keyword param, backed by Postgres) is sufficient for v1's catalog size (a few dozen–hundred SKUs across six categories). No Algolia/MeiliSearch integration for v1 — that's real infrastructure and cost for a search problem this catalog doesn't have yet; revisit only if the catalog grows enough that keyword relevance becomes a real complaint.

**Product images**: Medusa Cloud's storefront hosting currently does not support Next.js's built-in Image Optimization (`next/image`'s automatic resizing/format conversion doesn't run there). Two options, decided in Phase 0: disable Next.js image optimization (`images.unoptimized: true` in `next.config.js`) and serve pre-sized images, or point `next.config.js`'s image loader at an external optimizer/CDN. Given v1's small, admin-curated catalog (not user-generated uploads), the simplest fix — upload reasonably-sized images and disable optimization — is recommended over adding a third-party image service for v1; revisit if product photos start being large/unoptimized uploads at scale.

### 2.2 Fixed-pack variants
No new model needed. Product = the material; Product Option = "Pack Size"; Variant = the sellable SKU with its own price/inventory (e.g. "TMT Steel 12mm x 12ft"). Even single-pack-size materials get a 1-value option, to keep the PDP option→variant selection code path (`apps/storefront/src/modules/products/components/product-actions/`) uniform. Customer quantity = Medusa's existing `LineItem.quantity`.

### 2.3 Pincode delivery-area allowlist
New custom module `apps/backend/src/modules/delivery-area/`:
- Model: `ServiceablePincode { id, pincode (unique, indexed), area_label?, is_active }`.
- Service: `isServiceable(pincode)` + standard CRUD.
- Rationale for a DB-backed module over a config/env list: admin needs to add/remove pincodes without a backend redeploy.
- Migration via `medusa db:generate delivery-area`; seeded via the new seed script (Phase 1).

### 2.4 Payment-state (order created before payment is confirmed)

**No custom payment-provider module.** Use Medusa's built-in System payment provider (`pp_system`), registered as the sole provider for the region's payment module. It performs no gateway call; Medusa documents it as a cash-on-delivery-style placeholder where the merchant manages the payment lifecycle out of band — exactly the UPI-QR case.

Checkout sequence (matches the flow below, and directly addresses the "customer pays, order never gets created" gap):

```
Cart → Address + pincode validation → Shipping method
  → completeCartWorkflow runs: ORDER IS CREATED, payment session = pending_authorization
  → Storefront shows UPI QR, referencing the just-created order/payment id
  → Customer pays off-platform
  → Admin verifies (bank/UPI app) and captures the payment in Admin
  → Payment session = authorized → captured; order.payment_status updates automatically
  → Order can be fulfilled — see §2.6 for what happens from here through delivery
```

Because the order exists the moment checkout completes (before any money has changed hands), there is no window where a successful payment can arrive with no order to reconcile it against — the order is already sitting in Medusa in a "payment pending" state, and the admin's job is only ever to *advance* an existing order, never to reconstruct one.

This keeps payment history inside Medusa's standard payment/capture ledger with zero custom provider code. If proof capture or real refund tracking is needed later, a custom provider can still be introduced then — nothing here forecloses that.

**Mobile vs. desktop presentation**: a static QR alone is a broken experience for a customer checking out on the same phone they'd need to scan it with — there's no camera-to-screen loop on one device. The standard fix (and the one used here): the payment string is a single UPI intent URI (`upi://pay?pa=<vpa>&pn=<name>&am=<order total>&cu=INR&tn=<order id>`); on mobile, render it as a tappable "Pay via UPI app" button (opens the customer's UPI app directly with the amount prefilled), and on desktop, render the same string as a QR code image for the customer to scan with their phone. One generated string, two presentations, chosen by a simple device check — no separate logic per platform.

### 2.5 Minimum order value
Enforced **server-side**, not just client-side (so it can't be bypassed via direct Store API calls):
- Store the threshold as an env var (`MIN_ORDER_VALUE_INR`) — a single scalar that changes rarely; escalate to a DB-backed setting only if the business wants to self-serve changes without a deploy.
- Enforce via a workflow step composed into cart completion, rejecting with a clear error if the cart total is under threshold.
- Also enforce client-side in the storefront checkout step for fast UX feedback (belt and suspenders).

### 2.6 Fulfillment & delivery (Medusa's built-in fulfillment system, no custom delivery module)

The original flow ("business delivers manually, admin marks Delivered") still needs to run through Medusa's actual fulfillment machinery rather than jumping straight from payment to a bare "Delivered" flag — otherwise there's no modeled state for "packed but not yet out," no audit trail, and no natural place to hang a future tracking/notification feature. Medusa already has exactly this lifecycle built in:

```
Stock Location (the business's yard — already defined in §2.1)
      ↓
Shipping Profile ("Default") + Shipping Option ("Business Delivery", ₹0, single region)
      ↓
Manual Fulfillment Provider (@medusajs/fulfillment-manual, built-in — no custom code)
      ↓
Admin: Create Fulfillment  →  Mark as Shipped ("Out for Delivery")  →  Mark as Delivered
```

Configuration (Phase 0/1, not custom code):
- Register the manual fulfillment provider for the fulfillment module in `medusa-config.ts` (same pattern as the payment module in §2.4).
- Create one `ShippingProfile` and one `ShippingOption` ("Business Delivery") scoped to the single region, priced at ₹0 (no delivery fee, per the confirmed decision), associated with the stock location from §2.1.
- No shipping-rate calculation, carrier integration, or tracking-number requirement — `add tracking number` is optional in Medusa's UI and is skipped for v1.

Admin usage (no new UI needed — this is stock Medusa Admin):
1. Once payment is verified (§2.4), admin clicks **Create Fulfillment** on the order — status becomes `fulfilled`.
2. When the business actually dispatches the order, admin clicks **Mark as Shipped** — sets `shipped_at`. This is the "Out for Delivery" state.
3. Once delivered, admin clicks **Mark as Delivered** — sets `delivered_at`. This is the terminal success state.
4. A fulfillment can only be cancelled before it's shipped or delivered (Medusa enforces this) — matches the confirmed admin-only cancellation decision; no custom guard needed here, unlike the payment-side cancellation interaction flagged in §3.2.

### 2.7 Customer-facing status mapping

Medusa tracks payment state (`payment_status`) and fulfillment state (`fulfillment_status`) as two separate fields, plus an overall `order.status` (e.g. `canceled`). Customers shouldn't see Medusa's internal vocabulary directly — a small **derived mapping**, not a new stored field, translates the pair into one of six labels:

| Customer sees          | Derived from                                                             |
|-------------------------|---------------------------------------------------------------------------|
| Payment Pending          | `payment_status = pending_authorization` (order placed, awaiting UPI verification) |
| Order Confirmed          | `payment_status = authorized` or `captured`, `fulfillment_status = not_fulfilled`   |
| Processing               | `fulfillment_status = fulfilled` (fulfillment created, not yet shipped)             |
| Out for Delivery         | `fulfillment_status = shipped`                                                      |
| Delivered                | `fulfillment_status = delivered`                                                    |
| Cancelled                | `order.status = canceled` (overrides all of the above)                              |

This mapping is pure, stateless, and lives as a small shared utility (e.g. `apps/storefront/src/lib/util/order-status.ts`), consumed by the order-status storefront pages (§4.2) and mirrored in the admin order widget (§3.4) so admin and customer never see contradictory labels for the same order.

### 2.8 Checkout-time robustness (stock, pricing, duplicate submission)

Stock availability at completion, price changes between cart creation and checkout, and duplicate checkout submissions are real risks, but they belong to cart/order **creation**, not payment verification (§3.2) — by the time verify-payment runs, the order already exists with a locked-in total:
- **Stock becoming unavailable during checkout**: Medusa's cart-completion workflow includes its own inventory-availability/reservation checks as a core step; this is expected to be handled natively, not by custom code — verify with an explicit test in Phase 1 (reduce a variant's stock to zero mid-checkout, confirm completion fails cleanly) rather than assuming.
- **Inventory concurrency**: two customers completing checkout for the last unit of the same variant at the same time should not both succeed. This is a distinct case from the above (that's an admin zeroing stock; this is a race between two simultaneous buyers) — Medusa's inventory reservation is expected to serialize this at the database level, but it must be tested explicitly with a genuine concurrent request (e.g. two parallel `completeCartWorkflow` calls in a test script), not just sequential manual clicks which would never actually race.
- **Price changing after cart creation**: Medusa computes cart totals dynamically up until the order is created; the order line items snapshot the price only at `completeCartWorkflow`. This is why §2.4 already has the UPI QR read the amount from the just-created order, not a total cached earlier in checkout — confirm with a test that changes a variant's price mid-checkout and checks the QR/admin amount matches the order, not the stale cart view.
- **Duplicate checkout/order submission** (e.g. a double-clicked "place order" button): a completed cart should not be completable a second time. Expected to be native Medusa behavior (a cart is single-use once it transitions to an order) — verify explicitly in Phase 4 rather than assume, and add a storefront-side submit-button disable-while-pending as cheap defense in depth regardless of what the backend guarantees.

## 3. Custom Backend Work

### 3.1 Phone + OTP auth provider

**Use Medusa's actual Auth Provider lifecycle, not bespoke Store API routes.** Medusa's own reference implementation for exactly this scenario (its "Implement Phone Authentication" tutorial) is a proper `AbstractAuthModuleProvider` with two framework-recognized methods — not two hand-rolled endpoints:

```
Phone Auth Provider (authenticate + validateCallback)
        ↓ emits event on OTP generation
"phone-auth.otp.generated"
        ↓
Subscriber (src/subscribers/send-otp.ts)
        ↓ resolves the Notification Module
Notification Module  →  msg91-notification provider (channel: "sms")  →  MSG91
```

- `apps/backend/src/modules/phone-otp-auth/`, registered in `medusa-config.ts`'s Auth module alongside the stock `auth-emailpass` provider. Implements:
  - `authenticate(input)` — the "request OTP" call. Generates a 6-digit OTP, normalizes the phone number to E.164 first (see below), and returns `{ success: true, location: "otp" }` to signal the callback step is required. Framework auto-generates the route `POST /auth/customer/phone-auth` for this — **no custom route needed**.
  - `validateCallback(input)` — the "verify OTP" call, framework-generated as `POST /auth/customer/phone-auth/callback`. Validates the submitted OTP and, on success, returns the `AuthIdentity`, issuing the same JWT/cookie session Medusa uses everywhere else.
  - `register()` — initial account creation with the normalized phone number as `entity_id`.
- **OTP generation triggers a domain event, not a direct SMS call.** `authenticate()` never talks to MSG91 itself; it emits `phone-auth.otp.generated { phone, otp }` on the event bus. A subscriber resolves `Modules.NOTIFICATION` and calls `notificationModuleService.createNotifications({ to: phone, channel: "sms", template: "otp", data: { otp } })`. This is the decoupling the fix calls for: swapping MSG91 for another provider later means writing a new notification provider, not touching auth logic.
- **MSG91 notification provider**: `apps/backend/src/modules/msg91-notification/`, implementing `AbstractNotificationProviderService` for the `sms` channel, registered under the Notification module's `providers`. This is the only place MSG91's API is called from.
- **OTP storage**: JWT-signed (`jwt.sign({ otp }, jwtSecret, { expiresIn: "5m" })`), stored in the auth identity's `provider_metadata` — no Redis needed just to hold the OTP value itself. Expiry is enforced by JWT verification failing past the TTL. **On successful verification, `provider_metadata.otp` is cleared immediately** so a captured OTP can't be replayed again inside its own TTL window (Medusa's reference tutorial does not do this — it's an explicit hardening addition here).
- **Phone number normalization**: all phone input is normalized to E.164 (e.g. via `libphonenumber-js`) before it's used as `entity_id` or looked up, both in `authenticate()` and `validateCallback()` — otherwise `+919000000000` and `9000000000` would silently become two different accounts (a real gap in Medusa's own tutorial, called out here explicitly).
- **Resend cooldown, max attempts, and rate limiting** — these use Redis, since they need shared, fast-expiring counters that a stateless JWT can't provide on its own:
  - Resend cooldown: reject a new `authenticate()` call for the same phone within N seconds of the last one (Redis key with TTL).
  - Max verification attempts: increment a Redis counter on each failed `validateCallback()`; once a threshold is hit, invalidate the current OTP outright (don't just let it expire) and require a fresh `authenticate()` call.
  - Per-phone rate limiting: cap OTP requests per phone per hour (Redis counter).
  - Per-IP rate limiting: a custom middleware (`apps/backend/src/api/middlewares.ts`, matcher `/auth/customer/phone-auth*`) rejecting excessive request volume from a single IP — this is added at the route-matcher level precisely because Medusa auto-generates the route rather than us owning a custom handler; Medusa's middleware system supports attaching guards to built-in routes this way (its own tutorial does the same thing to guard `/store/customers/me`).
- No delivery-status webhook needed for v1 — fire-and-forget send from the subscriber; OTP verification is check-based, not delivery-confirmation-based.

Note: this SMS usage is unrelated to the "no notifications for v1" decision above — that decision covers *order-status* notifications (email/SMS on order events), which are still explicitly out of scope. OTP delivery is a mechanic of the phone-login feature itself, decided separately, and is the only notification traffic this platform sends in v1.

### 3.2 UPI manual payment verification — a privileged operation, not a generic order update

Cart completes against the built-in `pp_system` provider (2.4); the order exists and its payment session sits in `pending_authorization` with no gateway call ever made. Marking that payment verified moves real money out of "unconfirmed" — it is treated as a privileged operation with its own explicit pipeline, not exposed through Medusa's generic order PATCH:

```
Authenticate admin → Authorize operation → Load order/payment
  → Validate current state → Validate payment amount → Idempotent capture
  → Record verification details
```

- **Authenticate admin** — free, not custom code: any route under `apps/backend/src/api/admin/**` is automatically protected by Medusa's own admin session middleware (this is how Medusa's route convention works — `/admin/*` inherits the same guard as core admin routes, with no opt-in required). This structurally rejects both an unauthenticated request and a customer session (customers and admin users are distinct actor types in Medusa's auth identity model, so a customer's JWT does not satisfy the admin guard) — but it's still an explicit test case (below), not an assumption.
- **Authorize operation** — for v1, "authorized" means "any authenticated admin user." Medusa v2 does have an RBAC system (behind the `MEDUSA_FF_RBAC` feature flag), but it currently has open bugs around permission revocation and sidebar visibility, and the business runs with a small, effectively single-operator admin team per the original requirements — enabling RBAC now would import known-buggy complexity with no real access-control benefit yet. This is a deliberate v1 decision (see Open Items), not an oversight.
- **Load order/payment** — resolve the order and its payment collection by the order id from the route param; a missing/mismatched id fails here, before any state logic runs.
- **Validate current state** — reject if the order is already cancelled (checked explicitly rather than trusted to the payment module alone, given the known upstream cancellation interaction, see Open Items), and reject if the payment is already captured, returning a distinct "already verified" error so the admin UI can tell "first verification" from "duplicate click."
- **Validate payment amount** — reject if the amount being confirmed doesn't equal the order's actual total; no partial/mismatched captures for v1. Catches fat-fingered admin input or a wrong-order mix-up before money is marked received.
- **Idempotent capture** — call Medusa's existing `capturePaymentWorkflow` (or the payment module's `capturePayment`) to perform the actual state transition; Medusa's core capture path already short-circuits once `captured_at` is set, so this step is safe to retry.
- **Record verification details** — `admin_note`/`verified_by`/`verified_at` written to the order once capture succeeds.

Implementation: custom workflow `apps/backend/src/workflows/verify-order-payment.ts` implementing the state/amount checks around Medusa's own capture call, invoked from `apps/backend/src/api/admin/orders/[id]/verify-payment/route.ts` (`POST`) — the "mark payment verified" action surfaced in the admin widget (3.4).

**Explicit test matrix for this endpoint** (Phase 4 exit criteria): unauthenticated request; customer session attempting the route; duplicate verification of an already-captured order; wrong payment amount; already-cancelled order; a payment captured but somehow with no corresponding completed order (regression test that Phase 4's order-before-payment sequencing in §2.4 holds — this should be structurally impossible, prove it stays that way). Cancellation itself (stock Medusa Admin order cancel) must also be tested against an order whose payment is still `pending_authorization` and one whose payment is already `captured` — see Open Items, this interaction has a known upstream rough edge.

### 3.3 Pincode validation API
- `GET /store/delivery-area/check?pincode=...` (`apps/backend/src/api/store/delivery-area/check/route.ts`) — used by the storefront address step before allowing checkout to proceed.
- Admin CRUD routes (`apps/backend/src/api/admin/delivery-area/pincodes/route.ts` + `[id]/route.ts`) backing the admin management page (3.4).

### 3.4 Custom admin UI
- **Order detail widget** (`apps/backend/src/admin/widgets/order-payment-verification.tsx`, widget zone `order.details` — the `.before`/`.after` positional suffixes were deprecated as of Medusa 2.17.2 in favor of Layout Configurations and have no effect on 2.21.0, so this targets the current zone name directly rather than the old convention): shows payment state, an admin free-text note field, and a "Mark Payment Verified" button. Also surfaces the derived customer-facing status (§2.7) so admin sees the same label the customer sees. Fulfillment progression itself (Create Fulfillment / Mark as Shipped / Mark as Delivered) uses **stock Medusa Admin UI as-is** — no custom widget needed for that part, per §2.6.
- **Delivery-area management page** (`apps/backend/src/admin/routes/delivery-area/page.tsx`): table + add/remove form for serviceable pincodes.

## 4. Storefront Work

### 4.1 Strip out
- **Stripe, entirely**: `apps/storefront/src/app/api/payment-return/route.ts`; `apps/storefront/src/modules/checkout/components/{payment,payment-container,payment-wrapper,payment-button,payment-test}`; `apps/storefront/src/modules/order/components/payment-details/` (replace with a simplified status display); `@stripe/react-stripe-js`/`@stripe/stripe-js` from `package.json`; the Stripe key in `apps/storefront/src/lib/constants.tsx`; Stripe-specific logic in `apps/storefront/src/lib/data/payment.ts`.
- **Multi-region/locale collapse** (single district, single INR region): flatten `apps/storefront/src/app/[countryCode]/` up one level (drop the dynamic segment); strip country/locale logic from `apps/storefront/src/middleware.ts`; delete `apps/storefront/src/modules/layout/components/{country-select,language-select}/` and their usage in the nav template; collapse `apps/storefront/src/lib/data/regions.ts` and `locales.ts`/`locale-actions.ts` to a single hardcoded region lookup; simplify `localized-client-link` to a plain `Link`.

### 4.2 Build new
- **Phone/OTP + email/password auth UI**: extend `apps/storefront/src/modules/account/components/{login,register}/` with a phone+OTP two-step form calling Medusa's framework-generated `POST /auth/customer/phone-auth` (request) and `POST /auth/customer/phone-auth/callback` (verify) — via the Medusa JS SDK's auth methods, not a bespoke fetch to custom routes — alongside the existing email/password form.
- **Pincode check at address step**: extend `apps/storefront/src/modules/checkout/components/{addresses,shipping-address}/` to call `/store/delivery-area/check`, blocking progression with a clear message if unserviceable.
- **Minimum order value gate**: in the checkout flow, before the payment step, compare cart total to the configured threshold and block with a clear message if under.
- **UPI payment display**: new `apps/storefront/src/modules/checkout/components/upi-payment/` replacing the deleted Stripe step. Unlike the old Stripe step, this runs **after** `completeCartWorkflow` has already created the order — it renders the UPI intent string (§2.4) as a tappable "Pay via UPI app" button on mobile or a QR code on desktop, plus the order number/total for the customer's reference while they pay off-platform, rather than gating order creation on payment.
- **Order status pages**: update `apps/storefront/src/modules/order/templates/` to render the six-state customer-facing label from the shared mapping in §2.7 (Payment Pending → Order Confirmed → Processing → Out for Delivery → Delivered, or Cancelled) instead of raw Medusa payment/fulfillment fields.
- **Materials catalog**: point existing `apps/storefront/src/modules/{categories,store}/` at the real taxonomy; check `product-actions` for stray apparel-specific (size/color) UI and generalize to "pack size."
- **Account/order history**: `apps/storefront/src/modules/account/` reused as-is, only status labels updated.

## 5. Sequencing

1. **Phase 0 — Strip-down & region simplification**: flatten routing, remove Stripe, simplify `middleware.ts`, configure `medusa-config.ts` modules (Auth w/ `auth-emailpass`, Payment w/ `pp_system`, Fulfillment w/ built-in manual provider per §2.6), one INR region + stock location + shipping profile/option, delete the apparel seed. Exit: storefront builds against a Medusa backend with no products, no Stripe/multi-region references remain.
2. **Phase 1 — Catalog & delivery-area module**: build `delivery-area` module + migration; write a new seed script (categories, fixed-pack products/variants/prices/inventory, initial pincode list). Exit: full browse → PDP → cart flow works end-to-end with real data, including the stock-availability checkout test from §2.8.
3. **Phase 2 — Phone/OTP auth**: `phone-otp-auth` Auth Module provider (`authenticate`/`validateCallback`/`register`), `msg91-notification` Notification Module provider, `send-otp` subscriber wiring them together, phone normalization, the Redis-backed cooldown/attempt/rate-limit guards and the per-IP middleware, storefront UI. Exit: customer can register/login via either method, sessions behave identically downstream, and each of the hardening checks (expiry, resend cooldown, max attempts, per-phone/IP limits, single-use OTP, normalization) has an explicit test.
4. **Phase 3 — Pincode & minimum-order checks**: `/store/delivery-area/check` route, minimum-order-value workflow step + storefront gate. Exit: orders below threshold or outside the pincode list can't reach payment, including via direct API calls.
5. **Phase 4 — UPI payment flow & admin verification**: order the checkout steps so `completeCartWorkflow` runs before the UPI QR is shown, build the UPI QR storefront step, `verify-order-payment` workflow (with the authn/authz/state/amount pipeline in §3.2) + admin route + order widget with the derived status (§2.7). Exit: the full §3.2 test matrix passes (unauthenticated, customer-session, duplicate-verify, wrong-amount, cancelled-order, payment-without-order regression), plus the §2.8 pricing and duplicate-submission checks; full order lifecycle works end to end with the customer seeing updated status on next login.
6. **Phase 4b — Fulfillment lifecycle**: build the storefront status-mapping utility (§2.7) and wire order-status pages to it; verify the stock Admin fulfillment actions (Create Fulfillment → Mark as Shipped → Mark as Delivered) work end-to-end against a verified order and that each transition is reflected correctly by the mapping. No new backend code beyond the §2.6 configuration done in Phase 0. Exit: an order can be walked from Payment Pending through Delivered using only stock Medusa Admin actions plus the custom verify-payment action, with the customer-facing labels updating correctly at each step.
7. **Phase 5 — Deploy**: push both apps to Medusa Cloud using Storefronts-on-Cloud (monorepo already in place), configure MSG91 keys, CORS, JWT/cookie secrets, the Next.js Image Optimization workaround (§2.1); load real catalog/prices/pincode list; smoke-test the full flow before go-live, on both desktop and an actual mobile device.

## 6. Open Items / Risks

- **Manual verification without a captured reference** is an operational risk: admin matches orders to bank statement entries by amount/timing only, which gets ambiguous with multiple same-amount orders close together. Worth revisiting post-launch if verification errors become frequent (e.g. an optional free-text UTR field the customer can voluntarily fill in).
- **Manual/system payment provider + order cancellation has a known upstream rough edge** (medusajs/medusa#14214, open at time of writing) around refund/cancellation workflows for non-gateway providers. Must explicitly test in Phase 4: cancelling an order whose payment is still `pending_authorization`, and cancelling one whose payment is already `captured`. If Medusa's core behavior is unsatisfactory, the fallback is a small custom guard in our own cancel path rather than a full custom payment provider.
- **GST/tax** deferred — default tax-inclusive flat pricing for v1; confirm before launch if a shown tax line is actually required.
- **No RBAC on admin actions for v1** — the payment-verification route (§3.2) authorizes on "any authenticated admin," not a specific role/permission. Medusa v2's RBAC exists but is feature-flagged and has open bugs (permission revocation beyond 20 policies, sidebar not respecting permissions) as of the installed version. Revisit only if the business adds multiple admin staff who need different privilege levels (e.g. a warehouse worker who can fulfill but shouldn't verify payments) — not needed for a single-operator admin team.
- **Medusa API surface must be verified against the exact installed version before each phase that touches it — not against blog posts, older tutorials, or memory.** Installed version, confirmed directly (not assumed): `@medusajs/medusa` and `@medusajs/framework` are both **2.21.0** (`apps/backend/package.json` and `node_modules/@medusajs/*/package.json` agree). This version is pinned for the duration of the build; if it's bumped mid-project, redo the checks below for anything touched afterward. Per-surface, checked against 2.21.0's own docs/type definitions at the point the relevant phase starts, not upfront in bulk:
  - Payment provider base class/interface (`IPaymentProvider` shape, session status enum incl. `pending_authorization`) — Phase 0/4.
  - Auth provider APIs (`AbstractAuthModuleProvider`, `authenticate`/`validateCallback`/`register` signatures) — Phase 2.
  - Workflow APIs (`completeCartWorkflow` composition, `capturePaymentWorkflow`) — Phase 0/4.
  - Admin widget zones (`order.details`, confirmed current for 2.21.0 — the older `.before`/`.after` suffixed zones are deprecated as of 2.17.2 and should not be used) — Phase 4.
  - Admin API authentication (how a custom admin route like `/admin/orders/:id/verify-payment` gets the same session guard as built-in admin routes) — Phase 4.
  - Module registration shape in `medusa-config.ts` (Auth/Payment/Fulfillment/Notification `providers` arrays) — Phase 0/2.
  - Fulfillment APIs (manual provider registration, shipping option/profile creation) — Phase 0.
- **Phone-auth hardening goes beyond Medusa's own reference implementation.** Medusa's official phone-auth tutorial does not implement resend cooldown, max attempts, rate limiting, or phone normalization, and stores the OTP signature with only a bare JWT TTL. §3.1's additions (Redis-backed cooldown/attempts/rate-limits, per-IP middleware, normalization, single-use invalidation) are deliberate hardening on top of that baseline — confirm during Phase 2 implementation that these compose cleanly with the `authenticate`/`validateCallback` lifecycle rather than fighting it (e.g. returning the right error shape from `validateCallback` when a Redis-side guard rejects the attempt before JWT verification even runs).
- **Scope expanded beyond this document's original v1 (Materials-only)**: the user's UI reference design (see docs/PROGRESS.md, "UI Redesign") models two more platforms — Labour & Manpower and Engineering Services — confirmed as real intended scope, not just visual decoration. Their storefront pages exist with placeholder data (no backend), sequenced frontend-now/backend-later like every other phase here. Two concrete follow-ups this creates, neither done yet: (1) their "Book"/"Enquire" CTAs all point to `/contact`, which doesn't exist as a route yet; (2) `/categories/[handle]` and `/collections/[handle]` still have the pre-redesign layout, visually inconsistent with the restyled `/store`. Whenever backend work starts for either new platform, it needs its own architecture pass (data model, booking/quote workflow) — this document doesn't cover that yet.

## Verification

- After Phase 0: `<pm> run backend:dev` boots with no errors and no Stripe/region references remain (`grep -ri stripe apps/storefront/src` returns nothing); `<pm> run storefront:dev` renders the home page without a country-code redirect.
- After Phase 1: seed script runs cleanly (`<pm> run backend:seed`); storefront shows real categories/products; add-to-cart works for a fixed-pack variant.
- After Phase 2: register/login via email+password and via phone+OTP both succeed and land the customer in the same authenticated account state; an expired OTP is rejected; requesting a new OTP before the resend cooldown elapses is rejected; exceeding max verification attempts invalidates the current OTP; exceeding per-phone or per-IP request limits is rejected; a successfully-used OTP cannot be reused; `+91XXXXXXXXXX` and the same number without `+91` resolve to one account, not two.
- After Phase 3: attempt checkout with an out-of-area pincode and with a cart under the minimum — both are blocked, including a direct API call to the relevant Store routes (not just the UI).
- After Phase 4: place a full order end-to-end and confirm the order record exists (visible in Admin) *before* completing payment; confirm it shows "Payment Pending"; mark it verified in Admin and confirm the storefront reflects "Order Confirmed" on refresh; attempt to verify the same order a second time and confirm it's rejected as already-verified; attempt to verify with a mismatched amount and confirm it's rejected; call the verify-payment route with no session and confirm 401/403; call it with a customer session and confirm it's rejected; cancel one order pre-verification and one post-verification via Admin and confirm both behave sanely; double-submit checkout on the same cart and confirm only one order is created.
- After Phase 4b: on a verified order, click Create Fulfillment (storefront shows "Processing"), Mark as Shipped (storefront shows "Out for Delivery"), Mark as Delivered (storefront shows "Delivered") — confirm each transition reflects within one refresh and that a fulfillment cannot be cancelled once shipped.
- Inventory concurrency (§2.8): fire two concurrent checkout completions against the last unit of one variant; confirm exactly one succeeds and the other fails cleanly rather than both succeeding or the stock going negative.
- Mobile checkout: run the full browse → OTP login → address/pincode → UPI payment flow on an actual mobile device/viewport; confirm the UPI step renders the "Pay via UPI app" button (not just a QR the customer can't scan with the same phone) and that it correctly opens a UPI app with the amount prefilled.
- After Phase 5 (production deployment): run the same end-to-end flow, including the full fulfillment lifecycle, against the deployed Medusa Cloud backend + storefront; specifically confirm product images render correctly under the Next.js Image Optimization workaround (§2.1), MSG91 delivers a real SMS (not a console-logged OTP), and CORS/cookies work correctly across the real production domains before go-live.
