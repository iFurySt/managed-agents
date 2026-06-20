# Add Deployments Pagination Controls

## Request

Continue the Claude Console clone using Open Browser Use evidence and land
small verified milestones.

## Changes

- Added client-side pagination to the Deployments list with an 8-row page size.
- Reset Deployments pagination to the first page when search or filters change.
- Added previous and next page icon buttons below the Deployments table, matching
  the source list footer controls.

## Design Intent

Claude Platform shows pagination controls on the Deployments list even when the
current result set fits on one page. Keeping the controls present makes the
table footer and interaction model consistent with the source and with the
Agents/Sessions list pages already cloned locally.

## Verification

- Compared source and local `/deployments` pages with Open Browser Use.
- Source Deployments table measured at `x=272`, `y=252`, `984x94`, with 1 row.
- Source pagination buttons measured at `x=280`, `y=366` and `x=320`,
  `y=366`, both `32x32`, `8px` radius, `6px` gap, `20px` line height, `550`
  font weight, and disabled opacity.
- Local Deployments table renders 1 row, with pagination buttons at `x=280`,
  `y=366.5` and `x=320`, `y=366.5`, both disabled.

## Files

- `apps/console/src/App.tsx`
