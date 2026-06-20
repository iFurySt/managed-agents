## [2026-06-20 11:47] | Task: Refine agent row menu

### Execution Context
- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query
> Continue one-by-one Claude Platform cloning with OBU evidence and small verified commits.

### Changes Overview
- Area: Console Agents row action menu.
- Key actions:
  - Used Open Browser Use to compare the source and local first-row Agents action menu.
  - Aligned the row action trigger to the source 14px/20px, 550-weight, 6px-gap icon button token.
  - Aligned the `Archive agent` menu item vertical padding to the source 6px/10px menu-item box.

### Design Intent
Tighten the Agents list row action surface before continuing into archive confirmation and agent detail views.

### Files Modified
- `apps/console/src/App.tsx`
