## [2026-06-21 00:36] | Task: Align create session environment picker

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning the Claude Console managed-agent surfaces with close visual fidelity, including the create session dialog controls.

### Changes Overview

- Area: Console create session dialog.
- Key actions:
  - Replaced the Environment field's basic select with a source-matched combobox picker.
  - Added the environment option data needed to render two-line option rows with updated time and environment type.
  - Matched the source Environment popover geometry from OBU comparison, including the search row, option row height, and popover offset.
  - Kept the create session Agent picker popover offset aligned with the same source spacing.

### Design Intent

The Environment selector in Claude Console behaves like the Agent selector rather than a plain native-style select. Matching that interaction directly keeps the create session dialog consistent with the source UI and avoids a separate one-off control path.

### Files Modified

- `apps/console/src/App.tsx`
