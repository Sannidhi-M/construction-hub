#!/usr/bin/env bash
# Deploys the commit that's currently checked out:
#
#   git pull && ./deploy/deploy.sh
#
# Backup -> build -> database migrations -> start -> health check. If the
# health check fails it stops and prints the rollback command.
source "$(dirname "$0")/lib.sh"

if ! git diff --quiet HEAD -- ..; then
  echo "There are uncommitted changes in the repo; deploy only committed code." >&2
  exit 1
fi
TAG="$(git rev-parse --short HEAD)"
PREVIOUS="$(tail -n 1 .deploy-history 2>/dev/null | awk '{ print $2 }' || true)"
export APP_TAG="$TAG"

log "Starting database and Redis"
docker compose up -d --wait postgres redis

log "Backing up before deploy"
./backup.sh pre-deploy

log "Building $TAG"
docker compose build backend storefront

log "Applying database migrations"
docker compose run --rm backend /repo/node_modules/.bin/medusa db:migrate

log "Starting $TAG"
docker compose up -d --wait --wait-timeout 300

log "Checking the live site"
if ! curl "${CURL_OPTS[@]}" -o /dev/null "https://$API_DOMAIN/health" \
  || ! curl "${CURL_OPTS[@]}" -L -o /dev/null "https://$SITE_DOMAIN/"; then
  echo >&2
  echo "DEPLOY FAILED the health check. Logs: docker compose logs --tail 100 backend storefront" >&2
  [ -n "$PREVIOUS" ] && echo "Roll back with: ./rollback.sh $PREVIOUS" >&2
  exit 1
fi

docker tag "constructmitra-backend:$TAG" constructmitra-backend:current
docker tag "constructmitra-storefront:$TAG" constructmitra-storefront:current
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $TAG deploy" >> .deploy-history

log "Removing images older than the last 3 deploys"
KEEP="$(awk '{ print $2 }' .deploy-history | tail -n 3)"
for repo in constructmitra-backend constructmitra-storefront; do
  docker images "$repo" --format '{{.Tag}}' | while read -r tag; do
    [ "$tag" = current ] && continue
    grep -qx "$tag" <<<"$KEEP" || docker rmi "$repo:$tag" >/dev/null || true
  done
done
docker image prune -f >/dev/null

log "Deployed $TAG"
