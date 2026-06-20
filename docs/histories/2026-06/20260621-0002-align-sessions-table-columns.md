# Align Sessions Table Columns

## User Request

Continue the Claude Console clone with Open Browser Use source/local comparison across managed agent modules.

## Changes

- Let the Sessions table `Name` and `Agent` columns fill the remaining width instead of using fixed local widths.
- Kept source-like fixed widths for ID, Status, Created, selection, and action columns through the shared `DataTable` colgroup behavior.

## Intent

The live Sessions table uses two wide flexible text columns with compact utility columns. Matching that column model keeps long session names and agent names readable and aligns the list page with the source layout.

## Verification

- Open Browser Use compared source and local Sessions tables at the same viewport.
- Local column widths matched the source sequence: `40 / 160 / 483 / 130 / 483 / 200 / 56`.

## Files Touched

- `apps/console/src/App.tsx`
