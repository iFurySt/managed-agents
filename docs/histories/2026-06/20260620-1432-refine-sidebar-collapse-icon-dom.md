## [2026-06-20 14:32] | Task: Refine Sidebar Collapse Icon DOM

### Request

Continue the Claude Console clone and tighten the remaining visible sidebar header mismatch, especially the collapse icon called out from the screenshots.

### Changes

- Re-captured the Claude Platform Agents sidebar collapse button with Open Browser Use.
- Adjusted the local collapse icon to use the same `inline-flex` wrapper shape and `data-cds="Icon"` inner span as the source button.
- Added the source glyph text `` to the local icon text content while keeping the CSS-drawn fallback shape so the icon renders without copying the source Anthropicons font file.

### Evidence

- Source collapse button: `x=215.5 y=13 w=28 h=28`, `aria-label="Collapse"`, text content ``.
- Source icon span: `data-cds="Icon"`, `x=219.5 y=17 w=20 h=20`, `font-size: 20px`, `font-weight: 433.25`, family `Anthropicons-Variable`.
- Local OBU validation after the change matched the same button geometry, text content, icon slot geometry, 20px font size, and 433.25 icon weight.

### Files

- `apps/console/src/App.tsx`
