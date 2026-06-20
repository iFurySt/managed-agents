# Align Environments Filter Fields

## Request

Continue tightening Claude Console visual parity, with attention to sidebar typography, the collapse icon, and visible differences around the environments surface.

## Changes

- Matched the environments list search field to the source field shell by moving `data-cds="TextInput"` to the outer wrapper.
- Added the source-style inset field ring to the environments search field and Status filter trigger.
- Verified via Open Browser Use computed-style sampling that the sidebar `Claude Console` typography and expanded collapse button already match the source token values and coordinates.

## Intent

Keep the environments list aligned with the same field treatment already applied to agents, sessions, and deployments while avoiding unnecessary churn on sidebar styles that already compare correctly against source.

## Files

- `apps/console/src/App.tsx`
