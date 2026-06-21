## [2026-06-22 07:19] | Task: Align session resource fields

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue OBU-driven Claude Console convergence across managed-agents interactions, keeping changes source-proven and scoped.

### Changes Overview

- Area: Console create-session resource configuration.
- Key actions: Aligned the GitHub Repository and Memory Store resource branches with the live Claude Console field structure, and kept the create-session dialog scrolled to the top after resource selection.

### Design Intent

The source create-session flow expands each resource type into a different form. This pass replaces the earlier placeholder GitHub and memory fields with the observed source labels, controls, and placeholders while preserving the existing local submission shape.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0719-align-session-resource-fields.md`
