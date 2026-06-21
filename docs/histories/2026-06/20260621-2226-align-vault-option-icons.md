# Align Vault Option Icons

## Request

Continue narrowing the Claude Console clone against source evidence without expanding scope.

## Changes

- Added the source-style vault glyph to shared credential vault picker options.
- Applied the same option rendering to Create session and Create deployment vault pickers.

## Intent

The current Claude Console vault picker options show a leading vault icon before the vault name. This pass closes that small visual gap while preserving the existing picker behavior and seeded vault data.

## Files

- `apps/console/src/App.tsx`
