## [2026-06-20 01:22] | Task: Refine session detail actions

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Session detail surface.
- Key actions:
  - Replaced the Session detail `Actions` menu items with the source-matched `Send interrupt`, `Send event…`, and `Archive session` actions.
  - Kept transcript copy/download in the transcript toolbar, matching the source separation between toolbar controls and lifecycle actions.
  - Wired `Send interrupt` to append a local interrupt message and `Send event…` to open the existing Ask Claude event composer surface.

### Design Intent

Source validation showed the Session detail `Actions` button at about `96x32` and the menu as `data-cds="Menu"` around `160x113`, with three actions: `Send interrupt`, `Send event…`, and `Archive session`. The local detail menu now matches that lifecycle action set instead of mixing copy/download utilities into the dropdown.

Local OBU validation confirmed the `Actions` button at `96x32`, the menu at `160x113`, and the exact item order.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-0122-refine-session-detail-actions.md`
