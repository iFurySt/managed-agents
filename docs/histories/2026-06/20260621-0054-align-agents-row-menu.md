## [2026-06-21 00:54] | Task: Align agents row menu

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Console managed-agent surfaces with OBU-driven comparisons, including nested menus and dialogs.

### Changes Overview

- Area: Agents list row actions.
- Key actions:
  - Compared the source and local first-row Agents action menu through OBU DOM/style sampling.
  - Matched the Agents list row menu to the source single `Archive agent` action.
  - Resized the list menu to the source-like 148px width and 40px height.
  - Kept the richer shortcut actions available only where the Agent detail page passes a guided edit handler.

### Design Intent

The source Agents list keeps row actions minimal. Moving the extra session, edit, and deployment shortcuts behind the detail-page path preserves existing functionality where it is useful without making the list menu diverge from the source UI.

### Files Modified

- `apps/console/src/App.tsx`
