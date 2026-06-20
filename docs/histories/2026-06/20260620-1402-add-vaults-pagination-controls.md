# Add Vaults Pagination Controls

## Request

Continue the Claude Console clone using Open Browser Use evidence and land
small verified milestones.

## Changes

- Added client-side pagination to the Credential vaults list with an 8-row page
  size.
- Reset Vaults pagination to the first page when search or status filters
  change.
- Added previous and next page controls below the Vaults list table.
- Added client-side pagination and footer controls to the vault credential
  detail table, resetting when the vault or credential status filter changes.

## Design Intent

Claude Platform shows pagination controls on both the Vaults list and the
credentials table inside a vault detail page, even when the visible results fit
on one page. This change keeps Vaults consistent with the source and with the
local list surfaces already updated for Agents, Sessions, Deployments, and
Environments.

## Verification

- Compared source and local `/vaults` and `/vaults/:id` pages with Open Browser
  Use.
- Source Vaults list table measured at `x=272`, `y=244`, `984x139`, with 2
  rows. Source list pagination buttons measured at `x=280`, `y=395` and
  `x=320`, `y=395`.
- Local Vaults list renders 2 rows, with pagination buttons at `x=280`,
  `y=395` and `x=320`, `y=395`, both disabled.
- Source vault detail credential pagination buttons measured at `x=288`,
  `y=566` and `x=328`, `y=566` with 5 source rows.
- Local vault detail credential pagination buttons align horizontally at
  `x=288` and `x=328`, both disabled. The local detail page has 4 seeded
  credentials, so the footer naturally sits higher than the 5-row source table.

## Files

- `apps/console/src/App.tsx`
