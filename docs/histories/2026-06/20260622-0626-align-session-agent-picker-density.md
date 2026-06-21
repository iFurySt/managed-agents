## [2026-06-22 06:26] | Task: Align session agent picker density

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge visible fidelity without expanding scope; functionality is mostly acceptable.

### Changes Overview

- Area: Console sessions create dialog.
- Key actions: Aligned the create-session agent picker popover offset, search row sizing, viewport height, and footer spacing with the Claude Console reference.

### Design Intent

The reference picker starts the first agent row at `y=372` and places the create-new-agent footer at `y=607`. The local clone now preserves that same vertical rhythm while keeping the existing picker behavior unchanged.

### Files Modified

- `apps/console/src/App.tsx`
