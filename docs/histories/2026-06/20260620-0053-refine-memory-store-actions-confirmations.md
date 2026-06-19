## [2026-06-20 00:53] | Task: Refine Memory Store Actions Confirmations

### Request

Continue cloning Claude Platform managed-agents surfaces with OBU evidence, verified milestones, and commit/push after each milestone.

### Changes

- Re-captured the Claude Platform Memory stores row actions menu and confirmation dialogs with Open Browser Use.
- Matched the Memory stores list and detail store actions menu to the source two-item menu:
  - `Archive store`
  - `Delete store`
- Added source-matched Memory store archive and delete confirmation dialogs with `data-cds="ConfirmationDialog"` and `role="alertdialog"`.
- Changed Memory store destructive actions to open confirmations before calling the existing `archiveMemoryStore()` and `deleteMemoryStore()` API clients.

### Evidence

- Source menu: `data-cds="Menu"`, role `menu`, about `145x72`, two about `137x32` items.
- Source archive dialog: title `Archive memory store`; text says the store is hidden from default view while sessions referencing it keep working.
- Source delete dialog: title `Delete memory store`; text says the store and all memories inside it are permanently deleted and cannot be undone.
- Local OBU validation matched:
  - menu `145x72`, items `Archive store` and `Delete store`
  - archive dialog `510x158`, buttons `Cancel` `70px` and `Archive` `75px`
  - delete dialog `510x158`, buttons `Cancel` `70px` and `Delete` `67px`

### Files

- `apps/console/src/App.tsx`
