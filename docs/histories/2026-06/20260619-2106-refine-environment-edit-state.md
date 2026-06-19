## [2026-06-19 21:06] | Task: Refine environment edit state

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue cloning Claude Platform managed agents pages with Open Browser Use evidence, small verified milestones, and commit/push after progress.

### Changes Overview

- Area: Console environment detail page.
- Key actions:
  - Compared Claude Platform and local Environment detail edit state with Open Browser Use.
  - Moved edit actions to match source behavior: More actions remains in the header, while Save changes and Cancel render at the bottom of the form.
  - Hid the display-only environment type badge and ID/updated metadata row while editing.
  - Reworked the edit form to the source 800px rhythm with 22px name input, 66px description textarea, transparent full-width networking select, inline package manager/chip/input controls, metadata add/remove buttons, and 376px metadata inputs.
  - Added an optional `showLabel` prop to `FieldSelect` so source-like select triggers can omit their label without changing existing default behavior.

### Design Intent

The source edit view is a form-first state, not a detail header with inline primary actions. This change keeps the local implementation functional while matching the observed Claude Console layout: edit-only fields replace display metadata, package controls stay on a compact single row, and destructive/secondary actions stay in existing dropdown affordances.

OBU verification points:

- Source name input: `x=292 y=180 w=256 h=36 font=22px`; local: `x=292 y=182 w=256 h=36 font=22px`.
- Source description textarea: `x=292 y=252 w=800 h=66`; local: `x=292 y=252 w=800 h=66`.
- Source metadata inputs: key/value at `x=292/676 y=709 w=376 h=36`; local: `x=292/676 y=709.5 w=376 h=36`.
- Source Save changes: `x=292 y=761 h=32`; local: `x=292 y=761.5 h=32`.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
