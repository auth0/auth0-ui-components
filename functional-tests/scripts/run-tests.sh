#!/usr/bin/env bash
# Wraps org lifecycle around `playwright test`, forwarding any args (a spec
# path, --grep, etc.) straight through — unlike the old package.json script
# string, which couldn't take arguments at all (see plan/status.md §1).
set -e

pnpm run org:setup

status=0
pnpm exec playwright test "$@" || status=$?

pnpm run org:teardown

exit $status
