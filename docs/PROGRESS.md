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
