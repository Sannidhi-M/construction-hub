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
#   4. lists that must be identical in both apps (the quote services and the
#      contact subjects, each written out in the storefront AND the backend)
#      haven't drifted apart — see scripts/check-synced-lists.js
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

echo "== 1/4: backend type-check =="
if ! (cd apps/backend && npx tsc --noEmit); then
  echo "FAIL: backend has type errors"
  fail=1
else
  echo "OK"
fi

echo
echo "== 2/4: storefront type-check =="
storefront_out=$(cd apps/storefront && npx tsc --noEmit 2>&1 || true)
# Errors are compared by file + message, ignoring line numbers AND the
# property list inside "Type '{ a?: ...; ... 300 more ...; className: string }'":
# TypeScript abbreviates long object types and which properties it prints
# first varies from run to run, so the same error came out as a "new" one
# intermittently.
normalize_errors() {
  sed -E "s/\([0-9]+,[0-9]+\)//; s/Type '\{ [^']*\}'/Type '{ ... }'/" | sort -u
}
current_errors=$(echo "$storefront_out" \
  | grep -E "^\S+\([0-9]+,[0-9]+\): error TS[0-9]+:" \
  | normalize_errors || true)
# `|| true`: with an empty allowlist grep finds no lines and exits 1.
known_errors=$(grep -v '^#' apps/storefront/.typecheck-known-issues.txt | grep -v '^\s*$' | normalize_errors || true)
new_errors=$(comm -23 <(echo "$current_errors") <(echo "$known_errors"))

if [ -n "$new_errors" ]; then
  # The full output is tens of thousands of lines of the known noise; keep it
  # in a file and print only what failed the check.
  echo "$storefront_out" > /tmp/storefront-tsc.log
  echo "FAIL: new type errors not in the known-issues allowlist:"
  echo "$new_errors" | sed 's/^/  /'
  echo "(full tsc output saved to /tmp/storefront-tsc.log)"
  fail=1
else
  echo "OK"
fi

echo
echo "== 3/4: storefront build (syntax/compile check) =="
# `next build` also prerenders pages after compiling. That step used to fail
# with React error #31 on /404 and /500 (the storefront installed its own
# React 19 next to the repo's React 18 that `next` itself loads) — fixed by
# pinning the storefront to the root's React 18.3.1, see docs/PROGRESS.md. So
# now a compile error AND a prerender error both fail this check.
build_log=$(cd apps/storefront && npx next build 2>&1 || true)
echo "$build_log" > /tmp/storefront-build.log
if ! echo "$build_log" | grep -q "Compiled successfully"; then
  echo "FAIL: storefront failed to compile (real syntax/parse error)"
  echo "$build_log" | tail -50
  fail=1
elif echo "$build_log" | grep -q "Export encountered an error\|Error occurred prerendering\|build worker exited"; then
  echo "FAIL: compiled, but prerendering pages failed (a production build/deploy would fail)"
  echo "$build_log" | tail -30
  fail=1
else
  echo "OK"
fi

echo
echo "== 4/4: lists duplicated across the two apps stay in sync =="
if ! node scripts/check-synced-lists.js; then
  fail=1
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "CHECK FAILED — do not push."
  exit 1
fi
echo "All checks passed."
