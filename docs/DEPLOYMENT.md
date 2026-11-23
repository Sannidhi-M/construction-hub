# Deployment runbook

How to put Construct Mitra on its server and keep it running. The reasoning behind this setup (why a VPS, risks, costs) is in [DEPLOYMENT-PLAN.md](DEPLOYMENT-PLAN.md); this file is the step-by-step.

Everything runs on one server with Docker Compose (`deploy/docker-compose.yml`):

| Container | What it is | Reachable from the internet? |
|---|---|---|
| `caddy` | Front door: HTTPS certificates and routing | Yes (ports 80, 443) |
| `storefront` | The shop, `https://constructmitra.in` | Only through Caddy |
| `backend` | API and Admin, `https://api.constructmitra.in` (Admin at `/app`) | Only through Caddy |
| `postgres` | The database | No |
| `redis` | Sessions, events, rate limits | No |

Data that must survive lives in Docker volumes, not in the containers: `pgdata` (database), `redisdata`, `static` (photos), `private` (CSV exports/imports), `caddy_data` (certificates). Rebuilding or replacing a container never touches them.

All commands below run from the `deploy/` folder unless stated.

---

## 1. Rehearsal on the Mac (do this first)

The goal is to try every step once where a mistake costs nothing.

1. Install **Docker Desktop** for Mac (docker.com) and start it.
2. Make sure the code to rehearse is committed (`deploy.sh` refuses uncommitted changes).
3. Create the rehearsal settings: `cp .env.production.template .env`, then edit `deploy/.env`:
   - `SITE_DOMAIN=constructmitra.localhost` and `API_DOMAIN=api.constructmitra.localhost` (browsers send `*.localhost` to your own Mac; Caddy gives them a self-made certificate, so expect a one-time browser warning).
   - `BACKUP_DIR=/Users/<you>/cm-backups`
   - Any long random values for `POSTGRES_PASSWORD`, `JWT_SECRET`, `COOKIE_SECRET` (`openssl rand -hex 32`).
   - The rest from `apps/backend/.env` and `apps/storefront/.env.local` (publishable key, Firebase, UPI).
