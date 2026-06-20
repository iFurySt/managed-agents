## [2026-06-21 01:30] | Task: Align memory store actions menu

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console one interaction at a time with OBU comparisons and small verified pushes.

### Changes Overview

- Area: Console Memory stores actions menu.
- Key actions: Updated the Memory store row/detail actions menu shell to the source-measured menu token: 145px width, 12px radius, source-style ring and shadow, 8px item radius, and source-like item padding.

### Design Intent

The Memory store actions behavior and labels were already source-matched from prior OBU evidence. This change removes the remaining older `rounded-cds` / `shadow-lg` menu styling so the menu visually matches the same cloned CDS dropdown treatment used on other managed-agent surfaces.

### Files Modified

- `apps/console/src/App.tsx`
