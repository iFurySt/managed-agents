## [2026-06-21 04:23] | Task: Keep Agents row actions visible

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue cloning the Claude Console managed-agents UI and quickly converge obvious visual/action mismatches.

### Changes Overview

- Area: Console Agents list
- Key actions:
  - Added a compact Agents table width profile for medium desktop viewports.
  - Reduced fixed column widths below `xl` so the row action trigger remains inside the visible table area when the sidebar is expanded.
  - Kept the wider Claude Console-like table layout for `xl` and larger viewports.

### Design Intent

The Agents table used fixed colgroup widths that pushed the row action menu trigger outside the local viewport when the sidebar was expanded. The compact profile preserves the same table structure and row menu behavior while making the action column reachable at the current comparison viewport.

### Files Modified

- `apps/console/src/App.tsx`
