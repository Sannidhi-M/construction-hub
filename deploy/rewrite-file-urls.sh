#!/usr/bin/env bash
# One-time, after restoring the development database on the server: photos
# uploaded on the Mac are saved with links to http://localhost:9000/static/...
# This points them at https://API_DOMAIN/static/... instead.
#
#   ./rewrite-file-urls.sh [old base]     (default http://localhost:9000/static)
#
# Safe to run twice (the second run finds nothing to change).
source "$(dirname "$0")/lib.sh"

OLD="${1:-http://localhost:9000/static}"
NEW="https://$API_DOMAIN/static"

psql_run() {
  docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 -qAt "$@"
}

# Every column known to hold uploaded-file links. The final scan below
# reports any other column still mentioning the old address.
COLUMNS="image.url product.thumbnail labour_service.image_url"

log "Rewriting $OLD -> $NEW"
{
  echo "BEGIN;"
  for column in $COLUMNS; do
    table="${column%%.*}"; field="${column#*.}"
    echo "UPDATE \"$table\" SET \"$field\" = replace(\"$field\", '$OLD', '$NEW') WHERE \"$field\" LIKE '$OLD%';"
  done
  echo "COMMIT;"
} | psql_run

for column in $COLUMNS; do
  table="${column%%.*}"; field="${column#*.}"
  echo "  $column: $(psql_run -c "SELECT count(*) FROM \"$table\" WHERE \"$field\" LIKE '$NEW%'") now use the new address"
done

log "Scanning every text column for leftovers of $OLD"
leftovers="$(psql_run -c "
  SELECT table_name || '.' || column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'jsonb')" |
  while IFS= read -r column; do
    table="${column%%.*}"; field="${column#*.}"
    # </dev/null: otherwise `docker compose exec` swallows the rest of the
    # column list this loop is reading.
    count="$(psql_run -c "SELECT count(*) FROM \"$table\" WHERE \"$field\"::text LIKE '%$OLD%'" </dev/null)"
    [ "$count" = 0 ] || echo "  $column: $count"
  done)"
if [ -n "$leftovers" ]; then
  echo "Still mentioning the old address (check whether these matter):"
  echo "$leftovers"
else
  echo "  none"
fi
