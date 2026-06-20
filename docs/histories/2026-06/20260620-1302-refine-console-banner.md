# Refine Console Banner

## Request

Continue the Claude Console clone with OBU-based visual parity work across the
managed agents console.

## Changes

- Refined the global announcement banner to better match the source console:
  76px height, 12px radius, 1px card ring, 16px bottom margin, 8px outer gap,
  and 14px/20px type rhythm.
- Reworked the banner body into the source-like wrapping flex layout with
  16px column gap and 12px row gap.
- Matched the banner icon color and the primary action's 28px height,
  130px width, 7px radius, 10px horizontal padding, and 550 font weight.
- Replaced the textual dismiss glyph with a 32px icon button containing a
  20px close icon, while preserving the source button position.
- Added 24px top padding to the page content wrapper so changing the banner
  margin to the source value does not move the already-aligned page header.

## Verification

- Compared the source and local `/agents` pages with Open Browser Use.
- Verified local banner at `x=268`, `y=12`, `w=992`, `h=76`, with 12px
  radius, 16px bottom margin, and a 1px rgba(11, 11, 11, 0.1) ring.
- Verified local content wrapper at `x=312`, `y=24`, `w=902`, `h=52`,
  with `gap: 12px 16px`.
- Verified local primary button at `x=310`, `y=52`, `w=130`, `h=28`,
  and local dismiss button at `x=1222`, `y=18`, `w=32`, `h=32`.
- Verified the Agents heading remains at `x=280`, `y=128` after the layout
  change.

## Files

- `apps/console/src/App.tsx`
