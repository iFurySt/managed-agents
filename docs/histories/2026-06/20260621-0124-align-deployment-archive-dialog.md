## [2026-06-21 01:24] | Task: Align deployment archive dialog

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console one interaction at a time with OBU comparisons and small verified pushes.

### Changes Overview

- Area: Console Deployments confirmation dialog.
- Key actions: Aligned the Deployment archive confirmation to the source-measured `ConfirmationDialog` token used by Agent and Session archive confirmations: soft ring shadow, 22px title, muted description text, and ghost Cancel button.

### Design Intent

Keep destructive confirmation dialogs visually consistent across Claude Console clone surfaces. The Deployment archive dialog already had the source copy, but still used the older title scale, darker shadow, and secondary Cancel treatment.

### Files Modified

- `apps/console/src/App.tsx`
