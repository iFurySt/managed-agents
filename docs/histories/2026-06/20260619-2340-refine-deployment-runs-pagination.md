# Refine Deployment Runs Pagination

## Request

Continue one-by-one Claude Platform managed agents cloning work with OBU evidence, including deployment child pages and small verified milestones.

## Changes

- Added source-matched pagination controls to the deployment detail `Runs` tab.
- Used 32px icon buttons with `Previous page` and `Next page` labels below the runs table.
- Kept the controls disabled for the current local single-page run set while matching the source visual placement.

## Evidence

- Source OBU capture: deployment runs table shows previous and next page buttons at x=280 and x=320, y=552, each 32x32.
- Local OBU verification: buttons render at x=280 and x=320, y=552.5, each 32x32, below the local runs table.

## Verification

- `npm run build:console`
- `go test ./...`
- `git diff --check`
