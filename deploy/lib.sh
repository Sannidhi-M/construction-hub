# Shared helpers for the deploy scripts. Sourced, not run.
# shellcheck shell=bash

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f .env ]; then
  echo "deploy/.env is missing — copy .env.production.template and fill it in." >&2
  exit 1
fi

# One value from deploy/.env. Read directly rather than `source`d: values may
# contain spaces ("Construct Mitra"), which Docker Compose accepts unquoted
# but a shell would not.
env_value() {
  grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

POSTGRES_USER="$(env_value POSTGRES_USER)"
POSTGRES_DB="$(env_value POSTGRES_DB)"
SITE_DOMAIN="$(env_value SITE_DOMAIN)"
API_DOMAIN="$(env_value API_DOMAIN)"

# Docker Compose project name (docker-compose.yml `name:`); volumes are
# <project>_<volume>.
PROJECT=constructmitra

# A local rehearsal uses *.localhost names, which Caddy serves with its own
# (untrusted) certificate — only there is skipping certificate checks OK.
CURL_OPTS=(-fsS --max-time 20)
case "$SITE_DOMAIN" in *.localhost) CURL_OPTS+=(-k) ;; esac

log() { printf '\n==> %s\n' "$*"; }
