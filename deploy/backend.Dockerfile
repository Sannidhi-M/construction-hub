# Medusa backend (API + Admin). Built from the repo root (npm workspaces share
# one lockfile there). See docs/DEPLOYMENT.md.

FROM node:22-bookworm-slim AS build
WORKDIR /repo
# Every workspace's package.json is needed for `npm ci` to match the lockfile.
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN npm ci --no-audit --no-fund
COPY apps/backend apps/backend
RUN cd apps/backend && npx medusa build
# npm only creates a workspace's own node_modules when it needs one; make sure
# the COPY below always has something to copy.
RUN mkdir -p apps/backend/node_modules

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /repo/apps/backend/.medusa/server ./apps/backend/.medusa/server
# The built server resolves its packages by walking up to /repo/node_modules.
WORKDIR /repo/apps/backend/.medusa/server
# Mount points for the persistent volumes (photos; private exports/imports).
# Created here so they're owned by the unprivileged `node` user.
RUN mkdir -p static private && chown node:node static private
USER node
EXPOSE 9000
CMD ["/repo/node_modules/.bin/medusa", "start"]
