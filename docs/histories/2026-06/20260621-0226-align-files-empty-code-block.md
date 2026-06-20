# Align Files Empty Code Block

## Request

Continue Claude Console parity work across the files and skills surfaces using Open Browser Use source evidence.

## Changes

- Matched the Files empty-state code sample wrapper to the source structure with a grouped flex container.
- Added the source-style `code-scroll-region` wrapper around the code sample body.
- Changed code lines from inline span blocks to block div rows to match the source DOM structure.
- Removed the local negative right margin from the copy-code button so the right action group width matches source measurements.

## Intent

Keep the empty Files state visually stable while making its DOM, scroll/focus behavior, and button alignment closer to the Claude Console source.

## Files

- `apps/console/src/App.tsx`
