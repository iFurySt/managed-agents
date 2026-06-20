# Align Create Agent Dialog Height

## User Request

Continue the Claude Console clone by using Open Browser Use to compare source and local UI, including dialogs and child flows.

## Changes

- Matched the Create agent dialog height to the source `706px x 941px` presentation.
- Expanded the Agent config editor region so YAML/JSON tabs and the footer Create agent button align with the live source dialog coordinates.
- Added tab semantics to the YAML/JSON format switcher.

## Intent

The source Create agent dialog uses a tall configuration editor as the dominant working area. Matching that height makes the modal workflow feel closer to the real Claude Console and gives the config editor enough visual weight.

## Verification

- Open Browser Use compared the live source and local Create agent dialogs at the same viewport.
- Local dialog dimensions matched the source: `706px x 941px`, `y=150`.
- Local YAML tab and footer button aligned with source positions within a few pixels.

## Files Touched

- `apps/console/src/App.tsx`
