# Refine Badge Token

## Request

Continue the Claude Console clone with OBU-based visual parity work across the
managed agents console.

## Changes

- Updated the shared CDS `Badge` wrapper to match source badge geometry more
  closely.
- Changed the default badge height from 24px to 20px.
- Changed the radius from 6px to 5px.
- Changed badge text rhythm to 12px font size, 15px line height, and 550 font
  weight.
- Preserved the existing tone colors because the active badge green already
  matched the source.

## Verification

- Compared source and local `/agents` badges with Open Browser Use.
- Source active badges measured at 20px height, 5px radius, 12px font size,
  15px line height, 550 font weight, `rgb(202, 234, 199)` background, and
  `rgb(0, 99, 0)` text.
- Verified local active badges now use the same height, radius, font size,
  line height, font weight, background, and text color.

## Files

- `apps/console/src/components/cds.tsx`
