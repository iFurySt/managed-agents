# Refine Row Action Icons

## Request

Continue the Claude Console clone with OBU-based visual parity work across the
managed agents console.

## Changes

- Replaced text-based row action ellipses with a 20px `MoreHorizontal` icon
  slot across shared table defaults and module-specific dropdown triggers.
- Added a small `MoreActionsIcon` helper for App-level row action menus so
  action buttons use a consistent icon treatment.
- Updated the shared `DataTable` fallback action button to use the same
  20px icon geometry.

## Verification

- Compared source and local `/agents` row action buttons with Open Browser Use.
- Source row actions use a 28px button with a 20px inner icon slot.
- Verified local row action buttons still render as 28px buttons and now
  contain a 20px SVG icon instead of an 18px text glyph.
- Confirmed no `⋯` text glyphs remain under `apps/console/src`.

## Files

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
