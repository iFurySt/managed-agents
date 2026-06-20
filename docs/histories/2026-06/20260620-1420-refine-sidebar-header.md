## [2026-06-20 14:20] | Task: Refine Sidebar Header

### Request

Address the visible sidebar header mismatch called out from the Claude Console screenshots: the `Claude Console` typography and the missing or mismatched collapse icon.

### Changes

- Re-compared the source Claude Platform sidebar header against the local Files page with Open Browser Use.
- Changed the sidebar product link from the previous serif, 16px, heavier logo treatment back to the source-observed sans, 14px, 21px line-height, normal weight text.
- Replaced the plain SVG collapse glyph with a `data-cds="Icon"` shaped panel glyph in the same `20x20` slot used by the source collapse button.

### Evidence

- Source `Claude Console` link: `x=12 y=16.5 h=21`, `14px`, `21px` line-height, `font-weight: 400`, anthropic sans stack.
- Source collapse button: `x=215.5 y=13`, `28x28`, with an inner `20x20` icon at `x=219.5 y=17`.
- Local OBU validation after the change matched the title position, height, font size, line height, weight, and collapse button/icon geometry.
- Local title width remains slightly shorter than the source width, which appears tied to font asset rendering rather than the applied CSS metrics.

### Files

- `apps/console/src/App.tsx`
