# Align Skills Item Layout

## User Request

Continue converging the Claude Console clone quickly while avoiding broad new scope.

## Changes

- Reworked each Skills list item to use the source page's vertical structure:
  top content/action row plus bottom metadata row.
- Kept the existing item height, padding, action button, hover behavior, and create dialog wiring intact.

## Design Intent

OBU comparisons showed the source Skills item has a `137px` item height with an `82px` top content row and a separate bottom metadata row. The local version placed metadata inside the main content block, making the content area taller than the source. This change keeps the same data and actions while matching the source item density.

## Verification

- OBU verified local Skills item `h=137` and top content row `h=82`.
- OBU verified local version-history button remains at `x=1200`, `y=141`, matching the sampled source layout.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0115-align-skills-item-layout.md`
