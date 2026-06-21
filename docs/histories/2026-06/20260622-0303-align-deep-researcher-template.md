## [2026-06-22 03:03] | Task: Align deep researcher template

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue replicating Claude Console Managed Agents behavior with OBU-backed comparisons, focusing on functional parity before further polish.

### Changes Overview

- Area: Agents create dialog template behavior.
- Key actions:
  - Used Open Browser Use to compare the source and local `Create agent` dialog.
  - Verified both dialogs expose the same Template branch and template cards.
  - Found that the source `Deep researcher` template generates a multi-step research workflow in the YAML system prompt while the local clone used a short one-line prompt.
  - Expanded the local `Deep researcher` system prompt and added YAML block scalar output plus parser support so JSON preview and agent creation preserve the multi-line prompt.

### Design Intent

Move the clone closer to source behavior in a functional path rather than only visual styling. Multi-line YAML support keeps template-generated config editable, previewable, and submit-safe.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0303-align-deep-researcher-template.md`
