## [2026-06-20 14:27] | Task: Restore Sidebar Logo Typography

### Request

Continue the Claude Console clone and tighten the visible sidebar typography called out from the screenshots, especially the `Claude Console` header.

### Changes

- Re-captured the live Claude Platform Agents sidebar with Open Browser Use.
- Restored the visible `Claude Console` brand text to the source-observed inner logo span rather than styling only the outer link.
- Kept the existing sidebar header and collapse button geometry unchanged while matching the visible brand text metrics.

### Evidence

- Source visible logo span: `x=18.40625 y=18 h=16 w=120.7734375`, `16px` font size, `16px` line height, `550` weight.
- Local OBU validation after the change: `x=18.40625 y=18 h=16 w=120.6875`, `16px` font size, `16px` line height, `550` weight.
- The remaining width delta is less than one tenth of a pixel and comes from local font rendering.

### Files

- `apps/console/src/App.tsx`
