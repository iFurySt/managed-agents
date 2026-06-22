## [2026-06-22 08:18] | Task: Align credential type selected state

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone through source/local OBU comparison, including child pages and dialogs.

### Changes Overview

- Area: Vault credential dialog.
- Key actions:
  - Compared the vault detail `Add credential` dialog and `Type` dropdown against the source UI.
  - Added a checked-state background to the credential auth type options.
  - Verified the local selected `MCP OAuth` option now uses `rgba(11, 11, 11, 0.05)` like the source.

### Design Intent

This is a narrow visual parity fix for a source-proven dropdown state. It keeps the existing Radix select behavior while matching the CDS selected-row treatment used by Claude Console.

### Files Modified

- `apps/console/src/App.tsx`
