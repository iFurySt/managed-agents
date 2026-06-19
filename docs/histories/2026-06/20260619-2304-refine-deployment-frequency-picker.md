## [2026-06-19 23:04] | Task: Refine deployment frequency picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source Create deployment schedule `Frequency` combobox with OBU, including options, selected-state behavior, and popup geometry.
  - Replaced the local static frequency button with an interactive CDS-style combobox for `Every minute`, `Every hour`, `Daily`, `Weekdays`, `Weekly`, and `Custom cron`.
  - Wired frequency selection to cron expression previews, field layout changes, custom cron entry, and next-run summaries.

### Design Intent

The scheduled deployment form should behave like the source console rather than only displaying a static weekday preset. This pass keeps the implementation local and simple while making the first frequency picker usable, reversible, and visually aligned with the observed menu dimensions.

### Files Modified

- `apps/console/src/App.tsx`
