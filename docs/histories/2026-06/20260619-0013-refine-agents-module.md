## [2026-06-19 00:13] | Task: Refine managed agents module

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: CLI

### User Query

> Continue cloning the Claude Platform Managed Agents console one module at a time, using OBU evidence and committing verified milestones.

### Changes Overview

- Area: `apiserver`, console UI, API client, type contracts.
- Key actions: refined the Agents list, create dialog, detail page, action menus, and edit flow against fresh OBU DOM and screenshot evidence.
- Follow-up: rechecked the Claude Agents table with OBU and tightened the shared CDS table density so headers render at about 32px, body rows at 45px, and icon action buttons at 28px with transparent styling.
- Follow-up: after enabling fixed table layout for the shared CDS table, retuned Agents column widths to keep the table near the captured Claude width and prevent horizontal overflow.

### Design Intent

Agents are the primary entry point for sessions and deployments, so this pass moves beyond the basic list/detail scaffold into the Claude-like operational surface: copyable IDs, status filtering, row actions, version selection, config editing, save-new-version behavior, and archive handling. The backend keeps these controls in `apiserver`, consistent with the MVP decision that CRUD and registry behavior live in the control plane.

The follow-up keeps the table density and fixed-layout changes in the shared CDS layer because Agents, Sessions, Deployments, Environments, Vaults, Files, and other management lists share the same Claude table token.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/types.ts`
