## [2026-07-16 04:30] | Task: Unify editor control hover and press states

### Execution Context

- Agent ID: Codex CLI session
- Base Model: GPT-5
- Runtime: local console via Vite

### User Query

> The controls inside the environment detail editor do not feel right. Check
> other editor surfaces too; Agent had been fixed before but the other pages
> were not unified. Make editor button hover and click effects consistent.

### Changes Overview

- Area: `apps/console` editor/form control interactions and Claude Console
  design reference.
- Key actions:
  - Added shared editor interaction classes for toolbar buttons, icon buttons,
    select triggers, and YAML/JSON tabs.
  - Applied the shared hover/active behavior to Environment edit controls
    (Edit, networking/package selects, add/remove package, metadata add/remove,
    Save changes, Cancel).
  - Applied the same behavior to Agent create/edit config editor tabs, copy
    buttons, and Generate.
  - Applied the same behavior to Files empty-state code toolbar controls and
    the credential editor selects/buttons used by vault creation.
  - Documented the editor toolbar control interaction rule in `DESIGN.md`.

### Design Intent

Editor-adjacent controls should feel like one compact tool surface: hover uses
the same subtle fill, active state keeps the same fill, and click feedback uses
a small scale press. Avoiding one-off grays and transparent hover overrides
keeps form/editor controls visually consistent across resource pages.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`
