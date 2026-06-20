# Refine Sidebar Collapse

## Request

- Tighten the Claude Console sidebar header against the source console.
- Make the sidebar collapse icon/function real instead of leaving it as a static visual.

## Changes

- Confirmed with Open Browser Use that the source `Claude Console` label uses `font-voice`, 16px text, 550 weight, and 16px line height.
- Preserved the expanded sidebar header visual and added the missing sidebar collapse state.
- Added an icon-only collapsed rail with an `Expand` control and retained the source collapse glyph.

## Files

- `apps/console/src/App.tsx`

## Verification

- `npm run build --workspace apps/console`
- Open Browser Use local check: collapse changes the sidebar from 256px to 52px, then expand restores it to 256px.
