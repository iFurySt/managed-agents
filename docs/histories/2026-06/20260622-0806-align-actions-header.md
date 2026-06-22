## [2026-06-22 08:06] | Task: Align actions table header

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone through source/local Open Browser Use comparison, avoiding broad new scope.

### Changes Overview

- Area: Console table component.
- Key actions:
  - Aligned the shared DataTable actions header to the right.
  - Verified against the source deployments table, where the `Actions` header is right-aligned.
  - Confirmed the local deployments table now computes `text-align: right` for that header.

### Design Intent

This is a narrow source-proven parity fix. It updates the shared actions header behavior so visible action-column headings match Claude Console without changing row actions or table data behavior.

### Files Modified

- `apps/console/src/components/cds.tsx`
