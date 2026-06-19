## [2026-06-19 22:24] | Task: Refine deployment vault picker

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU-backed fidelity, landing verified milestones and pushing them.

### Changes Overview

- Area: Console create-deployment dialog.
- Key actions:
  - Captured Claude Platform and local Create deployment vault picker behavior with OBU.
  - Replaced the deployment dialog's generic vault select with a local CDS-style rich combobox.
  - Matched the observed source field rhythm: 32px trigger, 472px menu width, 12px menu radius, 46px vault options, and metadata rows.
  - Preserved the existing deployment payload shape while clearing vault, memory store, and trigger state after a successful create.

### Design Intent

The source surface uses a richer combobox for credential vaults rather than a plain text select: options include vault names, recent activity, and credential status. This keeps vaults inside the existing `apiserver` deployment CRUD flow while making the high-frequency create-deployment path closer to the observed Claude Console UI.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260619-2224-refine-deployment-vault-picker.md`
