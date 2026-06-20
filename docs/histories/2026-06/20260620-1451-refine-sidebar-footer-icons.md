## [2026-06-20 14:51] | Task: Refine Sidebar Footer Icons

### Request

Continue the Claude Console clone with OBU-backed sidebar refinements after matching the header, workspace selector, and navigation icons.

### Changes

- Re-captured the Claude Platform Agents sidebar footer with Open Browser Use.
- Replaced local footer lucide icons with source-style `data-cds="Icon"` glyph spans:
  - `Documentation`: ``
  - `Credits`: ``
  - organization avatar: ``
  - organization chevron: ``
- Kept the existing footer row dimensions, text, spacing, and avatar frame while aligning the icon DOM/text output with the source.

### Evidence

- Source sidebar text output includes ` Documentation`, ` Credits`, and ` Leo ... `.
- Local OBU validation after the change matched the glyph text content and kept the existing footer positions:
  - Documentation icon at `x=20 y=653 w=20 h=20`
  - Credits icon at `x=20 y=693 w=20 h=20`
  - organization avatar glyph at `x=26 y=737 w=20 h=20`
  - organization chevron at `x=219.5 y=739 w=16 h=16`

### Files

- `apps/console/src/App.tsx`
