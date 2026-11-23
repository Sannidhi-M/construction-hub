#!/usr/bin/env bash
# Backs up the database and uploaded files (photos + private exports/imports).
# Runs nightly from cron, and from deploy.sh before every deploy.
#
#   ./backup.sh              nightly backup (kept BACKUP_KEEP_DAYS days)
#   ./backup.sh pre-deploy   kept as the last 5 pre-deploy backups
#
# Restore with ./restore.sh. Optional: weekly off-server copy (RCLONE_REMOTE)
# and a failure email via healthchecks.io (HEALTHCHECK_PING_URL).
source "$(dirname "$0")/lib.sh"

LABEL="${1:-nightly}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DIR="$(env_value BACKUP_DIR)"; DIR="${DIR:-/var/backups/constructmitra}"
KEEP_DAYS="$(env_value BACKUP_KEEP_DAYS)"; KEEP_DAYS="${KEEP_DAYS:-7}"
RCLONE_REMOTE="$(env_value RCLONE_REMOTE)"
PING_URL="$(env_value HEALTHCHECK_PING_URL)"

ping_healthcheck() {
  [ -n "$PING_URL" ] && [ "$LABEL" = nightly ] || return 0
  curl -fsS --max-time 10 --retry 3 "$PING_URL$1" >/dev/null || true
}
trap 'ping_healthcheck /fail' ERR

mkdir -p "$DIR"
DB_FILE="$DIR/db-$STAMP-$LABEL.dump"
FILES_FILE="$DIR/files-$STAMP-$LABEL.tgz"

log "Database -> $DB_FILE"
# Written under a temporary name and renamed only when complete, so a backup
# that failed halfway can never be mistaken for a good one.
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$DB_FILE.partial"
[ -s "$DB_FILE.partial" ] || { echo "Database dump is empty" >&2; false; }
mv "$DB_FILE.partial" "$DB_FILE"

log "Uploaded files -> $FILES_FILE"
docker run --rm \
  -v "${PROJECT}_static:/data/static:ro" \
  -v "${PROJECT}_private:/data/private:ro" \
  -v "$DIR:/out" \
  alpine tar czf "/out/$(basename "$FILES_FILE").partial" -C /data static private
mv "$FILES_FILE.partial" "$FILES_FILE"

log "Pruning old backups"
find "$DIR" -name '*-nightly.*' -mtime +"$KEEP_DAYS" -delete
for kind in db files; do
  # shellcheck disable=SC2012 # names are our own, no odd characters
  ls -1t "$DIR"/$kind-*-pre-deploy.* 2>/dev/null | tail -n +6 | xargs -r rm --
done

if [ -n "$RCLONE_REMOTE" ] && [ "$LABEL" = nightly ] && [ "$(date +%u)" = 7 ]; then
  log "Weekly off-server copy -> $RCLONE_REMOTE"
  rclone copy "$DB_FILE" "$RCLONE_REMOTE"
  rclone copy "$FILES_FILE" "$RCLONE_REMOTE"
fi

DISK_USED="$(df -P / | awk 'NR==2 { gsub("%", "", $5); print $5 }')"
if [ "$DISK_USED" -ge 85 ]; then
  echo "WARNING: disk is ${DISK_USED}% full" >&2
  false
fi

ping_healthcheck ""
log "Backup done ($(du -h "$DB_FILE" | cut -f1) database, $(du -h "$FILES_FILE" | cut -f1) files)"
