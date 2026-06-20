# Refine Sidebar Fonts And Collapse Icon

## User Request

Match the Claude Console reference more closely where the sidebar title font, sidebar text sizing, and collapse icon visibly differed.

## Changes

- Matched the sidebar product title to the source-computed Anthropic serif `16px / 16px / 550` treatment.
- Replaced the previous glyph-based sidebar collapse control with a CSS-drawn panel icon and positioned it next to the product title to match the source header chrome.
- Tuned sidebar primary, nested, and footer item font size, line height, and weight against source-computed values captured with Open Browser Use.
- Matched the expanded sidebar width to the source `256px` layout so nav items, the sidebar header, and the main list-page content align with the live Claude Console coordinates.

## Intent

Keep the visual clone moving in small verified increments without broad layout churn. This pass focuses on the highly visible sidebar chrome called out in review and corrects the title/nav text sizing and sidebar width against live source-page computed styles.

## Files Touched

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
