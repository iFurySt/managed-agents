## [2026-06-20 22:37] | Task: Refine credential dialog surface

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Console nested vault flows with OBU comparison.

### Changes Overview

- Area: Credential vault add-credential dialog.
- Key actions:
  - Matched the add-credential dialog panel shadow to the source console panel shadow.
  - Added the source-style inset ring to the credential name field.
  - Changed the `Connect` action to a primary button to match the source dialog.

### Design Intent

The add-credential dialog is a core nested workflow inside vault details. The changes preserve the existing Radix dialog/form implementation while tightening the visible surface against the captured Claude Console dialog.

### Files Modified

- `apps/console/src/App.tsx`
