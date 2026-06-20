## [2026-06-21 01:00] | Task: Align agent archive dialog

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Console managed-agent surfaces with OBU-driven comparisons, including nested menus and confirmation dialogs.

### Changes Overview

- Area: Agents archive confirmation dialog.
- Key actions:
  - Opened the source Agents row archive flow with OBU and sampled the confirmation dialog geometry and computed styles.
  - Aligned the local Agent archive dialog title to the source 22px title treatment and 580 weight.
  - Updated the dialog shadow to the source ring plus 4px/12px layered shadow.
  - Matched the description color to the source secondary text color.

### Design Intent

The archive confirmation dialog is part of the row action flow and should share the source confirmation-dialog visual language. The change focuses on source-measured tokens while leaving the existing archive behavior unchanged.

### Files Modified

- `apps/console/src/App.tsx`
