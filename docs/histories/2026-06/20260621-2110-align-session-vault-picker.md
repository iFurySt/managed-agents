# Align session vault picker

## Request

Tighten the Claude Console clone without expanding scope, focusing on visible and functional mismatches after the main managed-agent surfaces were mostly complete.

## Changes

- Updated the create-session credential vault selector to offer the same user-facing vault names already used elsewhere in the console fixture data.
- Kept the change intentionally narrow so the session creation flow now exposes `test_secret` and `GitHub source access` instead of a stale single vault id.

## Files

- `apps/console/src/App.tsx`
