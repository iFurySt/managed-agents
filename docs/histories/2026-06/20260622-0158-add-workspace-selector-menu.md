# Add Workspace Selector Menu

## User Request
Continue converging the Claude Console clone quickly, prioritizing useful functional parity.

## Changes
- Added a Radix-backed dropdown menu to the sidebar workspace selector.
- Kept the existing selector frame, text, workspace icon, and chevron layout unchanged.
- Added menu entries for the current `Default` workspace and `Create workspace`.

## Design Intent
The workspace selector had source-matched visual geometry but no interactive menu. The local selector now opens a small dropdown from the existing trigger while preserving the measured sidebar layout.

## Verification
- OBU verified the local selector frame stayed `x=12`, `y=56`, `w=231.5`, `h=32`.
- OBU verified the trigger opens with `aria-expanded=true` and `data-state=open`.
- OBU verified the local workspace menu opens at `x=12`, `y=93`, `w=232`, `h=89`.
- OBU verified the menu text includes `Default` and `Create workspace`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0158-add-workspace-selector-menu.md`
