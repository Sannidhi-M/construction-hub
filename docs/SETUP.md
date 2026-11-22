# Setup

How to run Construct Mitra on a new machine, from a clean clone to a working shop with Admin. Read `AGENTS.md` next for conventions and the full command list, and `docs/ARCHITECTURE.md` for why things are built this way.

## You need

- Node `^20.19.0` or `>=22.12.0` and npm (the repo uses npm; do not add a second lockfile).
- PostgreSQL 15 or newer, running locally.
- Redis, running locally. The phone-login rate limits use it (`REDIS_URL`), so signing in fails without it.

## 1. Install

```bash
git clone <repo-url> construction-hub
cd construction-hub
npm install            # always from the repo root
```

## 2. Backend

```bash
createdb medusa-backend                 # or any name; it goes in DATABASE_URL
cd apps/backend
cp .env.template .env
```

Edit `apps/backend/.env`: set `DATABASE_URL` (for example `postgres://USER:PASSWORD@localhost:5432/medusa-backend`) and change `JWT_SECRET` and `COOKIE_SECRET` from `supersecret`. Leave `PHONE_OTP_PROVIDER` and the `MSG91_*` values empty for development: the login code is then printed in the backend console instead of being texted.

```bash
npx medusa db:migrate                   # creates every table, including the custom modules
npx medusa exec ./src/scripts/seed-labour-services.ts
npx medusa user -e you@example.com -p a-strong-password
```

`db:migrate` also runs `src/migration-scripts/initial-data-seed.ts` once: the store, region, shipping, product catalog and the pincode allowlist. It is not safe to run against a non-empty database. The labour services script is safe to repeat.

## 3. Storefront

```bash
cd ../storefront
cp .env.template .env.local
```

Start the backend (step 4), sign in to Admin, then copy the key from **Settings -> Publishable API Keys** (the seed creates "Default Publishable API Key") into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Without it every storefront request fails with a publishable-key error rather than a clear 401. The other variables are documented in the template.

## 4. Run

From the repo root, in two terminals:

```bash
npm run backend:dev        # http://localhost:9000, Admin at http://localhost:9000/app
npm run storefront:dev     # http://localhost:8000
```

Sign in to Admin with the user from step 2. To log in to the storefront in development, enter any valid 10-digit mobile number; the 6-digit code appears in the backend terminal. To use Firebase instead, see `docs/ARCHITECTURE.md` section 3.1 and set the matching variables on both sides.

## 5. Before every commit

```bash
./scripts/check.sh
```

It type-checks both apps, builds the storefront and compares the lists that must match in both apps. It overwrites the storefront's `.next` folder, so stop the storefront dev server first, then `rm -rf apps/storefront/.next` afterwards and restart it. A static-export error at the end of the build is known and does not fail the check.

## Things that look like bugs but are not

- **Admin asks you to sign in again after a backend restart.** Sessions are kept in memory (no `redisUrl` is configured). Fix before production.
- **Uploaded photos disappear on a fresh deploy.** Uploads go to `apps/backend/static/`. Production needs cloud file storage.
- **Storefront returns 500s after a build or `check.sh`.** A stale `.next`; remove it and restart.
- **"Address already in use" on port 9000.** An old `medusa develop` process is still running; find it with `lsof -i :9000` and stop it.
- **The storefront type-check reports hundreds of errors.** They are the known React-types noise listed in `apps/storefront/.typecheck-known-issues.txt`; only errors not in that file matter.
- **`npm run backend:seed` does nothing.** The backend defines no `seed` script; seeding happens in `db:migrate` as above.

## Where the money and the leads go

- Materials orders appear in Admin -> Orders. There is no payment gateway: the customer pays by UPI QR or cash and the owner verifies receipt in the order's payment widget.
- Labour bookings, quote requests and contact messages are leads in their own Admin pages. The owner follows each up by phone and moves its status along.
