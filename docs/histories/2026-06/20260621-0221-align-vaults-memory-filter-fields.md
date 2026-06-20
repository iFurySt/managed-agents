# Align Vaults And Memory Filter Fields

## Request

Continue one-by-one Claude Console visual parity work across the managed-agent list surfaces using Open Browser Use evidence.

## Changes

- Matched the credential vaults list search field to the source field shell by moving `data-cds="TextInput"` to the outer wrapper.
- Added the source-style inset field ring to the credential vaults Status filter.
- Matched the memory stores list search field to the same source field shell treatment.
- Added the source-style inset field ring to memory stores Created and Status filters.

## Intent

Bring vaults and memory stores in line with the field token already verified for agents, sessions, deployments, and environments. Files was inspected but left unchanged because the current source view showed a different documentation/code state rather than the list filter state.

## Files

- `apps/console/src/App.tsx`
