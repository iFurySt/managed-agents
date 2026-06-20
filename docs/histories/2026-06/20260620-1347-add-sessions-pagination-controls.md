# Add Sessions Pagination Controls

## Request

Continue the Claude Console clone using Open Browser Use evidence and keep
landing small verified milestones.

## Changes

- Added client-side pagination to the Sessions list with an 8-row page size,
  matching the current Claude Platform sessions table page length.
- Reset Sessions pagination to the first page when filters or search inputs
  change.
- Added source-shaped previous and next page icon buttons below the Sessions
  table.

## Design Intent

The source Sessions page has the same compact pagination control used on the
Agents list. This change keeps the behavior local and low-risk while making the
visible list height and footer controls line up with the source page.

## Verification

- Compared source and local `/sessions` pages with Open Browser Use.
- Source Sessions table measured at `x=272`, `y=244`, `984x409`, with 8 rows.
- Source pagination buttons measured at `x=280`, `y=665` and `x=320`,
  `y=665`, both `32x32`, `8px` radius, `6px` gap, `20px` line height, and
  `550` font weight.
- Local Sessions table now renders 8 rows on the first page, with pagination
  buttons at `x=280`, `y=664.5` and `x=320`, `y=664.5`.
- Verified the Next page button advances to the remaining rows and toggles
  Previous/Next disabled state correctly.

## Files

- `apps/console/src/App.tsx`
