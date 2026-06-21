## [2026-06-22 03:43] | Task: Align sidebar top-level active item

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone and close visible/sidebar parity gaps.

### Changes Overview

- Area: Console sidebar navigation.
- Key actions:
  - Added active-state detection to top-level `IconItem` links.
  - Applied the active sidebar background/text color to the current top-level route.
  - Added `aria-current="page"` to active top-level sidebar links.
  - Verified `/dashboard` marks `Dashboard` active while leaving `API keys` inactive.
  - Ran console lint and build.

### Design Intent

Top-level sidebar links should behave like managed child links: the current route is visually active and carries the accessibility marker. This keeps the sidebar behavior consistent while preserving existing dimensions and routing.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0343-align-sidebar-iconitem-active.md`
