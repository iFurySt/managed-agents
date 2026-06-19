## [2026-06-20 00:49] | Task: Refine Vault Actions Confirmations

### Request

Continue cloning Claude Platform managed-agents surfaces with OBU evidence, verified milestones, and commit/push after each milestone.

### Changes

- Re-captured the Claude Platform Credential vaults row actions menu and confirmation dialogs with Open Browser Use.
- Matched the Vaults list and detail actions menu to the source two-item menu:
  - `Archive`
  - `Delete`
- Added source-matched Vault archive and delete confirmation dialogs with `data-cds="ConfirmationDialog"` and `role="alertdialog"`.
- Changed Vault list and detail destructive actions to open confirmations before calling the existing `archiveVault()` and `deleteVault()` API clients.

### Evidence

- Source menu: `data-cds="Menu"`, role `menu`, `128x72`, two `120x32` items.
- Source archive dialog: title `Archive vault`; text warns that active sessions using the vault will lose credentials and that the vault can no longer create new sessions.
- Source delete dialog: title `Delete vault`; text warns that all credentials in the vault are also deleted and the action cannot be undone.
- Local OBU validation matched:
  - menu `128x72`, items `Archive` and `Delete`
  - archive dialog `510x178`, buttons `Cancel` `70px` and `Archive` `75px`
  - delete dialog `510x158`, buttons `Cancel` `70px` and `Delete` `67px`

### Files

- `apps/console/src/App.tsx`
