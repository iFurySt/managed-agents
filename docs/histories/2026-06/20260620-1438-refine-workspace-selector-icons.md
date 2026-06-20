## [2026-06-20 14:38] | Task: Refine Workspace Selector Icons

### Request

Continue the Claude Console clone with OBU-backed sidebar refinements after tightening the header logo and collapse affordance.

### Changes

- Re-captured the Claude Platform Agents sidebar workspace selector with Open Browser Use.
- Changed the local workspace selector icon and chevron to use `data-cds="Icon"` spans with the source glyph text content.
- Wrapped the `Default` workspace label in the same nested text spans as the source selector.
- Kept CSS-drawn fallback shapes for the icon and chevron so the UI stays visible without copying the source Anthropicons font file.

### Evidence

- Source workspace button: `x=13 y=57 w=221.5 h=30`, `role="combobox"`, text content `Default`.
- Source workspace icon: `data-cds="Icon"`, `x=21 y=64 w=16 h=16`, `font-size: 16px`, `font-weight: 533.25`, glyph ``.
- Source chevron icon: `data-cds="Icon"`, `x=216.5 y=64 w=16 h=16`, `font-size: 16px`, `font-weight: 533.25`, glyph ``.
- Local OBU validation after the change matched the same button geometry, icon slot geometry, glyph text content, icon font size, and icon weight.

### Files

- `apps/console/src/App.tsx`
