## [2026-06-21 02:56] | Task: Align bearer credential form

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based visual comparison, including dialogs and subpage functionality.

### Changes Overview

- Area: Credential vault Add credential dialog.
- Key actions: Aligned the `Bearer token` auth type state with the source console by keeping the target field as `MCP server`, reusing the MCP server select shell, and switching the primary button label and width to `Add credential`.

### Design Intent

The source console treats Bearer token credentials as MCP server-scoped credentials instead of arbitrary endpoint text. This change keeps local form behavior closer to the source flow while preserving the existing Radix select implementation.

### Files Modified

- `apps/console/src/App.tsx`
