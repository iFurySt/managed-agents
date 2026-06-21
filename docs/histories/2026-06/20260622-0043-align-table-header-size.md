## [2026-06-22 00:43] | Task: Align table header size

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue converging the Claude Console clone with OBU comparison and small,
> verified visual fidelity fixes.

### Changes Overview

- Area: Shared console table component.
- Key actions:
  - Changed `DataTable` header rows from 13px text to the source console's
    12px table-header token.
  - Verified the local vaults table header with OBU after rebuilding.

### Design Intent

The source console's credential vaults table headers compute to 12px text,
16px line height, and 550 weight. The local shared `DataTable` used 13px,
making every list page table header slightly too large. The fix applies the
source-sized header token in the shared component.

### Files Modified

- `apps/console/src/components/cds.tsx`
