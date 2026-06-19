## [2026-06-19 22:28] | Task: Refine deployment memory picker

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU-backed fidelity, landing verified milestones and pushing them.

### Changes Overview

- Area: Console create-deployment dialog.
- Key actions:
  - Captured Claude Platform Create deployment memory-store picker behavior with OBU.
  - Replaced the generic deployment memory-store select with a CDS-style rich combobox.
  - Matched the observed source shape: 472px menu width, 12px menu radius, upward opening near the dialog footer, and 46px memory-store options.
  - Added the selected memory-store row with `Read & write` access text while preserving the existing deployment payload shape.

### Design Intent

The source memory-store picker behaves like a multi-binding field: selecting a store adds a bound row and keeps the add control visible. This change mirrors that interaction for the first selected memory store without expanding the backend contract beyond the current deployment CRUD payload.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260619-2228-refine-deployment-memory-picker.md`
