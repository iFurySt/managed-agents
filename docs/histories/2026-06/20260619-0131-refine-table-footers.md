## [2026-06-19 01:31] | Task: Refine table footers

### Request

Continue cloning the Claude Platform managed-agents console in small verified milestones using OBU evidence.

### Changes

- Captured Claude and local Deployments, Environments, Credential vaults, and a Credential vault detail page with OBU.
- Removed non-functional `‹` / `›` footer controls from:
  - Deployments
  - Environments
  - Credential vaults
  - Credential vault detail credentials table

### Intent

The captured Claude surfaces render their current tables without pagination footer controls. Removing local placeholder footer buttons avoids presenting controls that do not exist in the source console and do not perform any action locally.

### Verification

- OBU confirmed Claude Deployments, Environments, Credential vaults, and vault detail tables had no `‹` / `›` pager controls.
- OBU confirmed the same local surfaces no longer expose `‹` / `›` after the change and still render table rows.
- `rg -n "‹|›" apps/console/src/App.tsx` returned no matches.
- `npm run build:console`
- `go test ./...`

### Files

- `apps/console/src/App.tsx`
