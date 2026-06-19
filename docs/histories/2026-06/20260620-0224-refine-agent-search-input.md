## [2026-06-20 02:24] | Task: Refine agent search input

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and verified small milestones.

### Changes Overview

- Area: Console Agents list page.
- Key actions:
  - Used OBU to compare the source and local Agents toolbar search control.
  - Replaced the local bordered input with the source-like `data-cds="TextInput"` wrapper.
  - Matched the source search wrapper dimensions and styling: 320x32, white/50 background, no visible border, and 8px radius.
  - Kept the inner search input transparent with the same placeholder and accessible label.

### Design Intent

The source Agents search control uses a CDS wrapper with transparent input content instead of a standalone bordered input. Matching that structure reduces visible drift in the toolbar while keeping the existing filter behavior unchanged.

### Files Modified

- `apps/console/src/App.tsx`
