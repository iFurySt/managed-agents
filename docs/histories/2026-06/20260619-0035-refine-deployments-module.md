## [2026-06-19 00:35] | Task: Refine Deployments Module

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Refine the managed agents console against the Claude Platform deployments surface, then commit and push all changes.

### Changes Overview

- Area: console deployments UI and apiserver deployment lifecycle API.
- Key actions: added deployment pause, resume, and archive endpoints; wired console list and detail actions to those endpoints; aligned deployment list filters, copy affordances, labels, status handling, schedule metadata, and runs filtering with the reference surface.

### Design Intent

Keep deployment lifecycle behavior inside `apiserver` because it is part of the primary product CRUD/control plane, while leaving execution scheduling and sandbox ownership outside this module boundary. The console mirrors the observed Claude Platform structure without introducing new navigation or abstractions.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/components/cds.tsx`

### Follow-up: Deployments Table Geometry

- Rechecked the Claude Platform deployments list with OBU and captured the current table geometry: no selection column, 1146px row width, 46px reference row height, and 160/240/110/220/200/160/56px columns for ID, Name, Status, Agent, Trigger, Created, and Actions.
- Updated the local Deployments table to use the same no-selection layout and column widths, including fixed 112px Agent and 98px Status filters.
- Added a configurable `actionsWidth` to the shared CDS `DataTable` so deployments can match the Claude actions column without changing existing tables.
- Verified the local deployments list with OBU after the change: rendered row width is 1146px with matching column widths and 45px local row height.

### Follow-up: Deployment Detail Geometry

- Rechecked the Claude Platform deployment detail page with OBU for both Configuration and Runs tabs.
- Aligned the local detail tab controls to the Claude 32px tab height and added URL-driven `?tab=runs` behavior for deep links.
- Tightened configuration detail sections to the observed 14px/20px headings, 792px content width, 16px section rhythm, unframed schedule/message blocks, and 111px local schedule height against the 114px reference.
- Updated deployment runs to remove selection/actions columns, match the 1210px reference width, use 160/260/120/110/160/260/140px columns, and preserve 45px data rows.
- Extended the shared CDS `DataTable` with optional `showActions` so non-action tables can match Claude without changing existing action tables.

### Follow-up: Deployments List Filter Geometry

- Re-captured the Claude Platform Deployments list with OBU at a 1272px viewport.
- Aligned the Deployments filter row to the captured controls: 320px search field, 112px Agent select, and 98px Status select with the same x-position spacing as Claude.
- Nudged the Deployments row actions trigger 4px to match the captured action button position inside the 56px Actions column.
- Treated direct API `agentId=All` and `deploymentId=All` query values as unfiltered values so backend list endpoints match the console filter semantics.
- Verified the local `/deployments` page with OBU after the change; filter, table, row, and actions button x/width/height values match the Claude reference, while global shell vertical positioning remains a separate follow-up.
