## [2026-06-20 20:36] | Task: Refine Agents table and sidebar icons

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local-cli`

### User Query

> Continue Claude Console visual parity work, especially the Agents page table alignment and visible sidebar font/icon mismatches.

### Changes Overview

- Area: Console UI
- Key actions:
  - Matched the Agents table horizontal extent to the captured Claude Console source layout without moving the page's left content edge.
  - Rebuilt the sidebar group chevron from two strokes so expanded groups render as a down chevron and collapsed groups rotate consistently.
  - Verified the Agents table geometry with Open Browser Use against the source page.

### Design Intent

The Agents table needed to expand only to the right by 16px. A global shell width change moved the left edge and was rejected during verification, so the final change scopes the width adjustment to the Agents table. The sidebar chevron is drawn as explicit strokes to avoid the previous single-border shape reading as a right arrow in the expanded state.

### Files Modified

- `apps/console/src/App.tsx`
