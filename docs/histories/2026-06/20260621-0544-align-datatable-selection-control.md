## [2026-06-21 05:44] | Task: Align DataTable selection control

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Console surfaces with OBU comparison and small verified milestones.

### Changes Overview

- Area: Console frontend shared DataTable component.
- Key actions:
  - Replaced the purely decorative selection box with a CDS-style checkbox structure.
  - Added checkbox role, checked state, labels, and the hidden Anthropicons glyph used by the source console.
  - Matched the selection header font weight and the agents table row height observed through OBU.

### Design Intent

Claude Console renders table selection cells as CDS checkbox controls rather than inert boxes. This change keeps the current visual unchecked state while moving the DOM structure, accessibility semantics, glyph usage, and row metrics closer to the source across all DataTable users.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260621-0544-align-datatable-selection-control.md`
