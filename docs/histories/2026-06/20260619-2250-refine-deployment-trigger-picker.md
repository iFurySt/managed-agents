## [2026-06-19 22:50] | Task: Refine deployment trigger picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source `Trigger` combobox geometry and option list in the create-deployment dialog.
  - Changed the local trigger control from a generic button/dropdown to a CDS-style combobox.
  - Matched the observed trigger dimensions: 464px trigger, 472px popup, 464px listbox, and 44px `Manual` / `Schedule` options.

### Design Intent

The trigger picker is the last required create-deployment field, so it should behave and render like the other source comboboxes rather than like an isolated button menu. This keeps the form interaction consistent with Claude Platform while preserving the existing `Manual` and `Schedule` API payload values.

### Files Modified

- `apps/console/src/App.tsx`
