# Align Create Session Agent Picker

## User Request

Continue cloning Claude Console managed-agent surfaces with Open Browser Use comparison, including dialogs and nested interactions.

## Changes

- Replaced the Create session Agent field's plain ID select with a source-like two-line agent picker.
- Added source-style agent names and updated-time helper text for the picker options.
- Added the empty search row above the agent options so the opened picker matches the live Claude Console combobox structure more closely.
- Tuned the picker popover, search row, viewport, and option dimensions against Open Browser Use captured boxes.

## Intent

Move the Sessions create flow beyond static dialog parity into nested interaction parity. The picker still submits the selected agent id while presenting the same human-readable agent list shape as the source console.

## Files Touched

- `apps/console/src/App.tsx`
