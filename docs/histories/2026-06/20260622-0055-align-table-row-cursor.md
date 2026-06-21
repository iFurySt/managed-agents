## [2026-06-22 00:55] | Task: Align table row cursor

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue using OBU to compare the Claude Console clone against source pages
> and converge list/table behavior without expanding scope.

### Changes Overview

- Area: Shared console table component.
- Key actions:
  - Matched source table rows by adding the CDS interactive cursor token to
    `DataTable` data rows.
  - Verified in OBU that source vault rows compute to `cursor: pointer`.
  - Avoided adding row-click navigation after OBU showed source row clicks do
    not navigate outside explicit links/actions.

### Design Intent

The source table rows expose a pointer cursor as a visual affordance even when
navigation remains attached to explicit row controls. The local clone now
matches that row affordance while preserving existing link and action behavior.

### Files Modified

- `apps/console/src/components/cds.tsx`
