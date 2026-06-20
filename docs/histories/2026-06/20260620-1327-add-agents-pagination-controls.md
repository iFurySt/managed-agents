# Add Agents Pagination Controls

## Request

Continue the Claude Console clone with OBU-based visual and functional parity
work.

## Changes

- Added the source-like previous and next pagination buttons below the Agents
  table.
- Matched the source geometry for the controls: 32px square buttons, 8px
  radius, 6px internal gap, 20px line height, 16px chevron icons, and 8px
  horizontal spacing between buttons.
- Positioned the controls at the source-aligned location below the list.

## Verification

- Compared source and local `/agents` pagination with Open Browser Use.
- Source controls measured at `Previous page: x=280, y=575, w=32, h=32` and
  `Next page: x=320, y=575, w=32, h=32`.
- Verified local controls now measure at the same coordinates and dimensions,
  with the same radius, gap, font weight, and line height.

## Files

- `apps/console/src/App.tsx`
