## [2026-06-20 11:55] | Task: Refine agent detail actions

### Execution Context
- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query
> Continue one-by-one Claude Platform cloning with OBU evidence and small verified commits.

### Changes Overview
- Area: Console Agent detail header.
- Key actions:
  - Used Open Browser Use to compare the source and local Agent detail header.
  - Aligned the `Edit` action button to the source 71x32 control with 14px/20px, 550 weight, and 6px gap.
  - Swapped the edit action icon from settings to a pencil-style icon to match the source affordance.

### Design Intent
Tighten the Agent detail header action surface before deeper detail tabs and edit dialog work.

### Files Modified
- `apps/console/src/App.tsx`
