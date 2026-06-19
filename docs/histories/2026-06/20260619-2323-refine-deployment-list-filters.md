## [2026-06-19 23:23] | Task: Refine deployment list filters

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployments list.
- Key actions:
  - Captured source deployment list filter menus with OBU, including Agent and Status trigger geometry, popup dimensions, and option sets.
  - Replaced the local raw-ID Agent filter with a CDS-style filter combobox that displays agent names and updated labels.
  - Matched source Status filter options to `All`, `Active`, and `Paused`, with source-aligned trigger and popup geometry.
  - Shared the deployment agent option list with the Create deployment agent picker.

### Design Intent

The deployments list should use the same source-style filter controls as the Claude Platform page rather than exposing implementation IDs in the UI. This pass keeps the API filter values as stable IDs while making the visible controls match the source console.

### Files Modified

- `apps/console/src/App.tsx`
