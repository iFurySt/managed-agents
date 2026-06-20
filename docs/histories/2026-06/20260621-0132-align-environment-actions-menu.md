## [2026-06-21 01:32] | Task: Align environment actions menu

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console one interaction at a time with OBU comparisons and small verified pushes.

### Changes Overview

- Area: Console Environments actions menu.
- Key actions: Updated the Environment row/detail actions menu shell to the source-measured menu token: 128px width, 12px radius, source-style ring and shadow, 8px item radius, and source-like item padding.

### Design Intent

The Environment actions behavior and labels were already source-matched from prior OBU evidence. This change removes the remaining older `rounded-cds` / `shadow-lg` menu styling so the menu visually matches the cloned CDS dropdown treatment used elsewhere.

### Files Modified

- `apps/console/src/App.tsx`
