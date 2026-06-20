# Align Agents Table Columns

## User Request

Continue the Claude Console clone by using Open Browser Use to compare the live source UI against the local console and close visible fidelity gaps.

## Changes

- Added a `colgroup` to the shared `DataTable` so explicit column widths are honored instead of being redistributed by the browser.
- Updated `DataTable` header text to the source-computed `13px / 16px / 550` style.
- Let the Agents table `Name` column fill remaining width, matching the source column layout.

## Intent

The source Agents table uses fixed utility columns with one flexible `Name` column. Matching that structure aligns the table header and body cells without page-specific layout hacks, and gives other list pages a stronger table baseline.

## Verification

- Open Browser Use compared source and local Agents table columns at the same viewport.
- Local column widths matched the source sequence: `40 / 180 / 686 / 170 / 120 / 150 / 150 / 56`.

## Files Touched

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
