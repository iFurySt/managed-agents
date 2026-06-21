## [2026-06-22 07:35] | Task: Align environment select popover

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone quickly, using OBU evidence and avoiding new scope.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Added optional popper positioning controls to the shared `FieldSelect` CDS component.
  - Switched `FieldSelect` selected indicators from lucide SVG to the source-style Anthropicons check glyph.
  - Aligned the create-environment Hosting type popover to open below the trigger with the source width, shadow, selected background, and item geometry.

### Design Intent

The source create-environment Hosting type menu opens below the trigger and marks the selected item with a CDS glyph plus a muted fill. The local clone was opening the menu over the trigger and used a different check icon. The change keeps positioning opt-in so existing select placements are not moved unintentionally.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
