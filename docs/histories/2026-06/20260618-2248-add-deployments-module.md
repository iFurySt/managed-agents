## [2026-06-18 22:48] | Task: Add managed agents deployments module

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents pages one module at a time, using OBU evidence and committing verified milestones.

### Changes Overview

- Area: Managed Agents console, apiserver, local Postgres data model.
- Key actions:
  - Added first-class deployment and deployment run models to `apiserver`.
  - Added deployment list, detail, create, and run-now API routes.
  - Replaced the generic Deployments resource page with a dedicated Claude Console-style module.
  - Added deployment creation fields, configuration detail tab, and run history tab.
  - Verified with Go tests, console build, API smoke checks, and OBU-rendered local screenshots.

### Design Intent

Deployments need their own lifecycle, trigger, schedule, run, and session-linking fields. Modeling them separately from generic resources keeps the UI close to the reference console and gives later orchestrator work a stable contract for scheduled and manual runs.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/types.ts`
- `docs/histories/2026-06/20260618-2248-add-deployments-module.md`
