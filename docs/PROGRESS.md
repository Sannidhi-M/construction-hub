# Progress Log

Tracks what's actually been done against the plan in [ARCHITECTURE.md](./ARCHITECTURE.md), phase by phase. Append an entry at the end of each phase.

## Phase 0 — Strip-down & region simplification (done)

**Backend**
- Rewrote `initial-data-seed.ts`: seeds store "Construction Hub" (INR), region "Karnataka" (country `in`), stock location "Construction Hub Yard" (Davangere), a shipping profile + ₹0 "Business Delivery" option on the built-in manual fulfillment provider. No products yet — catalog is Phase 1.
- Confirmed (by reading Medusa 2.21.0's own `defineConfig` source, not docs) that `medusa-config.ts` needs no explicit `modules` entry — `auth-emailpass`, the manual fulfillment provider, and the system payment provider (`pp_system_default`) are all auto-registered by Medusa's own defaults.
- Reset the local dev DB (dropped the old apparel/Europe demo data), reseeded, and cleaned up two rows Medusa's bootstrap auto-creates before a seed runs (a duplicate default store, a duplicate default publishable API key).
- Verified: `medusa db:migrate` clean, seed runs clean, backend boots with no errors.

**Storefront**
- Removed Stripe entirely (components, deps, lockfile, `.env.local` key) — `grep -ri stripe src` returns nothing.
- Flattened `[countryCode]` routing to a single hardcoded India/INR region — `grep -rn countryCode src` returns nothing.
- Fixed the publishable API key in `.env.local` (stale after the DB reset) and the leftover "Medusa Next.js Starter Template" page title.
- Verified end-to-end: backend + storefront booted together, home page returns 200 with real Store API calls succeeding (regions/collections/categories).

**Known, deliberately not fixed here — a pre-existing React 18 (workspace root) vs React 19 (`apps/storefront`) version split.** Root cause: `next` is declared only in the storefront but hoists to the monorepo root's `node_modules` (nothing else needs it); Next's own `.d.ts` files then resolve `react`/`@types/react` starting from *that* location, finding the backend's React 18 types instead of the storefront's own nested React 19 — two conflicting copies of the global React type identities in one compile. Confirmed pre-existing (reproduced on a disposable worktree at the pre-Phase-0 commit `6decebc`, before any of this session's changes). The real fix is npm's `install-strategy=nested` (separate dependency tree per workspace) — correct, but roughly doubles `node_modules` size and changes install behavior repo-wide; deliberately not applied.

This has two distinct symptoms, of different severity:
- **Cosmetic**: ~309 `tsc --noEmit` errors (editor red squiggles), all traced to this one root cause. Allowlisted in [`apps/storefront/.typecheck-known-issues.txt`](../apps/storefront/.typecheck-known-issues.txt) so `scripts/check.sh` only fails on a genuinely *new* type error, not this known set.
- **Real, not cosmetic**: `next build`'s static-export step fails prerendering `/404` with a minified React error #31 ("invalid element" — the classic symptom of two React module instances disagreeing on element identity). Confirmed via the same disposable-worktree test that this predates Phase 0. `next dev` is unaffected (verified working end-to-end). This will block a real production build/deploy and needs a real fix before Phase 5 (deployment) — likely `install-strategy=nested`, or isolating `next`'s resolution some other way. Tracked here, not fixed yet.

**Added `scripts/check.sh`** — the pre-push sanity check going forward. Runs: backend type-check (must be clean), storefront type-check (diffed against the known-issues allowlist above — new errors fail it), storefront build (fails only on a real compile/syntax error; warns without failing on the known prerender issue above). Verified the gate actually catches regressions: injected a real syntax error and a real new type error in testing, both were correctly flagged and failed the check.

**Not done yet (later phases per §5):** product catalog, delivery-area module, phone/OTP auth, pincode/minimum-order checks, UPI payment flow, admin verification, fulfillment-lifecycle wiring, deployment (must resolve the `next build` prerender issue above before this phase).

## Setup audit (done)

Full pass over the dev environment to catch mistakes before building further:
- Verified all workspace dependencies install cleanly (`npm install`, no missing/invalid packages).
- Removed `.npmrc`'s `auto-install-peers=true` — a pnpm-only setting (leftover from the original scaffold, which also had a dead `pnpm.overrides` block in `package.json`, already removed in Phase 0), meaningless under this project's actual package manager (npm) and just spamming a warning on every command.
- Checked npm's blocked postinstall scripts (`@swc/core`, `esbuild`, etc. — npm 11's script-approval gate) — confirmed both actually load correctly via prebuilt platform binaries, so nothing is silently broken; left denied (the safer default, no reason to approve arbitrary postinstall scripts without cause).
- Confirmed backend lint (`medusa lint`) and storefront lint (`next lint`) both run; storefront lint surfaced real, fixable issues:
  - Removed three fully dead, fully-commented-out stub functions (`applyGiftCard`, `removeDiscount`, `removeGiftCard`) — gift cards/discounts aren't in v1 scope, nothing called them.
  - **Found and fixed a real regression from the Phase 0 storefront flattening**: `setAddresses` in `lib/data/cart.ts` still redirected to a country-code-prefixed path (`/${country_code}/checkout?step=delivery`) built from form data — missed because Phase 0's cleanup grepped for the `countryCode` identifier, not this form-field-derived string. Swept the whole storefront for the same pattern afterward; nothing else found. Fixed to `/checkout?step=delivery` (the step name itself, `delivery`, was already correct).
  - Replaced two `catch (e: any)` blocks with proper error narrowing.
- Fixed a stale onboarding path in `apps/backend/.env` (still pointed at the pre-rename `medusa-shop` folder name; local-only file, not committed to git).
- Confirmed Jest is correctly wired (`apps/backend`) — it currently reports "no tests found," which is expected since no custom modules exist yet to test.
- Re-ran `./scripts/check.sh` after all fixes — passes clean.

## Phase 1 — Catalog & delivery-area module (done)

**Delivery-area module** (§2.3/§3.3): `delivery-area` module with a `ServiceablePincode` model (pincode unique, area_label, is_active) and `isServiceable(pincode)` on its service. Registered in `medusa-config.ts`, migration generated and applied. Routes: `GET /store/delivery-area/check?pincode=...` (storefront gate, built next) and admin CRUD (`GET`/`POST /admin/delivery-area/pincodes`, `POST`/`DELETE .../:id`). Mutations run through workflows (`create`/`update`/`delete-serviceable-pincode`, each with compensation) rather than calling the service directly from route handlers — the project's own `@medusajs/eslint-plugin` flagged the direct-call pattern, so this is the idiomatic fix, not a style preference. Verified against a running backend: full CRUD cycle, serviceability reflecting `is_active`, soft-delete (not hard-delete), 400 on a missing pincode, 401 on an unauthenticated admin request.

**Catalog seed**: real business data (product catalog + Davangere pincode list) supplied directly, with a few gaps filled in deliberately rather than guessed:
- **Pincodes**: 42 unique, deduplicated from the business's list. One pincode (581119, Ranebennur/Haveri district) was dropped — outside the single-district scope this plan assumes.
- **Sand's data shape**: the business wanted "Product: Sand → Variant: M-Sand/P-Sand/Dust → a further wheeler-size choice under that." Medusa doesn't have a third level under a variant — a variant *is* the full combination of a product's options. Modeled as two independent options instead (`Type`: M-Sand/P-Sand/Dust, `Load Size`: 6/8/10-wheeler), so each Type×Load-Size combination becomes its own variant (e.g. "M-Sand / 6-Wheeler Load") — same customer-facing choice, standard Medusa shape.
- **Unpriced placeholders, left for Admin to fill in**: SK Steel, JSW Steel, all 9 Sand variants, all 3 Crushed Stone/Aggregate variants (bulk materials are sold by negotiated truck-load, no fixed rate existed in the source data).
- **Named placeholders** (source data had a rate but no label): "Steel (Standard)" for an unbranded ₹66/kg row; "Size 1"/"Size 2" for the two unlabeled concrete-block prices (₹48/₹52).
- **Tiles**: seeded as an empty category (so it shows in nav) — the source catalog had no tile products at all.
- 15 products, 21 variants total across 6 categories.

**Found and fixed two real bugs during verification** (not just type-checked — actually browsed every category and product page against a live backend):
- Medusa's auto-slugified handle keeps literal `/` and `&` from a product/category name. `/` turns one URL path segment into two (`Aggregates/Jelly` → 404 via a broken nested path); `&` 404s the route outright (`Steel & TMT Bars`, `Bricks & Blocks`, `Clay / Mud Bricks`, `Crushed Stone / Aggregate`). Fixed with an explicit `toHandle()` slugifier applied to every category and product, not just the ones caught in this pass — so a future catalog addition with a `/` or `&` in its name doesn't silently repeat this.
- The core Medusa loader that auto-provisions a default store/sales-channel/publishable-key on first boot (see Phase 0 note above) kept leaving stray rows behind on every reseed, requiring manual SQL cleanup each time. Made the seed script self-cleaning: it now finds and deletes ("Medusa Store"/"Default Sales Channel"/"Default Publishable API Key") before creating its own, revoking the API key first (Medusa refuses to delete an unrevoked key).

Verified end-to-end against a live backend + storefront: all 6 category pages and all 15 product pages return 200; a real price (₹330, Ultratech Cement) resolves through the pricing pipeline for the seeded region; the pincode check returns `true` for a serviceable pincode and `false` for the dropped one (581119).

**Not done yet:** the storefront's pincode-check UI at the checkout address step (§4.2) — the backend endpoint exists and is verified, but nothing in the storefront calls it yet. That's next.
