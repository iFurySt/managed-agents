## [2026-06-21 03:33] | Task: Align Create agent template card border

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based comparison, including dialogs and subpage functionality.

### Changes Overview

- Area: Agents Create agent dialog.
- Key actions: Adjusted unselected template cards to use the source-style 0.5px low-contrast border while keeping the selected template card's 1.5px active border.

### Design Intent

Claude Console uses a lighter card outline for unselected templates, making the selected template state more distinct without adding extra weight to the grid. The local clone now follows that visual token in the Template starting-point mode.

### Files Modified

- `apps/console/src/App.tsx`
