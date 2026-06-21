## [2026-06-22 00:41] | Task: Fix dismissed banner spacing

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue converging the Claude Console clone with OBU comparison, focusing on
> functionality and obvious visual mismatches without expanding scope.

### Changes Overview

- Area: Console vaults layout fidelity.
- Key actions:
  - Lifted the vault update banner's visible state into `App`.
  - Applied banner-specific vertical spacing only while the banner is actually
    visible.
  - Kept the persisted banner dismissal behavior intact.

### Design Intent

OBU comparison showed the source vaults page with the update banner dismissed
places the page heading at the compact top offset. The local clone hid the
banner but still reserved banner spacing, pushing the heading down. The fix ties
the route shell spacing to actual banner visibility rather than just the route.

### Files Modified

- `apps/console/src/App.tsx`
