# Align Deployment Vault Picker Options

## Request

Continue source-driven convergence of the Claude Console managed agents clone.

## Changes

- Matched the Create deployment credential vault picker to the source options.
- Updated `Temporary vault` to show `3 days ago` and `No credentials`.
- Removed the extra `GitHub source access` option from this picker.
- Rendered `test_secret` with three credential glyphs instead of a text summary.

## Intent

Keep the deployment creation flow aligned with the source console while limiting the change to the picker fixture and display surface.

## Files

- `apps/console/src/App.tsx`
