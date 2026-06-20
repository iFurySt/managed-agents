## [2026-06-20 22:54] | Task: Refine credential select aria

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone with OBU comparison across nested vault flows.

### Changes Overview

- Area: Credential vault detail, Add credential dialog.
- Key actions:
  - Compared the Claude Platform and local Add credential dialog combobox DOM through Open Browser Use.
  - Added optional `ariaLabel` support to the shared `FieldSelect` primitive.
  - Matched the local credential Type and MCP server combobox labels to the source `Credential type` and `MCP server` labels.

### Design Intent

The credential creation dialog already matches the source trigger geometry. Adding the source-observed combobox labels keeps the DOM and accessible interaction surface closer to Claude Console without changing visual layout or broad select behavior.

### Verification

- Open Browser Use source check:
  - Type combobox: role `combobox`, aria label `Credential type`, size `454.72x31.36`.
  - MCP server combobox: role `combobox`, aria label `MCP server`, size `454.72x31.36`.
- Open Browser Use local check after the change:
  - Type combobox: role `combobox`, aria label `Credential type`, size `455x31`.
  - MCP server combobox: role `combobox`, aria label `MCP server`, size `455x31`.
- `npm run build --workspace apps/console`
- `go test ./...`

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
