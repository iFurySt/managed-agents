## [2026-06-20 02:38] | Task: Refine deployments table frame

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and verified small milestones.

### Changes Overview

- Area: Console Deployments list layout.
- Key actions:
  - Used OBU to compare the source and local Deployments list page geometry.
  - Confirmed the source filter row sits at `y=204`, with the DataTable frame at `x=272,y=252,w=984` and the inner table at `x=280,y=260`.
  - Adjusted the local Deployments filter spacing and DataTable wrapper to match the source frame and table offsets.

### Design Intent

The source Deployments list uses the same padded DataTable frame pattern as other managed-agent list pages. This change scopes the geometry correction to the Deployments list while preserving existing filters, columns, and row actions.

### Files Modified

- `apps/console/src/App.tsx`
