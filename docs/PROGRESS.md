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

**Known, deliberately not fixed here:** a pre-existing React 18 (workspace root) vs React 19 (`apps/storefront`) version split causes ~309 cosmetic `tsc --noEmit` errors. Doesn't affect the actual Next.js build/runtime; unrelated to this phase's work.

**Not done yet (later phases per §5):** product catalog, delivery-area module, phone/OTP auth, pincode/minimum-order checks, UPI payment flow, admin verification, fulfillment-lifecycle wiring, deployment.
