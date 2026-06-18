## [2026-06-19 01:22] | Task: Refine managed agents filters

### Request

Continue cloning the Claude Platform managed-agents console with OBU evidence, moving through the listed modules in small verified milestones.

### Changes

- Ran a wide OBU comparison across the managed-agents pages to identify the next highest-value parity gap.
- Connected the Agents page search input to the existing `/api/agents?q=...` backend search behavior.
- Added a Created filter parameter for Agents, supporting `Last 24 hours`, `Last 7 days`, and `Last 30 days` windows.
- Removed the non-functional `‹` / `›` pagination controls from the Agents page because the captured Claude Agents table did not expose that footer.

### Intent

This keeps the Agents list closer to Claude's visible interaction model: filters and search should affect real backend queries, while placeholder controls that do not exist in the captured console should not be shown.

### Verification

- OBU captured current Claude and local summaries for Agents, Sessions, Deployments, Environments, Credential vaults, Memory stores, Files, and Skills.
- OBU verified local Agents search by entering `Incident`; the table reduced to the `Incident commander` row and no pager buttons remained.
- `curl -sS 'http://127.0.0.1:8080/api/agents?q=Incident&status=Active'` returned one matching row.
- `curl -sS 'http://127.0.0.1:8080/api/agents?created=Last%2024%20hours&status=Active'` returned zero seeded rows, matching the seeded timestamps.
- `npm run build:console`
- `go test ./...`

### Files

- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/apiserver/main.go`
