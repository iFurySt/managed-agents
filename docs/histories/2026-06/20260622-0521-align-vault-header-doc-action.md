## [2026-06-22 05:21] | Task: Align vault header documentation action

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Quickly converge the console clone now that functionality is mostly stable; avoid broad new scope and fix visible fidelity gaps.

### Changes Overview

- Area: Console credential vaults page header.
- Key actions:
  - Compared the source and local Credential vaults header actions with Open Browser Use.
  - Added the missing `View documentation` icon action beside `Create vault`.
  - Verified the local Create vault button and documentation icon geometry against the source page.

### Design Intent

The source Credential vaults page keeps the primary create action paired with a
32px documentation icon. Adding the same action to the local header fixes the
visible 40px horizontal offset without changing vault CRUD behavior or broader
page layout.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0521-align-vault-header-doc-action.md`
