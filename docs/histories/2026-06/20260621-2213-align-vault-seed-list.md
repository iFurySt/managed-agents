# Align Vault Seed List

## Request

Converge the Claude Console clone quickly, using Open Browser Use evidence only for clear remaining mismatches.

## Changes

- Updated the seeded credential vault list to match the current Claude Console vault list observed through Open Browser Use.
- Added the source-visible `Temporary vault` seed row ahead of `test_secret`.
- Removed the stale `GitHub source access` seeded vault and its credential from the main vault list data.

## Intent

Keep this pass narrow and convergence-focused. The source `/vaults` page now shows `Temporary vault` and `test_secret`; matching the seed data makes the local list visually align when the apiserver is connected to a healthy Postgres database.

## Files

- `apps/apiserver/main.go`
