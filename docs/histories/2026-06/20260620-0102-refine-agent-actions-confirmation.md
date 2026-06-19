## [2026-06-20 01:02] | Task: Refine agent actions confirmation

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Align the Agents actions menu and archive confirmation with the Claude Platform source page, then commit and push the finished changes.

### Changes Overview

- Area: Console Agents surface.
- Key actions:
  - Replaced the Agents row action menu with the source-matched single `Archive agent` action.
  - Added an Agents archive confirmation dialog with source-matched title, body copy, button labels, and dimensions.
  - Applied the same confirmation flow to the Agent detail page action menu.
  - Removed the accidental memory-store archive/delete state from the Agents page.

### Design Intent

The source Agents page exposes only one row action, `Archive agent`, and gates it behind a confirmation dialog that explains existing sessions keep working. The local console now follows that simpler action model on both list and detail surfaces instead of offering extra navigation actions in the overflow menu.

Source evidence captured the menu as a single-item `data-cds="Menu"` around `148x40`, and the confirmation as `data-cds="ConfirmationDialog"` with title `Archive agent`, body `This agent will be hidden from the default view. Sessions that reference it keep working.`, and `Cancel` / `Archive` buttons.

Local browser validation matched the menu as `data-cds="Menu"` / role `menu` at `148x40` with one item, and the archive confirmation as role `alertdialog` at `510x158` with `Cancel` and `Archive` buttons sized `70x32` and `75x32`.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-0102-refine-agent-actions-confirmation.md`
