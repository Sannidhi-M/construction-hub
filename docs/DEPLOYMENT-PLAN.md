# Deployment & hosting plan — Construct Mitra

Decided 2026-11-23, revised the same day after review. Status: Mac rehearsal run 2026-11-24 (findings below); deploy/rollback script run pending a commit. Step-by-step runbook: `docs/DEPLOYMENT.md`.

## Context
The store runs only on the owner's Mac today: local Postgres, local Redis, photos in
`apps/backend/static/`. It needs to go live at `constructmitra.in` (Hostinger domain,
Zoho mail). The owner proposed Medusa Cloud. Constraints from the owner: **pays only with
Indian card/UPI**, **budget under ₹1,500/month**.

## Why not Medusa Cloud (answer to the owner's question)
- Medusa Cloud says it can't accept credit cards from Indian banks (RBI recurring-payment rules).
  Only Launch ($99/mo) and above allow bank transfer instead.
- The $29 Develop plan has no Redis and no custom storefront domain. This code needs Redis:
  `apps/backend/src/lib/redis.ts` handles OTP and rate limits.
- So the real minimum is $99/mo (~₹8,500+), paid by international wire. That's well over budget.
  It's a good option later if the business grows; the code stays portable.

## Recommendation: one Hostinger VPS (India data centre, billed in INR/UPI)
- **Plan:** Hostinger KVM 2 (2 vCPU, 8 GB RAM), about ₹799/mo on a long first term. Renewal is
  higher (reported around ₹1,199), so confirm on hostinger.in. Same account as the domain.
- **Runs everything with Docker Compose on one server:**
  - Postgres 16
  - Redis
  - Medusa backend (built with `medusa build`, run from `.medusa/server`)
  - Next.js storefront (`next build` + `next start`)
  - Caddy as the front door, with automatic HTTPS
- **Addresses:**
  - `constructmitra.in` and `www` serve the storefront.
  - `api.constructmitra.in` serves the backend and the Admin (`/app`).
- **Photos:** stay on the server disk (Medusa's local file provider). No extra provider or card
  needed.
  - Why this is safe here: the earlier "photos get lost" warning was about hosts with throwaway
    disks (Medusa Cloud, Railway and similar wipe files on every redeploy). A VPS disk is
    permanent and survives restarts and reboots.
  - The one real trap: `static/` must be a **Docker volume** (persistent folder) mounted into the
    backend container, never baked into the image. Otherwise rebuilding the container wipes it.
  - Remaining risks are a dead server (covered by the nightly and off-server backups below) and
    running on a single server (fine at this size).
  - Move to cloud storage (Cloudflare R2/S3) later only if needed: more than one server, a host
    with throwaway disks, or very large photo volume. It's a config change plus a one-time copy.
  - Fixes needed:
    - Set the file URL to `https://api.constructmitra.in/static`.
    - Rewrite the existing photo URLs from `http://localhost:9000/static/...`.
    - **Private files (Admin CSV exports/imports) go outside `static/` entirely.** See "Securing
      private files" below. That's by design, not only a proxy rule.
- **Backups:**
  - Hostinger's included weekly snapshot.
  - A nightly cron job: `pg_dump` plus a tar of `static/`, keeping 7 days on the server.
  - A weekly off-server copy to the owner's Google Drive (rclone), so a dead server doesn't lose
    data.

## Securing private files (review item 1)
Checked in Medusa's source (`@medusajs/file-local/dist/services/local-file.js`, and
`@medusajs/framework/dist/http/express-loader.js:159`):
- The local provider saves private files (exports, imports) **inside `static/`** with a
  `private-<timestamp>-` prefix. Its "download link" for them is just the public `/static/...`
  URL. The backend serves all of `static/` with `express.static`, and its own code comment says
  the local provider is for development.
- **Fix, by design:**
  - Set the file module's `private_upload_dir` to a separate volume **outside** `static/`
    (`private/`, next to `static/`). `express.static` then can't serve those files under any
    URL trick (`%70rivate`, `//`, `./`, case changes).
  - Imports keep working, because Medusa reads them from disk by key, not over HTTP.
  - Second layer: Caddy returns 404 for any path containing `private-`.
  - Third layer: the backend port 9000 is **not published**, so it's reachable only through Caddy.
- **Trade-off:** in production the Admin's "download export" link won't work (404). An export
  can still be fetched from the server with one runbook command. Fine for a small store; the
  real fix later is S3-compatible storage with signed links (Medusa's production
  recommendation).
- **Verify in rehearsal:**
  - Run a product export and confirm the file lands in `private/`, not `static/`.
  - The returned URL, `/static/private-*`, and encoded or odd-path variants all return 404,
    through Caddy and from inside the network.
  - A CSV product import still succeeds.
  - Photos still load.

