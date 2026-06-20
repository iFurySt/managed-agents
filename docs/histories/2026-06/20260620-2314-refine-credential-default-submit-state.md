## [2026-06-20 23:14] | Task: Refine credential default submit state

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning the Claude Console vault credential dialog, including nested functions and interactions.

### Changes Overview

- Area: Credential vault detail, Add credential dialog.
- Key actions:
  - Compared the Claude Platform default MCP OAuth credential form state with the local clone through Open Browser Use.
  - Changed auth type switching so the target value is cleared instead of storing the example MCP server URL as real input.
  - Kept the example MCP server URL visible in the combobox while leaving `Connect` disabled until a real target exists.

### Design Intent

The source dialog displays `https://mcp.example.com` as placeholder-like copy, but the default form still has no target selected and the primary action is disabled. The local clone previously treated the example URL as a submitted value, making the default form incorrectly actionable. This preserves the visible placeholder while matching the source interaction state.

### Verification

- Open Browser Use source check:
  - Default MCP OAuth form shows `https://mcp.example.com`.
  - `Connect` is disabled.
- Open Browser Use local check after the change:
  - Default MCP OAuth form still shows `https://mcp.example.com`.
  - `Connect` is disabled.
- `npm run build --workspace apps/console`
- `go test ./...`

### Files Modified

- `apps/console/src/App.tsx`
