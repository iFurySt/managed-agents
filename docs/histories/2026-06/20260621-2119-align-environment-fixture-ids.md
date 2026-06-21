# Align environment fixture IDs

## Request

Continue converging the Claude Console clone against the source platform while avoiding new scope.

## Changes

- Updated create-session environment picker options to use the same environment IDs seeded by the apiserver.
- Updated seeded sessions and deployments to reference real seeded environment IDs instead of older local placeholder IDs.
- Fixed the `managed-sh-debug-env` typo to `managed-ssh-debug-env`.
- Added a focused apiserver test that verifies seeded sessions and deployments reference seeded environments.

## Files

- `apps/console/src/App.tsx`
- `apps/apiserver/main.go`
- `apps/apiserver/main_test.go`
