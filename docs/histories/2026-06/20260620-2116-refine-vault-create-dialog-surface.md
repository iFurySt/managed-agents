## [2026-06-20 21:16] | Task: refine vault create dialog surface

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue OBU-driven Claude Console parity across managed agent pages, including nested dialogs.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Matched the `Create vault` dialog surface to the source ring and layered shadow.
  - Matched the dialog buttons and name field to the source 8px computed radius.
  - Added the source-style inset field ring to the vault name input.

### Design Intent

Keep vault creation visually aligned with the measured Claude Console dialog and field primitives while preserving the existing two-step vault creation flow.

### Files Modified

- `apps/console/src/App.tsx`
