## [2026-06-21 10:12] | Task: Align DataTable selected row

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Console surfaces, but converge quickly now that the main functionality is in place.

### Changes Overview

- Area: Console frontend shared DataTable component.
- Key actions:
  - Matched selected-row cell backgrounds to the source console's 5% ink fill.
  - Moved row dividers onto cells so selected rows can make cell borders transparent like the source.
  - Added first and last selected-cell corner rounding to match the source selected-row shape.

### Design Intent

The DataTable already had functional row selection. This change closes the most visible selected-row styling gap without broadening the scope into lower-value pixel tuning.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260621-1012-align-datatable-selected-row.md`
