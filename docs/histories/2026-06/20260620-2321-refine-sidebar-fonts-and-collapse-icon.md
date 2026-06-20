# Refine Sidebar Fonts And Collapse Icon

## User Request

Match the Claude Console reference more closely where the sidebar title font, sidebar text sizing, and collapse icon visibly differed.

## Changes

- Increased the sidebar product title size and weight while keeping the Anthropic serif voice font.
- Replaced the previous glyph-based sidebar collapse control with a CSS-drawn panel icon that matches the reference structure more closely.
- Tuned sidebar primary, nested, and footer item font size, line height, and weight for a closer source-console baseline.

## Intent

Keep the visual clone moving in small verified increments without broad layout churn. This pass focuses on the highly visible sidebar chrome called out in review.

## Files Touched

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
