## [2026-06-21 03:01] | Task: Align environment credential input ring

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based visual comparison, including dialogs and subpage functionality.

### Changes Overview

- Area: Credential vault Add credential dialog.
- Key actions: Added the source-style inset control ring to the environment variable target input so it matches the dialog's other text input controls.

### Design Intent

The credential dialog uses a consistent 31px white translucent input token with an inset 1px ring. This keeps the environment variable target field aligned with the source console and the existing local Name field token.

### Files Modified

- `apps/console/src/App.tsx`
