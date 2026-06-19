## [2026-06-19 23:10] | Task: Refine deployment timezone picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source scheduled deployment `Timezone` combobox with OBU, including popup size, filter input, row sizing, and visible option formatting.
  - Replaced the local static timezone button with an interactive CDS-style timezone picker.
  - Generated timezone options from browser `Intl` data, displayed GMT offsets in source-like labels, and wired the selected timezone into the create deployment payload.

### Design Intent

Timezone selection is part of making scheduled deployments functionally usable instead of only visually present. This pass keeps the picker implementation lightweight while matching the source popup dimensions, scroll behavior, filter input, and option truncation.

### Files Modified

- `apps/console/src/App.tsx`
