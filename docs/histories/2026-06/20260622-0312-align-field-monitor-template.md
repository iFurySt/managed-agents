## [2026-06-22 03:12] | Task: Align field monitor template

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue replicating Claude Console Managed Agents behavior with OBU-backed functional comparisons.

### Changes Overview

- Area: Agents create dialog template behavior.
- Key actions:
  - Used Open Browser Use to compare source and local `Field monitor` template output.
  - Verified the source template emits a multi-step field-watch prompt plus Notion MCP server, MCP toolset, and `field-monitor` metadata.
  - Updated the local template YAML and JSON preview path to preserve Notion MCP configuration and metadata.

### Design Intent

Move another create-agent template from a placeholder prompt toward source-like behavior. The generated config now represents the same operational intent: monitor a field, write a digest, and publish it through Notion-backed tooling.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0312-align-field-monitor-template.md`
