## [2026-06-20 03:00] | Task: Refine skills row actions

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and verified small milestones.

### Changes Overview

- Area: Console Skills list row actions.
- Key actions:
  - Used OBU to compare Claude Platform and local Skills row action controls.
  - Matched the version history icon button default state to source by hiding it until row hover or focus.
  - Added row hover and focus-within background behavior matching the source row interaction pattern.

### Design Intent

Claude Platform keeps the Skills row action icon visually quiet until the user interacts with the row. The local clone now follows the same pattern while preserving the existing row dimensions and button position.

### Files Modified

- `apps/console/src/App.tsx`
