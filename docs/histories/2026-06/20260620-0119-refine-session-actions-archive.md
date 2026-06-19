## [2026-06-20 01:19] | Task: Refine session actions archive flow

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Sessions lifecycle actions.
- Key actions:
  - Added `POST /api/sessions/:id/archive` to archive a session and record a lifecycle event.
  - Replaced the Sessions row menu with the source-matched single `Archive session` item.
  - Added a source-matched `Archive session` confirmation dialog and reused it from the list, session detail page, and agent detail sessions panel.
  - Updated session status filters and badges to include `Archived`.

### Design Intent

Source validation showed the Sessions row actions menu as a single `Archive session` item in a `data-cds="Menu"` around `160x40`. Clicking it opens a `data-cds="ConfirmationDialog"` alert dialog with the body `This session won't accept new events and will be hidden. This can't be undone.` and `Cancel` / `Archive` buttons. The local console now models archive as the primary session lifecycle action instead of exposing direct `Open`, `Copy`, and `Cancel` actions in the row menu.

Local OBU validation confirmed the row menu as a single-item `Archive session` menu at `160x40`, and the confirmation as `510x158` with matching title, body, role, and button labels.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `docs/histories/2026-06/20260620-0119-refine-session-actions-archive.md`
