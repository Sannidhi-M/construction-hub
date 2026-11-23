# Launch checklist

What is still needed before Construct Mitra runs as a real business. The code for these pages and features exists; most items are business details, compliance and settings. Tick items off here as they are done.

## Business details and compliance

- [ ] **Footer business details.** Registered legal name, GSTIN, full address and business type: set `NEXT_PUBLIC_SITE_LEGAL_NAME`, `NEXT_PUBLIC_SITE_GSTIN` and `NEXT_PUBLIC_SITE_ADDRESS` in the storefront env (the footer and grievance page show them only when set). Payment-gateway KYC and the E-Commerce Rules need them.
- [ ] **Grievance Officer.** Currently "Grievance Officer, Construct Mitra". The Rules expect a named person.
- [ ] **Lawyer review** of all legal pages, especially Labour Terms and Engineering Terms (liability), and the free-service paragraph in the Engineering Terms.
- [ ] **GST invoice.** The Terms promise a tax invoice on every order. It has not been verified that the site can produce or download one.
- [ ] **User-side licences.** GST registration, contract labour licence (Contract Labour Act), Shop and Establishment licence, payment-gateway KYC if a gateway is added.
- [ ] **Homepage claim "verified and background-checked"** (`apps/storefront/src/modules/home/components/labour-preview/index.tsx`). Workers have no ID checks yet. On hold: remove or make true.
- [ ] **Policy defaults to confirm:** refund timings (48h damage report, labour free cancellation over 24h, refund starts in 3 days and arrives in 5-7), quote validity (30 days), revisions, delivery terms, free-delivery rule, and what the free engineering service includes (plot size, revisions).

## Real SMS for OTP login

Login currently uses Firebase Phone Auth. Only test phone numbers work freely: a new Firebase project allows 10 real SMS a day until a billing account is added.

- [ ] Add a billing account in Firebase (Blaze plan) and check the India SMS price.
- [ ] Add the production domain under Firebase Authentication -> Settings -> Authorized domains, and keep India allowed in the SMS region policy.
- [ ] Longer term, if moving to MSG91: it needs DLT registration, which the business cannot do without business documents. Options discussed: register as a sole proprietor (personal PAN and Aadhaar plus a free Udyam registration), or WhatsApp OTP. Switching provider is an env change, see `docs/ARCHITECTURE.md` section 3.1.

## Production settings

- [ ] **Production URL.** Set `NEXT_PUBLIC_BASE_URL` to the real https domain, or the sitemap and robots point at localhost.
- [ ] **Secrets.** Real `JWT_SECRET` and `COOKIE_SECRET` in the backend env.
- [x] **Redis for sessions and events.** Done in code (2026-11-24): `medusa-config.ts` registers Redis sessions, event bus, workflow engine and locking whenever `REDIS_URL` is set; production runs Redis in Docker (`deploy/docker-compose.yml`).
- [x] **File storage.** Decided (2026-11-24, `docs/DEPLOYMENT-PLAN.md`): photos stay on the server's disk in a persistent Docker volume, backed up nightly; private files (CSV exports) are kept outside the public folder. Existing photo addresses are rewritten once with `deploy/rewrite-file-urls.sh`. Move to S3-compatible storage later only if the store outgrows one server.
- [ ] **Deploy.** Follow `docs/DEPLOYMENT.md`: rehearsal on the Mac, then the server.
- [ ] **CORS.** Set automatically from the domains in `deploy/.env` (`deploy/docker-compose.yml`).

## Checks

- [ ] `./scripts/check.sh` passes, plus the backend lint.
- [ ] Walk through the new pages on a real phone: sign up, order with UPI, book labour, request a quote, claim the free service, contact form.
- [ ] Re-run the end-to-end order flow against the deployed backend and storefront (`docs/ARCHITECTURE.md`, Verification section).

## After launch

- [ ] Add the site to Google Search Console and submit `sitemap.xml`.
- [ ] Revisit the FAQ, Portfolio and Blog pages once there are real questions and photos.
