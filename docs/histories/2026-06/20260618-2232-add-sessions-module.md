## [2026-06-18 22:32] | Task: Add managed agents sessions module

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents pages one module at a time, using OBU evidence and committing verified milestones.

### Changes Overview

- Area: Managed Agents console, apiserver, local Postgres data model.
- Key actions:
  - Added first-class session and session event models to `apiserver`.
  - Added session list, detail, create, and cancel API routes.
  - Replaced the generic Sessions resource page with a dedicated Claude Console-style Sessions UI.
  - Added the Sessions create dialog and transcript/debug detail view.
  - Verified the implementation with Go tests, console build, API smoke checks, and OBU-rendered local screenshots.

### Design Intent

Sessions are now modeled as product objects instead of generic resources so the UI can match the reference page and future runtime work can attach lifecycle state, transcript events, debugging metadata, and cancellation behavior without changing the public shape again.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/types.ts`
- `docs/histories/2026-06/20260618-2232-add-sessions-module.md`
