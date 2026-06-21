# Align Expanded Sidebar Width

## Request

Continue converging the Claude Console managed agents clone with OBU-based source comparison, avoiding further feature expansion and only fixing obvious visual gaps.

## Changes

- Increased the expanded console sidebar width from `256px` to `360px`.
- Kept the collapsed sidebar rail unchanged at `48px`.

## Intent

The OBU visual metric audit showed source pages placing the main content heading at `x=376` with the expanded sidebar, while the local clone placed the same heading at `x=272`. Widening the expanded sidebar aligns the local main content start with the current source layout without changing route behavior or collapsed-sidebar behavior.

## Files

- `apps/console/src/App.tsx`
