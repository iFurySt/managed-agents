## [2026-06-20 11:35] | Task: Refine agents header actions

### Execution Context
- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query
> Continue one-by-one Claude Platform cloning with OBU evidence and small verified commits.

### Changes Overview
- Area: Console Agents page header.
- Key actions:
  - Used Open Browser Use to compare source and local Agents first-screen header layout.
  - Added the source-matching documentation icon button beside `Create agent`.
  - Aligned the header action group to the source 172px action width with 32px controls, 8px group gap, and 14px/20px 550-weight button tokens.

### Design Intent
Close a visible first-screen layout gap on the Agents page before continuing into row actions, create dialogs, and detail pages.

### Files Modified
- `apps/console/src/App.tsx`
