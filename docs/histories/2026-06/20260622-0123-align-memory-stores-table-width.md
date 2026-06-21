# Align Memory Stores Table Width

## User Request

Continue converging the Claude Console clone quickly while avoiding broad new scope.

## Changes

- Reduced the Memory stores table width from `1552px` to `968px`.
- Reduced the Memory stores `Name` column from `936px` to `352px`.
- Kept filters, row actions, pagination, and data behavior unchanged.

## Design Intent

OBU comparisons showed the source Memory stores table uses a 968px table with columns `40 + 200 + 352 + 120 + 200 + 56`. The local table used a much wider horizontal-scroll layout, which made the first viewport differ materially from the source.

## Verification

- OBU verified local Memory stores headers now match the source widths and coordinates.
- OBU verified local Memory stores row width is `968px`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0123-align-memory-stores-table-width.md`
