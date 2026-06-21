# Add Sidebar User Menu

## User Request
Continue converging the Claude Console clone quickly, prioritizing functional parity where useful.

## Changes
- Added a Radix-backed dropdown menu to the sidebar user trigger.
- Matched the source menu content: email, current organization, Organization settings, Feedback, Get help, Language, Legal center, and Log out.
- Positioned the menu to the right of the sidebar user trigger with the same measured source width and coordinates.

## Design Intent
The sidebar user row had been converted to a button trigger, but it still did not open a menu. OBU comparison showed the source menu opens as a 288px right-side popup aligned near the bottom of the sidebar. The local trigger now exposes the same dropdown surface using the existing `CdsDropdownMenu` wrapper.

## Verification
- OBU captured source menu geometry: `x=249.5`, `y=472`, `w=288`, `h=299`.
- OBU verified local menu geometry now matches: `x=249.5`, `y=472`, `w=288`, `h=299`.
- OBU verified local menu text includes `Organization settings`, `Feedback`, `Get help`, `Language`, `Legal center`, and `Log out`.
- OBU verified the trigger reaches `aria-expanded=true` when opened.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0154-add-sidebar-user-menu.md`
