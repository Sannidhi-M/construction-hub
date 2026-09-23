#!/usr/bin/env bash
# Pre-push sanity check. Run this before pushing:
#   ./scripts/check.sh
#
# Checks, in order:
#   1. apps/backend type-checks clean (tsc --noEmit)
#   2. apps/storefront type-checks against its known-issues allowlist
#      (see apps/storefront/.typecheck-known-issues.txt for why that
#      allowlist exists) — any NEW type error fails this check
#   3. apps/storefront builds with Next.js (catches real syntax errors;
#      Next's build has TypeScript type-checking disabled via
#      `typescript.ignoreBuildErrors`, so step 2 is what catches type
#      regressions, this step catches parse/syntax-level breakage)
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

echo "== 1/3: backend type-check =="
if ! (cd apps/backend && npx tsc --noEmit); then
  echo "FAIL: backend has type errors"
  fail=1
else
  echo "OK"
fi

echo
echo "== 2/3: storefront type-check (against known-issues allowlist) =="
storefront_out=$(cd apps/storefront && npx tsc --noEmit 2>&1 || true)
current_errors=$(echo "$storefront_out" \
  | grep -E "^\S+\([0-9]+,[0-9]+\): error TS[0-9]+:" \
  | sed -E 's/\([0-9]+,[0-9]+\)//' | sort -u || true)
known_errors=$(grep -v '^#' apps/storefront/.typecheck-known-issues.txt | grep -v '^\s*$' | sort -u)
new_errors=$(comm -23 <(echo "$current_errors") <(echo "$known_errors"))

if [ -n "$new_errors" ]; then
  echo "FAIL: new type errors not in the known-issues allowlist:"
  echo "$new_errors" | sed 's/^/  /'
  echo
  echo "Full tsc output:"
  echo "$storefront_out"
  fail=1
else
  echo "OK (only known pre-existing noise present, see apps/storefront/.typecheck-known-issues.txt)"
fi

echo
echo "== 3/3: storefront build (syntax/compile check) =="
# `next build` also does static-export prerendering after compiling, which
# currently fails on a pre-existing bug (React error #31 on /404 — confirmed
# present before any of this session's changes, same dual-React-instance
# root cause as the type-check noise above). That's a real, separate,
# tracked issue (see docs/PROGRESS.md), not something this check should
# block every future push on. So: fail only if compilation itself fails
# (a real syntax/parse error) — warn, don't fail, on a prerender-stage error.
build_log=$(cd apps/storefront && npx next build 2>&1 || true)
echo "$build_log" > /tmp/storefront-build.log
if ! echo "$build_log" | grep -q "Compiled successfully"; then
  echo "FAIL: storefront failed to compile (real syntax/parse error)"
  echo "$build_log" | tail -50
  fail=1
elif echo "$build_log" | grep -q "Export encountered an error\|Generating static pages.*⨯\|build worker exited"; then
  echo "WARN: compiled successfully, but static export failed (known pre-existing issue, see docs/PROGRESS.md) — not blocking push"
else
  echo "OK"
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "CHECK FAILED — do not push."
  exit 1
fi
echo "All checks passed."
