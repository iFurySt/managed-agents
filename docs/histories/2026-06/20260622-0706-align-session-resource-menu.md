## [2026-06-22 07:06] | Task: Align session resource menu

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone with OBU, focusing on functional one-to-one behavior and quick convergence rather than new scope.

### Changes Overview

- Area: Console create-session dialog.
- Key actions: Replaced the old resource instance select with a source-style resource type dropdown for `GitHub Repository`, `File`, and `Memory Store`; added resource configuration cards and a File resource form shell with `File ID`, `Mount Path`, and remove action.

### Design Intent

The live Claude Console opens a resource type menu from the create-session dialog, not a list of existing local resource names. This change keeps the interaction local to the session dialog while moving the visible behavior and follow-on File branch toward the source flow.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0706-align-session-resource-menu.md`
