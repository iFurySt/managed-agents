# Align Create Session Dialog Icons

## User Request

Continue cloning Claude Console managed-agent surfaces with Open Browser Use comparison, focusing on visible parity for the sessions workflow.

## Changes

- Replaced Create session dialog management-link SVG icons with the source-style CDS text link and Anthropicons external-link glyph.
- Changed the Resource picker prefix from a text plus sign to the source Anthropicons `` glyph.
- Allowed `FieldSelect` labels to accept React nodes so CDS glyph labels can be rendered without one-off picker code.
- Reused the same dialog text-link treatment for Create deployment management links to keep related dialogs visually consistent.

## Intent

Keep the Sessions create flow moving toward source parity in small verified increments. This pass preserves the existing form behavior while aligning the visible icon system and DOM markers with the live Claude Console dialog.

## Files Touched

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
