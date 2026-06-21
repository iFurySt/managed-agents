## [2026-06-22 00:11] | Task: Align console document titles

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages, using OBU comparisons and fixing scoped fidelity gaps.

### Changes Overview

- Area: console navigation UX
- Key actions:
  - Added route-aware document titles for the managed agents console pages.
  - Matched list pages to Claude Platform-style titles such as `Agents | Claude Platform` and `Credential vaults | Claude Platform`.
  - Added singular fallback titles for detail pages.

### Design Intent

The cloned console previously kept the browser tab title as `Managed Agents Console` across all routes. The source pages expose route-specific titles, which are visible in browser tabs and OBU page metadata. Route-aware titles improve fidelity without affecting page layout or API behavior.

### Files Modified

- `apps/console/src/App.tsx`
