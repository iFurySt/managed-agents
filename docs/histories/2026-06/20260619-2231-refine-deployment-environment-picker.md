## [2026-06-19 22:31] | Task: Refine deployment environment picker

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU-backed fidelity, landing verified milestones and pushing them.

### Changes Overview

- Area: Console create-deployment dialog.
- Key actions:
  - Captured Claude Platform Create deployment environment picker behavior with OBU.
  - Replaced the scoped deployment environment button and generic fallback select with a CDS-style combobox.
  - Matched the observed source shape: 472px menu width, 12px menu radius, 48px environment options, and metadata lines like `3 days ago · Cloud`.
  - Preserved the existing deployment `environmentId` payload contract.

### Design Intent

The source environment picker remains editable even when a deployment is created from an agent detail page. This change keeps the local dialog aligned with that behavior while leaving environment CRUD and deployment records inside the existing `apiserver` boundary.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260619-2231-refine-deployment-environment-picker.md`
