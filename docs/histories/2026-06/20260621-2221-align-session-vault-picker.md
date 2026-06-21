# Align Session Vault Picker

## Request

Continue converging the Claude Console clone with narrow Open Browser Use checks and avoid broad new scope.

## Changes

- Matched the Create session credential vault picker to the current source options:
  `Temporary vault` and `test_secret`.
- Replaced the flat session vault select with a source-style searchable combobox.
- Reused the same vault option data for the deployment vault picker.
- Updated seeded sessions to reference the existing `test_secret` vault instead of the stale `vault_01GitHub` value.

## Intent

The current Claude Console source shows the same two vault options in Create session and Create deployment. Keeping the local session picker and seed data aligned prevents detail pages and created sessions from exposing stale vault names after the vault list convergence pass.

## Files

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
