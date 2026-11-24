#!/usr/bin/env bash
# REPLACES the live database (and optionally the uploaded files) with a backup.
#
#   ./restore.sh <db.dump> [files.tgz | static.zip]
#
# Used for: the first deploy (the dump made on the development Mac, plus its
# zipped static/ folder), recovering from a bad deploy (via rollback.sh), and
# testing that backups actually restore. Stops the apps while it works; run
# ./deploy.sh (or ./rollback.sh <tag>) afterwards to start them again.
#
# Order matters on a new server: restore FIRST, then deploy.sh runs the
# migrations. Never migrate an empty database before restoring — that would
# run the one-time seed and then clash with the restored data. (The dump
# already records the seed as done in its script_migrations table.)
source "$(dirname "$0")/lib.sh"

DUMP="${1:?usage: ./restore.sh <db.dump> [files.tgz | static.zip]}"
FILES="${2:-}"
[ -s "$DUMP" ] || { echo "No such dump: $DUMP" >&2; exit 1; }
[ -z "$FILES" ] || [ -s "$FILES" ] || { echo "No such file: $FILES" >&2; exit 1; }

if [ "${RESTORE_CONFIRMED:-}" != yes ]; then
  echo "This REPLACES the database for $SITE_DOMAIN with $DUMP${FILES:+ and the uploaded files with $FILES}."
  read -r -p "Type the site domain to continue: " answer
  [ "$answer" = "$SITE_DOMAIN" ] || { echo "Cancelled."; exit 1; }
fi

log "Stopping the apps"
docker compose stop backend storefront 2>/dev/null || true
docker compose up -d --wait postgres redis

log "Replacing the database"
docker compose exec -T postgres dropdb -U "$POSTGRES_USER" --if-exists "$POSTGRES_DB"
docker compose exec -T postgres createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --no-owner --no-acl --exit-on-error < "$DUMP"

# Medusa remembers which one-time migration scripts ran by file name, and a
# development database records them as .ts while the server's build runs .js.
# Record the .js twin of every script that already ran, so the server doesn't
# run them a second time on restored data. (The seed also guards itself.)
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -q -c "
  INSERT INTO script_migrations (script_name, created_at, finished_at)
  SELECT regexp_replace(script_name, '\.ts\$', '.js'), created_at, finished_at
  FROM script_migrations ts
  WHERE script_name LIKE '%.ts' AND finished_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM script_migrations js
      WHERE js.script_name = regexp_replace(ts.script_name, '\.ts\$', '.js'))"

if [ -n "$FILES" ]; then
  log "Replacing uploaded files"
  in_dir="$(cd "$(dirname "$FILES")" && pwd)"
  name="$(basename "$FILES")"
  case "$name" in
    *.tgz | *.tar.gz) unpack="tar xzf /in/$name -C /data" ;;
    # The zip made on the Mac contains a top-level static/ folder.
    *.zip) unpack="unzip -oq /in/$name -d /data" ;;
    *) echo "Files must be a .tgz (from backup.sh) or .zip (static/ from the Mac)" >&2; exit 1 ;;
  esac
  docker run --rm \
    -v "${PROJECT}_static:/data/static" \
    -v "${PROJECT}_private:/data/private" \
    -v "$in_dir:/in:ro" \
    alpine sh -c "rm -rf /data/static/* /data/private/* && $unpack && chown -R 1000:1000 /data/static /data/private"
fi

log "Restored. Start the apps with ./deploy.sh (or ./rollback.sh <tag>)."