## Database: restore, migrate and seed order (review item 2)
Checked: Medusa records each one-shot script in the `script_migrations` table. The Mac database
already has `initial-data-seed.ts` recorded (run 2026-09-20), and the seed also skips if a store
exists.
1. Create the empty production DB. **Do not run `db:migrate` first:** on an empty DB it would run
   the seed and then clash with the restore.
2. `pg_restore` the Mac dump (after deleting test customers and orders on the Mac copy).
3. Run `medusa db:migrate`. It applies only migrations newer than the dump and skips scripts
   already recorded, so the seed is skipped.
4. Every later deploy runs `db:migrate` automatically, before the new version starts. Future
   migrations stay enabled.
- **Verify in rehearsal:** after step 3, the `script_migrations` and product/region counts are
  unchanged, and no second store or sales channel exists.

## Redis in production (review item 3)
`REDIS_URL` alone only feeds our own OTP and rate-limit client (`src/lib/redis.ts`). Medusa's
modules are registered explicitly in `medusa-config.ts`, only when `REDIS_URL` is set:
- `projectConfig.redisUrl`: Admin sessions.
- `@medusajs/medusa/event-bus-redis` with `{ redisUrl }`.
- `@medusajs/medusa/workflow-engine-redis` with `{ redis: { redisUrl } }`. The option names were
  checked in the installed 2.21 types.
- `@medusajs/medusa/locking` with the `@medusajs/medusa/locking-redis` provider as default
  `{ redisUrl }`.
- Redis runs with append-only persistence (AOF) on a volume, so sessions and in-flight workflow
  state survive a restart.
- **Verify:**
  - Startup logs show the Redis modules loaded and no "in-memory" warnings.
  - Admin stays logged in across a backend restart.
  - Placing an order still fires the order-placed subscriber.

## Deploy and rollback (review item 4)
- Each deploy builds images tagged with the git commit; the previous two tags are kept.
- `deploy/deploy.sh` does, in order:
  1. Back up the database and `static/` (pre-deploy).
  2. Build the new images.
  3. Run `db:migrate` in a one-off container.
  4. Start the new version.
  5. Check health (`/health` and the home page). If it fails, it stops and prints the rollback
     command.
- `deploy/rollback.sh <tag>`:
  - **App-only failure** (no migration ran, or the migration is harmless): restart the previous
    image tag. That takes seconds.
  - **Migration or data problem:** stop the apps, restore the pre-deploy database dump (and
    `static/` if needed), start the previous tag.
  - Medusa migrations aren't reliably reversible, so the dump is the safety net. Hostinger's
    snapshot is the last resort for a broken server.
- **Verify in rehearsal:** deploy version A, deploy B, then roll back to A both ways (app-only,
  and with a DB restore). The data and the logged-in Admin come back.

## Code changes (small, in repo)
1. `apps/backend/medusa-config.ts`:
   - Redis modules as above.
   - The file module: local provider with `backend_url` from env and `private_upload_dir`
     outside `static/`.

   Without `REDIS_URL`, local dev keeps working as today.
2. Add Dockerfiles for backend and storefront, `deploy/docker-compose.yml`, `deploy/Caddyfile`,
   `deploy/.env.production.template` (names only, no secrets), `deploy/deploy.sh`,
   `deploy/rollback.sh` and backup scripts.
3. Seed safety: rely on `script_migrations` plus the documented order above. No code change
   needed.
4. Untrack `apps/storefront/tsconfig.tsbuildinfo` (generated file).
5. Docs: a `docs/DEPLOYMENT.md` runbook with first deploy, updating, rollback, restore from backup,
   fetching an export, and logs. Update `LAUNCH-CHECKLIST.md` and `docs/DEPLOYMENT-PLAN.md`.

## Owner's to-do (outside the code)
- Buy the VPS (Ubuntu 24.04, India location). Share the SSH access method with me, or run the
  commands I give.
- DNS in Hostinger:
  - A records: `@`, `www` and `api` → VPS IP.
  - **Keep the Zoho MX/SPF/DKIM records untouched.**
- Firebase:
  - Add `constructmitra.in` to Authorized domains.
  - Set the public-facing name to "Construct Mitra".
  - Turn on billing (Blaze) for real SMS beyond 10/day.
- Production values: new long random `JWT_SECRET` and `COOKIE_SECRET` (I generate them on the
  server), UPI VPA/payee, `NEXT_PUBLIC_BASE_URL=https://constructmitra.in`, and CORS set to the
  real domains.
- Change the Admin password from the dev one, and use a real Admin email.
- Decide which data goes live: copy the Mac database (products and labour services) but **delete
  test customers and orders first**, or start clean and re-enter the catalogue. Recommended: copy,
  then clean.

