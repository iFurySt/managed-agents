## [2026-06-22 03:07] | Task: Align structured extractor template

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue replicating Claude Console Managed Agents behavior with OBU-backed functional comparisons.

### Changes Overview

- Area: Agents create dialog template behavior.
- Key actions:
  - Used Open Browser Use to compare source and local `Create agent` template behavior.
  - Verified source `Structured extractor` generates a schema-first multi-step extraction workflow.
  - Expanded the local `Structured extractor` system prompt so YAML emits a block scalar and JSON preview preserves the full multi-line system value.

### Design Intent

Keep converging the template workflow behavior rather than only matching the dialog shell. The structured extractor template now produces a more source-like, usable agent configuration while reusing the existing YAML block parsing support.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0307-align-structured-extractor-template.md`
