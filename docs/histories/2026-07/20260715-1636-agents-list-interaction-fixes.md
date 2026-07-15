## [2026-07-15 16:36] | Task: Agents list interaction fixes (row link, copy feedback, search clear, filter width, hover color)

### Execution Context

- Agent ID: Claude Code CLI session
- Base Model: claude-fable-5
- Runtime: local dev (console via Vite, apiserver via `go run`)

### User Query

> On /agents: (1) clicking any cell of a row should open the detail page
> (except copy icon / row menu / checkbox); (2) the filter dropdown pill
> overflows when a long value like "Last 24 hours" is selected; (3) the
> search input needs a clear (×) icon on the right when it has a value;
> (4) the ID copy icon should switch to a check for a couple of seconds
> with a "Copied" tooltip — check DESIGN.md, and if undefined, inspect the
> real platform.claude.com console and backfill DESIGN.md; (5) the row
> hover background color looks wrong.

### Changes Overview

- Area: `apps/console` (cds design-system components + list pages), plus
  `docs/references/claude-console/DESIGN.md`.
- Key actions:
  - `DataTable` gained a `getRowHref` prop that renders a full-row link
    overlay (`<a>` with `absolute inset-0 z-[1]`, sized by the `tr`'s
    `transform: translate(0,0)` containing block). Wired on Agents and
    Sessions lists. Checkbox/actions already sat at `z-10`; the new copy
    button does too, so those controls do not trigger navigation.
  - Row hover background corrected from `#fbfaf7` to `rgba(11,11,11,0.05)`
    per DESIGN.md and verified against the live console.
  - New `CopyIdButton` component: click copies the value, swaps the copy
    glyph to a check for 2s, and shows a "Copy"/"Copied" tooltip (Radix
    Tooltip, ink bg, white 13px text, radius 6px, bottom + 4px). Replaced
    the 7 identical ID-cell copy buttons across the list pages.
  - New `SearchClearButton` (ink × glyph, 22px ghost button) shown inside
    the Agents and Sessions search inputs whenever they have a value.
  - Removed all fixed `w-[…px]` trigger widths from the top filter
    `FieldSelect`s (12 spots) so the pill sizes to its selected value —
    matches the live console, which uses content-driven trigger width.
  - DESIGN.md backfilled after inspecting platform.claude.com with Open
    Browser Use: full-row link overlay pattern, copy-button click feedback
    (~2s check + Copied tooltip, no toast), tooltip component spec, search
    clear button, content-driven filter trigger width, and the stronger
    `rgba(11,11,11,0.10)` selected/active row fill.

### Design Intent

Match the observed behavior of the real Claude Console rather than
inventing local conventions: navigation uses a real link overlay (so
middle-click/cmd-click work and interactive controls opt out via
z-index), and copy feedback stays local to the button (icon swap +
tooltip) instead of a global toast. Fixed filter widths were the root
cause of the overflow, so they were removed in favor of intrinsic sizing
everywhere instead of patching individual widths. The measured specs were
recorded in DESIGN.md so future work has a reference and does not need to
re-probe the live product.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`
