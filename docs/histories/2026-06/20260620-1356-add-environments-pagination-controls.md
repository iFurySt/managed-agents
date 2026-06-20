# Add Environments Pagination Controls

## Request

Continue the Claude Console clone using Open Browser Use evidence and land
small verified milestones.

## Changes

- Added client-side pagination to the Environments list with an 8-row page size.
- Reset Environments pagination to the first page when search or status filters
  change.
- Added previous and next page icon buttons below the Environments table,
  matching the source list footer controls.

## Design Intent

Claude Platform shows pagination controls on the Environments list even when all
current results fit on one page. Keeping the footer controls visible makes the
Environments list consistent with the source page and with the local
Agents/Sessions/Deployments list behavior.

## Verification

- Compared source and local `/environments` pages with Open Browser Use.
- Source Environments table measured at `x=272`, `y=244`, `984x229`, with 4
  rows.
- Source pagination buttons measured at `x=280`, `y=485` and `x=320`, `y=485`,
  both `32x32`, `8px` radius, `6px` gap, `20px` line height, `550` font
  weight, and disabled opacity.
- Local Environments table renders 4 rows, with pagination buttons at `x=280`,
  `y=485` and `x=320`, `y=485`, both disabled.

## Files

- `apps/console/src/App.tsx`
