## [2026-06-20 03:23] | Task: Refine Radix button trigger

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning the Claude Platform Managed Agents surfaces with Open Browser Use evidence and commit each milestone.

### Changes Overview

- Area: Console shared CDS button and Files empty-state language menu.
- Key actions:
  - Used Open Browser Use to compare the source and local Files language dropdown.
  - Found the local Radix `DropdownMenu.Trigger asChild` button did not open reliably.
  - Updated the shared `Button` component to forward its DOM ref so Radix primitives can attach trigger behavior correctly.

### Design Intent

Keep the local CDS-style button compatible with Radix `asChild` primitives while preserving its existing visual API and default `type="button"` behavior.

### Files Modified

- `apps/console/src/components/cds.tsx`
