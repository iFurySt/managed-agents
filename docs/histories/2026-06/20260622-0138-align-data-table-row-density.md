# Align Data Table Row Density

## User Request
Continue converging the Claude Console clone quickly without expanding scope.

## Changes
- Adjusted shared `DataTable` body row height to match the source table density.
- Kept selection, hover, action buttons, column widths, typography, and loading rows unchanged.

## Design Intent
OBU comparison on the Agents page showed the source table wrapper is `319px` tall with row heights `32,46,45,45,45,45,45`, while the local table was `324px` tall because every body row was `46px`. The shared table now uses a 46px first body row and 45px subsequent body rows, matching the measured source geometry.

## Verification
- OBU verified local Agents table wrapper now matches source height: `319px`.
- OBU verified local row heights now match source: header `32px`, first body row `46px`, subsequent rows `45px`.
- OBU verified table `x=280`, `y=148`, and wrapper `x=272`, `y=140` remained aligned.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260622-0138-align-data-table-row-density.md`
