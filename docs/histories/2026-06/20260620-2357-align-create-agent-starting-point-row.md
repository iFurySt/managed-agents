# Align Create Agent Starting Point Row

## User Request

Continue the Claude Console clone with Open Browser Use source/local comparison.

## Changes

- Matched the Create agent starting point row color to the source `#52514e`.
- Removed the local bold/secondary split treatment and rendered `Starting point`, separator, and selected template as one flex row with inherited source styling.

## Intent

The source dialog treats the starting point selector as subdued metadata rather than a bold field label. Matching that styling reduces visual weight in the top of the Create agent flow.

## Verification

- Open Browser Use compared source and local starting point rows at the same viewport.
- Local row and child text now use `rgb(82, 81, 78)` and `14px / 20px / 400`.
- Local second child changed to a flex row with a 6px gap, matching the source structure more closely.

## Files Touched

- `apps/console/src/App.tsx`
