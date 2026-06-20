## [2026-06-20 10:50] | Task: Refine memory store detail height

### Execution Context
- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query
> Continue one-by-one Claude Platform cloning with OBU evidence and small verified commits.

### Changes Overview
- Area: Console Memory store detail page.
- Key actions:
  - Used Open Browser Use to compare source and local Memory store detail panel height.
  - Found the source panel renders at 507px tall and ends at y=759 in a 783px viewport, while local rendered at 563px and overflowed below the viewport.
  - Adjusted the detail section viewport calculation so the local content panel matches the source height and bottom alignment.

### Design Intent
Keep Memory store detail content contained in the same first-viewport frame as Claude Console before deeper file preview/editor polish.

### Files Modified
- `apps/console/src/App.tsx`
