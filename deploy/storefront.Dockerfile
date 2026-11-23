# Next.js storefront. Built from the repo root (npm workspaces share one
# lockfile there). See docs/DEPLOYMENT.md.

FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN npm ci --no-audit --no-fund
COPY apps/storefront apps/storefront

# NEXT_PUBLIC_* values are compiled into the site at build time, so changing
# any of them means rebuilding this image (deploy.sh does).
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_MIN_ORDER_VALUE_INR
ARG NEXT_PUBLIC_UPI_VPA
ARG NEXT_PUBLIC_UPI_PAYEE_NAME
ARG NEXT_PUBLIC_SITE_LEGAL_NAME
ARG NEXT_PUBLIC_SITE_GSTIN
ARG NEXT_PUBLIC_SITE_ADDRESS
ARG NEXT_PUBLIC_SITE_HOURS
ARG NEXT_PUBLIC_PHONE_OTP_PROVIDER
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_MIN_ORDER_VALUE_INR=$NEXT_PUBLIC_MIN_ORDER_VALUE_INR \
    NEXT_PUBLIC_UPI_VPA=$NEXT_PUBLIC_UPI_VPA \
    NEXT_PUBLIC_UPI_PAYEE_NAME=$NEXT_PUBLIC_UPI_PAYEE_NAME \
    NEXT_PUBLIC_SITE_LEGAL_NAME=$NEXT_PUBLIC_SITE_LEGAL_NAME \
    NEXT_PUBLIC_SITE_GSTIN=$NEXT_PUBLIC_SITE_GSTIN \
    NEXT_PUBLIC_SITE_ADDRESS=$NEXT_PUBLIC_SITE_ADDRESS \
    NEXT_PUBLIC_SITE_HOURS=$NEXT_PUBLIC_SITE_HOURS \
    NEXT_PUBLIC_PHONE_OTP_PROVIDER=$NEXT_PUBLIC_PHONE_OTP_PROVIDER \
    NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# The build doesn't need the backend: the backend isn't reachable from inside
# `docker build`, so product pages' generateStaticParams falls back to [] and
# every page renders on request, always with current prices and stock.
RUN cd apps/storefront && npx next build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/storefront ./apps/storefront
WORKDIR /repo/apps/storefront
USER node
EXPOSE 8000
CMD ["/repo/node_modules/.bin/next", "start", "-p", "8000"]
