# Harden Apiserver Database Health

## Request

Continue converging the managed agents console and keep functional verification reliable.

## Changes

- Made `apiserver` verify the Postgres connection during startup instead of serving with a bad lazy connection.
- Made `/healthz` report `503` with a redacted database-unavailable status when the database cannot be reached.
- Documented that `/healthz` now covers database readiness for local console runs.

## Intent

Avoid a misleading local development state where the Vite console proxy can reach `apiserver`, but every managed-agents list API fails and the UI silently renders empty tables.

## Files

- `apps/apiserver/main.go`
- `README.md`