## SRE review: known gotchas and how each is covered
| Risk | Mitigation in this plan |
|---|---|
| Photos wiped when a container is rebuilt | `static/` and Postgres data are Docker volumes; tested by rebuilding during rehearsal |
| 20 stored photo URLs say `localhost:9000` (`image.url` 8, `product.thumbnail` 3, `labour_service.image_url` 9) | One scripted SQL rewrite to `https://api.constructmitra.in/static/…`, run after restore, counts checked |
| Storefront `NEXT_PUBLIC_*` and Admin backend URL are baked in at build time | Build with production env values; rebuild whenever they change (runbook says so) |
| Docker logs grow until the disk fills | Log size limits (`max-size`/`max-file`) on every container |
| Server disk full or down, nobody notices | Free UptimeRobot checks on site and API (email alert); disk-usage alert in the nightly cron |
| Data loss from a dead server or a bad change | Nightly `pg_dump` + photos tar, weekly copy to Google Drive, Hostinger snapshot; **restore actually tested once** |
| Break-ins | SSH key only (password login off), firewall open only on 22/80/443, Postgres/Redis never exposed, automatic security updates, strong Admin password |
| HTTPS certificates expiring | Caddy renews automatically |
| Admin logged out on restart | Redis sessions (`projectConfig.redisUrl`) |
| Admin CSV exports downloadable | Private files stored outside `static/`; Caddy blocks `private-`; port 9000 not published |
| Seed re-running on live data | Restore before migrate; `script_migrations` already records the seed |
| A bad deploy or migration | Pre-deploy backup, tagged images, `rollback.sh` (rehearsed) |
| Out of memory during builds | KVM 2 (8 GB); add 2 GB swap. Not KVM 1 (4 GB) |
| Breaking Zoho email while editing DNS | Only add or change A records `@`, `www` and `api`; MX/SPF/DKIM untouched; mail checked after |
| Deploy goes wrong on launch day | Two rehearsals first (below) |

**Rehearsals so nothing is first-tried in production:**
1. Run the whole Docker Compose stack on the owner's Mac (Docker Desktop) with a copy of the
   database. Check photos, login, an order, a rebuild that keeps photos, and backup and restore.
2. First deploy to the VPS **before launch**, while there are no real customers: a full
   walk-through on the real domain, then clean test data, then announce.

**Honest limits:** a single server means hardware or host trouble takes the site down until it's
restored. That's minutes to hours, and it's acceptable for a new local store. The owner (with me)
owns maintenance: a monthly check of updates, backups and disk via a short runbook.

## Rehearsal findings (2026-11-24, Docker on the Mac)
Each was fixed and re-tested; none would have been caught without running the real stack.

| Found | Effect if missed | Fix |
|---|---|---|
| The one-time seed ran again on restored data: Medusa remembers scripts by file name, `.ts` in development but `.js` in the production build | A second store and sales channel in the live database | Seed skips when a region exists; `restore.sh` records the `.js` names as done |
| Medusa uses SSL for any non-`localhost` database | Backend couldn't connect (timeout) | `?sslmode=disable` on the private Docker network |
| App files owned by root, app runs as `node` | Migrations and Next.js cache failed with EACCES | Files copied with `--chown=node:node` |
| Product/category/collection pages marked static when built without the backend | Every product page: error 500 | Pages declared `force-dynamic` (they read cart cookies) |
| Storefront's server-side calls all came from one IP | Per-IP limits (OTP 20/h, contact form 5/h) shared by all customers | Storefront forwards the visitor's IP; Caddy's header can't be spoofed; storefront talks to the backend on the private network |
| `next.config.js` checks settings again at start | Storefront wouldn't start | Same public settings passed at build and run time |

Verified working: all pages through HTTPS, photos, Admin login, Admin session survives a backend restart, private exports unreachable by any URL variant, per-visitor rate limits with spoof protection, backup -> deliberate data loss -> restore.

## Estimated monthly cost (incl. 18% GST, approximate; confirm prices at purchase)
| Item | Cost |
|---|---|
| Hostinger KVM 2 VPS, first term (needs a long term paid upfront, e.g. 24 months) | ~₹940/mo (₹799 + GST) |
| Same VPS after renewal | ~₹1,400/mo (around ₹1,199 + GST, to be confirmed) |
| Domain `constructmitra.in` (already paid, renews ₹899/yr) | ~₹90/mo |
| Zoho Mail, Caddy HTTPS, UptimeRobot, Google Drive backups (15 GB free) | ₹0 |
| Firebase SMS for OTP login (Blaze, pay per SMS) | depends on logins; check the India rate before enabling |
| **Total** | **~₹1,050/mo now; ~₹1,500/mo after renewal, plus SMS** |

## Verification
- `curl https://api.constructmitra.in/health` returns 200. HTTPS is valid on all three hostnames.
- Storefront: home shows Platform 1, 2 and 3; product photos load; place a UPI order and a COD
  order with a real phone OTP.
- Admin: log in at `https://api.constructmitra.in/app`; restart the backend container and you are
  still logged in (Redis sessions).
- `https://api.constructmitra.in/static/private-<anything>.csv` returns 403/404.
- Zoho mail still receives at `info@constructmitra.in` after the DNS change.
- Run the backup script once, restore it into a scratch database, and confirm the row counts.
