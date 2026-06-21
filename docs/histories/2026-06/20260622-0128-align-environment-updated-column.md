# Align Environment Updated Column

## User Request

Continue converging the Claude Console clone quickly while avoiding broad new scope.

## Changes

- Added an optional `align` setting to the shared console `DataTable` columns.
- Applied right alignment to the Environments `Updated at` column.
- Kept all existing table data, actions, selection, loading, and row behavior unchanged.

## Design Intent

OBU comparisons showed the source Environments table right-aligns the `Updated at` header and cells, while the local table left-aligned them. The shared table now supports the same alignment without page-specific markup hacks.

## Verification

- OBU verified local Environments `Updated at` header and first-row cell have `textAlign: right`.
- OBU verified local `Updated at` column kept source coordinates and width: `x=1052`, `w=140`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260622-0128-align-environment-updated-column.md`
