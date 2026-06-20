## [2026-06-21 02:50] | Task: Align credential type dropdown

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning Claude Console pages and interactions with OBU-based visual comparison, including dialogs and subpage functionality.

### Changes Overview

- Area: Credential vault Add credential dialog.
- Key actions: Replaced the generic credential type select menu with a dedicated Radix select that renders source-matched option descriptions, item sizing, checked glyph, popover width, and dropdown shadow.

### Design Intent

The source console's credential type menu explains each auth type inline instead of using plain option rows. This keeps the local Radix behavior while matching the visible menu content and dimensions for MCP OAuth, Bearer token, and Environment variable choices.

### Files Modified

- `apps/console/src/App.tsx`
