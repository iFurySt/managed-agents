## [2026-06-21 01:21] | Task: Align session archive dialog

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console one interaction at a time with OBU comparisons and small verified pushes.

### Changes Overview

- Area: Console Sessions confirmation dialog.
- Key actions: Aligned the Session archive confirmation to the source-measured `ConfirmationDialog` shell already used for Agent archive: source-like shadow ring, 22px title, muted body text, and ghost Cancel button.

### Design Intent

Keep destructive confirmations consistent across cloned Claude Console surfaces. The Sessions dialog was still using the older 17px title, darker shadow, secondary Cancel button, and warmer body text; this change brings it onto the same source-measured dialog token as the Agents archive flow.

### Files Modified

- `apps/console/src/App.tsx`
