## [2026-06-21 03:19] | Task: Align Create agent dialog height

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based comparison, including dialogs and subpage functionality.

### Changes Overview

- Area: Agents Create agent dialog.
- Key actions: Changed the dialog from a fixed tall layout to a source-style bounded flex layout, and made the agent config editor consume remaining space instead of forcing the submit button below the visible dialog area.

### Design Intent

Claude Console keeps the Create agent submit action visible in the initial dialog viewport. The local clone now matches that behavior while preserving the existing form fields, YAML/JSON tabs, and create-agent API flow.

### Files Modified

- `apps/console/src/App.tsx`
