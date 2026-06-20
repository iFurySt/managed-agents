# Add Memory Stores Pagination Controls

## Request

Continue the Claude Console clone using Open Browser Use evidence and land
small verified milestones.

## Changes

- Added client-side pagination to the Memory stores list with an 8-row page
  size.
- Reset Memory stores pagination to the first page when search, created, or
  status filters change.
- Reset pagination after manually refreshing Memory stores.
- Added previous and next page controls below the Memory stores table.

## Design Intent

Claude Platform shows pagination controls on the Memory stores list even when
all current rows fit on the first page. This keeps Memory stores aligned with
the source page and with the local list surfaces already updated for Agents,
Sessions, Deployments, Environments, and Vaults.

## Verification

- Compared source and local `/memory-stores` pages with Open Browser Use.
- Source Memory stores table measured at `x=272`, `y=244`, `984x229`, with 4
  rows.
- Source pagination buttons measured at `x=280`, `y=485` and `x=320`, `y=485`,
  both `32x32`, `8px` radius, `6px` gap, `20px` line height, `550` font
  weight, and disabled opacity.
- Local Memory stores table renders 4 rows, with pagination buttons at `x=280`,
  `y=485` and `x=320`, `y=485`, both disabled.

## Files

- `apps/console/src/App.tsx`
