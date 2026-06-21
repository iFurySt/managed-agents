## [2026-06-22 00:50] | Task: Align dialog overlay

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue using OBU to compare the Claude Console clone against source pages
> and converge remaining dialog and UI fidelity details.

### Changes Overview

- Area: Shared console dialog component.
- Key actions:
  - Changed the default `ConsoleDialog` overlay from black at 35% with 1px
    blur to black at 40% with 2px blur.
  - Verified the source and local Create vault dialog overlay with OBU.

### Design Intent

Source dialogs use a stronger dimmed backdrop with 2px blur. Aligning the
shared `ConsoleDialog` default makes modal presentation consistent across
remaining dialogs without touching individual page behavior.

### Files Modified

- `apps/console/src/components/cds.tsx`
