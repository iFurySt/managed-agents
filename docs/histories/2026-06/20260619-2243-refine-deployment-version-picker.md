## [2026-06-19 22:43] | Task: Refine deployment version picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Replaced the static deployment `Version` button with a CDS-style combobox.
  - Matched the observed Claude Platform version picker geometry: 152px trigger, 192px menu, 184px selected option, 32px option height, 12px popup radius, and selected 5% black fill.
  - Reused the same picker for deployments created from the deployments page and from an agent detail page.

### Design Intent

The source `Version` control behaves like a one-option combobox, not a plain button. This change keeps deployment creation backed by the existing `apiserver` contract while making the high-frequency dialog interaction closer to the captured Claude Console behavior.

### Files Modified

- `apps/console/src/App.tsx`
