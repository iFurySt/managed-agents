## [2026-06-19 01:27] | Task: Refine created filters

### Request

Continue cloning the Claude Platform managed-agents console in small verified milestones using OBU evidence.

### Changes

- Captured Claude and local Sessions plus Memory stores pages with OBU to verify that both surfaces expose a `Created All time` filter and do not show pagination footer controls.
- Connected the Sessions `Created` filter to `/api/sessions?created=...`.
- Connected the Memory stores `Created` filter to `/api/memory-stores?created=...`.
- Moved Memory stores created filtering from label-based frontend filtering to backend `created_at` window filtering.
- Removed non-functional `‹` / `›` footer controls from Sessions and Memory stores.

### Intent

The list filters should behave like real Claude Console controls rather than local-only cosmetic state. Removing inactive footer controls also keeps the local table surfaces closer to the captured Claude pages.

### Verification

- OBU confirmed Claude Sessions and Memory stores pages include `Created All time` and no pager buttons.
- OBU confirmed local Sessions and Memory stores switch to `Created Last 24 hours`, narrow the table rows, and no longer expose `‹` / `›` buttons.
- `curl -sS 'http://127.0.0.1:8080/api/sessions?created=Last%2024%20hours&status=Active'` returned two seeded rows.
- `curl -sS 'http://127.0.0.1:8080/api/memory-stores?created=Last%2024%20hours&status=Active'` returned one seeded row.
- `npm run build:console`
- `go test ./...`

### Files

- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/apiserver/main.go`
