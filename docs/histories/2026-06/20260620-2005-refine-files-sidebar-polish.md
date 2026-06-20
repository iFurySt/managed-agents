## [2026-06-20 20:05] | Task: Refine files sidebar polish

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Tighten visible Claude Console parity issues: Files page sidebar state, non-wrapping docs action, sidebar title font, and the sidebar collapse icon.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Route Build sidebar `Files` and `Skills` items through real links so active page highlighting works outside Managed Agents.
  - Keep the Files empty-state `View docs` action on one line.
  - Match the sidebar `Claude Console` title to the serif console heading style.
  - Replace the generic collapse glyph with a CSS-drawn panel icon closer to the source UI.

### Design Intent

These changes keep the clone moving toward visual parity without widening component scope. Build navigation now reuses the same sidebar active-state component as managed-agent routes, while the title and collapse icon fixes stay local to the sidebar header.

### Files Modified

- `apps/console/src/App.tsx`