4. Load your data (database dump and photos zip, see section 2 step 6 for how they're made):
   ```bash
   ./restore.sh ~/Desktop/constructmitra-db.dump ~/Desktop/constructmitra-static.zip
   ./rewrite-file-urls.sh
   ./deploy.sh
   ```
5. Check, and note anything odd:
   - https://constructmitra.localhost: home shows Platforms 1-3, product photos load.
   - https://api.constructmitra.localhost/app: Admin login works. Run `docker compose restart backend`, reload: still logged in.
   - An order with UPI and with cash. Phone login needs `constructmitra.localhost` added to Firebase -> Authentication -> Settings -> Authorized domains (remove it afterwards).
   - In the Admin, export products. The file must be in `private`, and its link must give 404: `docker compose exec backend ls private`.
   - `./backup.sh`, then `./restore.sh <that db dump> <that files tgz>` and `./deploy.sh`: everything comes back.
   - Make a trivial commit, `./deploy.sh`, then `./rollback.sh <previous tag>` (tags are in `.deploy-history`).
6. Tidy up: `docker compose down` (keeps the data) or `docker compose down -v` (deletes the rehearsal data too).

---

## 2. First deploy to the server

### Owner: buy and point
1. **Buy the VPS**: Hostinger KVM 2, location India, operating system **Ubuntu 24.04**. During setup, add your **SSH public key** (on the Mac: `cat ~/.ssh/id_ed25519.pub`; create one with `ssh-keygen -t ed25519` if missing). Note the server's IP address.
2. **DNS** in Hostinger -> Domains -> constructmitra.in -> DNS records. Add or edit **A records only**:

   | Type | Name | Points to |
   |---|---|---|
   | A | `@` | server IP |
   | A | `www` | server IP |
   | A | `api` | server IP |

   **Do not touch the MX, SPF (TXT) or DKIM records** — they run the Zoho mailbox.

### Prepare the server
3. Log in and run the setup script once:
   ```bash
   ssh root@<server-ip>
   curl -fsSL https://raw.githubusercontent.com/Sannidhi-M/construction-hub/main/deploy/server-setup.sh -o setup.sh
   bash setup.sh
   ```
   (If the repository is private, copy the file over instead: `scp deploy/server-setup.sh root@<server-ip>:setup.sh`.)
   When it finishes, **in a new terminal** check `ssh deploy@<server-ip>` works before closing the root session. From now on, log in as `deploy`.
4. Get the code onto the server as `deploy`. For a private repository, create a read-only deploy key first:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github -N ""   # then add ~/.ssh/github.pub on GitHub:
   # repo -> Settings -> Deploy keys -> Add (read-only)
   printf 'Host github.com\n  IdentityFile ~/.ssh/github\n' >> ~/.ssh/config
   git clone git@github.com:Sannidhi-M/construction-hub.git
   ```
5. Settings: `cd construction-hub/deploy && cp .env.production.template .env && nano .env`. Fill every value; generate new secrets with `openssl rand -hex 32`. **Never reuse the development secrets.**

### Move the data
6. On the Mac, first delete test customers and test orders in the Admin, then make the two files (already made once, on the Desktop, if you skipped the clean-up — redo them after cleaning):
   ```bash
   pg_dump -Fc --no-owner --no-acl medusa-medusa-shop -f ~/Desktop/constructmitra-db.dump
   cd apps/backend && zip -r ~/Desktop/constructmitra-static.zip static
   ```
   Copy them up: `scp ~/Desktop/constructmitra-db.dump ~/Desktop/constructmitra-static.zip deploy@<server-ip>:`
7. On the server, **in this order** (restore before the first migration; see DEPLOYMENT-PLAN.md "Database"):
   ```bash
   ./restore.sh ~/constructmitra-db.dump ~/constructmitra-static.zip
   ./rewrite-file-urls.sh
   ./deploy.sh
   ```
   Then delete the two files from the server and the Mac Desktop (they hold customer data).

### Finish
8. Check everything in the list under section 1 step 5, on the real domains, from a phone.
9. **Admin account:** sign in, change the password to a long unique one (and the email to a real one). The development password must not survive.
10. **Firebase:** Authentication -> Settings -> Authorized domains: add `constructmitra.in`. Set the public-facing name to "Construct Mitra". Turn on billing (Blaze) for real SMS.
11. **Nightly backups:** `crontab -e` and add
    ```
    30 2 * * * /home/deploy/construction-hub/deploy/backup.sh >> /var/backups/constructmitra/backup.log 2>&1
    ```
    Optional but recommended: a free healthchecks.io check (put its URL in `HEALTHCHECK_PING_URL`) emails you if a backup fails or doesn't run; `rclone config` a Google Drive remote and set `RCLONE_REMOTE` for a weekly off-server copy.
12. **Uptime alerts:** a free UptimeRobot account watching `https://constructmitra.in` and `https://api.constructmitra.in/health`.
13. Check Zoho mail still arrives at info@constructmitra.in.

---

## 3. Everyday operations

**Deploy a new version**
```bash
cd ~/construction-hub && git pull && ./deploy/deploy.sh
```
It backs up, builds, runs database migrations, starts the new version and checks the site. Changing anything in `deploy/.env` also needs a deploy (the storefront's settings are compiled in).

**Something broke after a deploy — roll back**
```bash
cat deploy/.deploy-history                 # find the previous tag
./deploy/rollback.sh <tag>                  # app only, seconds
```
If the new version damaged data (rare; usually a bad migration), restore the backup taken just before it. Note any orders placed since then first — they'll be gone:
```bash
ls -t /var/backups/constructmitra | head    # the newest *-pre-deploy files
./deploy/rollback.sh <tag> --restore-db /var/backups/constructmitra/db-...-pre-deploy.dump
```

**Restore from a nightly backup** (e.g. after a mistake in the Admin)
```bash
./deploy/restore.sh /var/backups/constructmitra/db-<date>-nightly.dump [/var/backups/constructmitra/files-<date>-nightly.tgz]
./deploy/deploy.sh
```

**Get an Admin CSV export** (the Admin's download link deliberately doesn't work in production)
```bash
docker compose -f deploy/docker-compose.yml exec backend ls -t private | head -3
docker compose -f deploy/docker-compose.yml cp backend:/repo/apps/backend/.medusa/server/private/<file> ~/
# then on the Mac: scp deploy@<server-ip>:<file> .
```

**Logs**
```bash
cd deploy && docker compose logs --tail 200 backend      # or storefront, caddy, postgres
docker compose ps                                         # what's running and healthy
```

**Monthly check (10 minutes)**
- `docker compose ps`: everything "healthy" / "running".
- `df -h /`: disk under 70%.
- `ls -lt /var/backups/constructmitra | head`: last night's backup exists.
- `sudo apt list --upgradable`: security updates install automatically; reboot (`sudo reboot`) if the login message says "System restart required". The site comes back by itself.
- Hostinger: VPS and domain renewals are paid.
