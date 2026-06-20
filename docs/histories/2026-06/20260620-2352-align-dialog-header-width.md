# Align Dialog Header Width

## User Request

Continue the Claude Console clone by using Open Browser Use to compare source and local dialogs.

## Changes

- Updated the shared `ConsoleDialog` header text container to flex and reserve an 8px gap before the close button.
- Matched the Create agent dialog description color to the source `#52514e`.

## Intent

The live Create agent dialog gives the title and description the full header width before the close control. Matching that shared dialog behavior prevents narrow description wrapping and improves future dialog fidelity.

## Verification

- Open Browser Use compared source and local Create agent headers at the same viewport.
- Local title and description width changed from `635px` to the source `627px`.
- Local description color matched source `rgb(82, 81, 78)`.

## Files Touched

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
