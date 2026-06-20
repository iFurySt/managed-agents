## [2026-06-21 02:44] | Task: Align credential dialog select shells

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based visual comparison, focusing on page details and dialogs.

### Changes Overview

- Area: Credential vault detail dialog parity.
- Key actions: Wrapped the Add credential dialog's `Type` and `MCP server` select triggers in source-matched 31px control shells with white translucent fill, 8px radius, and inset ring.

### Design Intent

The source dialog renders these select controls as transparent triggers inside a visible field shell. This keeps the local Radix select behavior while matching the visible Claude Console control boundary without changing global select behavior.

### Files Modified

- `apps/console/src/App.tsx`
