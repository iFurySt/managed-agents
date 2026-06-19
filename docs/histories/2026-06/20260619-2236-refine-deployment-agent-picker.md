## [2026-06-19 22:36] | Task: Refine deployment agent picker

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU-backed fidelity, landing verified milestones and pushing them.

### Changes Overview

- Area: Console create-deployment dialog from the deployments page.
- Key actions:
  - Captured Claude Platform Create deployment agent picker behavior with OBU.
  - Replaced the generic non-scoped agent select with a CDS-style rich combobox.
  - Matched the observed source geometry: 300px agent field, 292px trigger, 160px version field, 472px menu, and 48px agent options.
  - Defaulted the deployments-page dialog to the first observed agent while preserving the existing `agentId` payload contract.

### Design Intent

The source deployments-page create dialog starts with an agent selected and keeps Agent and Version in the same two-column row. This change aligns the local dialog with that interaction without adding a version field to the deployment API.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260619-2236-refine-deployment-agent-picker.md`
