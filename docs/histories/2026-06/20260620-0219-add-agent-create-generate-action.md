## [2026-06-20 02:19] | Task: Add agent create generate action

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces one menu at a time, using OBU evidence and committing verified milestones.

### Changes Overview

- Area: Console Agents create dialog.
- Key actions:
  - Used OBU to verify the source Create agent dialog Generate button empty and filled states.
  - Added local Generate behavior that converts the description prompt into a YAML agent config.
  - Kept generated config aligned with the source field order and default toolset shape.
  - Improved YAML scalar parsing so quoted generated values render correctly in the JSON preview.
  - Made enabled Button opacity explicit while keeping disabled buttons at the source-like 0.5 opacity.

### Design Intent

The source Generate action appears to call a remote generation path, so the local clone uses a deterministic client-side generation path for now. This keeps the dialog functional and verifiable without adding a backend LLM dependency, while preserving the same visible YAML/JSON workflow and button states.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
