## [2026-06-22 03:36] | Task: Align sidebar group label

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone and address visible sidebar font differences.

### Changes Overview

- Area: Console sidebar navigation.
- Key actions:
  - Compared source and local sidebar nav labels through browser automation.
  - Removed `flex-1` from group labels so `Managed Agents` matches the source text width.
  - Moved the group chevron to `ml-auto` so it remains right aligned.
  - Added workspace-route aliases to group active detection so local `/agents` activates the managed group like the source page.
  - Verified `Managed Agents` now matches the source width and `580` active weight.
  - Ran console lint and build.

### Design Intent

This narrows a visible sidebar typography mismatch without changing page routing or child item behavior. The active group now reflects both local clone routes and source-style workspace routes.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0336-align-sidebar-group-label.md`
