## [2026-06-19 00:01] | Task: Add managed agents skills module

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: CLI

### User Query

> Commit and push all current changes after landing the managed agents work.

### Changes Overview

- Area: `apiserver`, console UI, API client, type contracts.
- Key actions: added a dedicated skills API, seeded Anthropic-style skill packages and versions, replaced the generic skills collection screen with a dedicated Skills page, create dialog, version history dialog, and local skill deletion.

### Design Intent

Skills are now a first-class managed-agents surface instead of a generic resource collection. The implementation keeps the MVP simple by owning the skill registry inside `apiserver`, matching the current architecture rule that skills stay a logical control-plane module rather than a separate deployed service.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/types.ts`
