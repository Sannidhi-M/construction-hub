#!/usr/bin/env bash
# Puts a previous version back. Deployed versions are listed in
# deploy/.deploy-history (images for the last 3 are kept).
#
#   ./rollback.sh <tag>
#       App only — seconds. Use when the new version misbehaves but its
#       database migrations (if any) did no harm.
#
#   ./rollback.sh <tag> --restore-db <db-...-pre-deploy.dump> [files-....tgz]
#       Also puts the database (and optionally the uploaded files) back to
#       the backup deploy.sh took just before the bad deploy. Anything
#       customers did since then (orders, sign-ups) is lost — check the
#       Admin first and note any new orders.
source "$(dirname "$0")/lib.sh"

TAG="${1:?usage: ./rollback.sh <tag> [--restore-db <dump> [files.tgz]]}"
for repo in constructmitra-backend constructmitra-storefront; do
  docker image inspect "$repo:$TAG" >/dev/null 2>&1 || {
    echo "No $repo image tagged $TAG (kept: last 3 deploys; see .deploy-history)" >&2
    exit 1
  }
done

if [ "${2:-}" = --restore-db ]; then
  ./restore.sh "${3:?missing dump file}" ${4:+"$4"}
fi

export APP_TAG="$TAG"
log "Starting $TAG"
docker compose up -d --wait --wait-timeout 300 backend storefront caddy
docker tag "constructmitra-backend:$TAG" constructmitra-backend:current
docker tag "constructmitra-storefront:$TAG" constructmitra-storefront:current
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $TAG rollback" >> .deploy-history
log "Rolled back to $TAG"
