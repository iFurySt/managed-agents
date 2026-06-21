# Align Selectable Table Headers

## User Request

Continue converging the Claude Console clone quickly while avoiding broad new scope.

## Changes

- Updated the shared console `DataTable` so tables with a selection column render 13px headers.
- Kept non-selectable table headers at 12px, matching the credential vaults source page.

## Design Intent

OBU comparisons showed source Agents and Sessions tables use 13px table headers when the leading selection column is present, while Vaults uses 12px headers without selection. The implementation keeps that rule inside the shared table component instead of adding page-specific overrides.

## Verification

- OBU verified local Agents and Sessions headers render at `13px`.
- OBU verified local Vaults headers remain `12px`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched

- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260622-0110-align-selectable-table-headers.md`
