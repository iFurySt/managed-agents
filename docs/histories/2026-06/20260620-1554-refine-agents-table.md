# Refine Agents Table

## Request

- Continue one-by-one Claude Console cloning with Open Browser Use evidence.
- Tighten visible list-page mismatches instead of relying on approximate styling.

## Changes

- Compared the source Agents list and local Agents list with Open Browser Use.
- Moved the Agents table wrapper styling onto `DataTable` to match the source `data-cds="DataTable"` wrapper shape, padding, and fade mask.
- Updated Agents row ID copy controls to behave like the source: gray, 22px, and hidden until the ID cell is hovered.
- Matched Agents row name links to the source 14px / 400-weight text.

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for source and local Agents list.
- `npm run build --workspace apps/console`
- `go test ./...`
