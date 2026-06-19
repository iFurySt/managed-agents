## [2026-06-19 23:50] | Task: Refine Environment Actions Confirmations

### Request

Continue cloning Claude Platform managed-agents surfaces with OBU evidence, small verified milestones, and commit/push after each milestone.

### Changes

- Re-captured the Claude Platform Environments row actions menu and confirmation dialogs with Open Browser Use.
- Matched the Environments list row actions menu to the source two-item menu:
  - `Archive`
  - `Delete`
- Added source-matched Environment archive and delete confirmation dialogs with `data-cds="ConfirmationDialog"` and `role="alertdialog"`.
- Wired Environment delete as a real control-plane CRUD route:
  - `DELETE /api/environments/:id`
  - `deleteEnvironment()` console API client
  - list row removal after delete
  - detail page navigation back to `/environments` after delete

### Evidence

- Source menu: `data-cds="Menu"`, role `menu`, `128x72`, two `120x32` items.
- Source archive dialog: title `Archive profile`; text confirms archiving the profile and that archived profiles can no longer create new sessions.
- Source delete dialog: title `Delete profile`; text confirms deletion cannot be undone.
- Local OBU validation matched:
  - menu `128x72`, items `Archive` and `Delete`
  - archive dialog `510x158`, buttons `Cancel` `70px` and `Archive` `75px`
  - delete dialog `510x158`, buttons `Cancel` `70px` and `Delete` `67px`

### Files

- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/apiserver/main.go`
