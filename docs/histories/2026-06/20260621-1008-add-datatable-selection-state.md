## [2026-06-21 10:08] | Task: Add DataTable selection state

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Console surfaces with OBU comparison and small verified milestones.

### Changes Overview

- Area: Console frontend shared DataTable component.
- Key actions:
  - Added row selection state to the shared DataTable checkbox column.
  - Added header select-all behavior plus the mixed state used when only some rows are selected.
  - Matched source-style `aria-checked`, `data-checked`, `data-indeterminate`, row `data-selected`, blue checked fill, and checked/mixed glyph visibility.

### Design Intent

Claude Console table checkboxes are interactive CDS controls, not static markers. This change keeps the existing table layout while making the selection column behave like the source console for row selection, partial selection, and visible-row select-all.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260621-1008-add-datatable-selection-state.md`
