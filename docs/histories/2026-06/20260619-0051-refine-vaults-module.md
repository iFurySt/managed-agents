## [2026-06-19 00:51] | Task: Refine Vaults Module

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Platform Managed Agents one module at a time with OBU-based comparison, small verified milestones, and commit/push after each milestone.

### Changes Overview

- Area: console credential vaults UI and vault API client.
- Key actions: compared Claude Platform credential vault list, create vault dialog, detail page, credentials table, and add credential dialog through OBU; wired search/status filters to the API; added ID copy affordances and row/detail dropdown actions; removed vault table selection checkboxes; aligned the add credential initial disabled state.

### Design Intent

Keep vaults as an `apiserver` control-plane module while tightening console fidelity against the observed Claude Platform surface. The shared `DataTable` now supports hiding the selection column so tables can follow each source page instead of forcing one global table shape.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/components/cds.tsx`

### Follow-up: List And Create Dialog Geometry

- Re-captured the Claude Platform credential vaults list and create vault dialog with OBU.
- Aligned the vault list filter and table geometry to the observed Claude surface: 320px search input, compact status filter, and 216/304/200/200/48 table columns.
- Tightened the create vault first step against the observed dialog: 510px shell, 22px title, and the amber workspace-sharing warning banner.
