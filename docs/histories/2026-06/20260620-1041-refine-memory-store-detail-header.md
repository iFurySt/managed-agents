## [2026-06-20 10:41] | Task: Refine memory store detail header

### Execution Context
- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query
> Continue one-by-one Claude Platform cloning with OBU evidence and small verified commits.

### Changes Overview
- Area: Console navigation and Memory store detail page.
- Key actions:
  - Used Open Browser Use to compare source and local Memory store detail headers.
  - Extended sidebar active matching so detail routes keep their parent list item highlighted.
  - Aligned the detail `Active` badge to the source 20px height, 5px radius, and 15px line-height.
  - Changed `Add memory` to the source primary button treatment and removed the extra header overflow action from this view.

### Design Intent
Keep detail pages visually connected to their left-nav module and match the source Memory store detail header before continuing deeper content-panel polish.

### Files Modified
- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
