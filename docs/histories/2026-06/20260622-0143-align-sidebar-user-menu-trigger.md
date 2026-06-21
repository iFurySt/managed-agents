# Align Sidebar User Menu Trigger

## User Request
Continue converging the Claude Console clone quickly without expanding scope.

## Changes
- Changed the sidebar footer user identity row from a plain `div` to a `button` trigger.
- Preserved the existing footer geometry so Documentation, Credits, and user text positions stay stable.

## Design Intent
OBU comparison showed the source sidebar user row is a `BUTTON` trigger, while the local clone rendered the same row as a static `DIV`. The local row now has matching trigger semantics without moving the already-aligned Documentation and Credits rows.

## Verification
- OBU verified the local user row is now `tag: BUTTON` with `aria-label: User menu`.
- OBU verified the local user row remains `x=12`, `w=231.5`, and `h=44` to avoid layout churn.
- OBU verified Documentation row stayed at `x=12`, `y=645`, `h=36`.
- OBU verified Credits row stayed at `x=12`, `y=685`, `h=36`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0143-align-sidebar-user-menu-trigger.md`
