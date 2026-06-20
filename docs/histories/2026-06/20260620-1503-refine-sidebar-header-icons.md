# Refine Sidebar Header Icons

## Request

Tighten visible Claude Console sidebar parity, specifically the top brand text and the collapse icon.

## Changes

- Added the local `Anthropicons-Variable` font asset and registered it in the console stylesheet so CDS glyph icons render as the source icon font.
- Added a `font-voice` Tailwind family matching the source Claude Console serif fallback chain.
- Updated the sidebar brand text to use the voice font stack while keeping its source-aligned size, weight, line height, and visual left edge.
- Replaced the hand-drawn sidebar collapse fallback with the direct CDS glyph icon.

## Verification

- OBU compared source `https://platform.claude.com/workspaces/default/agents` and local `http://127.0.0.1:5174/agents`.
- Source collapse icon: `Anthropicons-Variable`, `20px`, weight `433.25`, rect `20x20`, glyph ``.
- Local collapse icon after change: `Anthropicons-Variable`, `20px`, weight `433.25`, rect `20x20`, glyph ``, font status `loaded`.
- Local brand after change: `font-voice`, `16px`, weight `550`, line height `16px`, x `18.40625`, matching the source visual left edge.
