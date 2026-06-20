# Align Skill Version Dialog Shadow

## Request

Continue one-by-one Claude Console parity work for subdialogs and nested interactions.

## Changes

- Compared the Skills version history dialog against the source dialog with Open Browser Use.
- Kept the already-aligned size, position, title, metadata, and version row structure.
- Changed the local dialog ring from an inset shadow to the source-style outer panel ring.

## Intent

Reduce remaining visual token drift in the Skills version history dialog without changing behavior or already-matching layout.

## Files

- `apps/console/src/App.tsx`
