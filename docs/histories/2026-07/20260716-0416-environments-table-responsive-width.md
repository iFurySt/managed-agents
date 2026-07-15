## [2026-07-16 04:16] | Task: Environments table responsive width

### Execution Context

- Agent ID: Codex CLI session
- Base Model: GPT-5
- Runtime: local console via Vite

### User Query

> Compare the local `/environments` page with the Claude Console environments
> page. The local page's minimum width is too wide after split-screening; the
> table should be narrower at the page level and scroll horizontally inside the
> table area. Update `DESIGN.md` if needed.

### Changes Overview

- Area: `apps/console` list table layout and Claude Console design reference.
- Key actions:
  - Changed the shared `DataTable` wrapper to be a `min-width: 0` horizontal
    scroll container instead of hiding horizontal overflow.
  - Updated the Environments list table to let its container fill the available
    page width while keeping the table's content floor as `min-width: 913px`.
    This preserves the dense column widths but moves overflow to the table
    scroller instead of the page.
  - Removed the global `body` `min-width: 1024px`, which otherwise kept the
    whole app wider than split-screen viewports even after the table overflow
    behavior was corrected.
  - Documented the responsive overflow contract in the Claude Console design
    reference.

### Design Intent

The table should keep stable column geometry for ID/name/status/type/metadata,
but that content width belongs to the table itself, not to the page shell or
`body`. The page can shrink in split-screen layouts while the table provides
localized horizontal scrolling when its columns no longer fit.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
- `apps/console/src/styles.css`
- `docs/references/claude-console/DESIGN.md`
