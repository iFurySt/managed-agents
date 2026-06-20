## [2026-06-20 13:02] | Task: Document orchestrator and agent runtime plan

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Record the conclusions and plan from the orchestrator, Firecracker, Anthropic
> managed-agent, Pi, Codex, and OpenCode investigation into repository docs so
> future work can proceed from the agreed design.

### Changes Overview

- Area: documentation, architecture, runtime design.
- Key actions:
  - Added a focused orchestrator and agent runtime MVP plan.
  - Clarified that session `idle` is not scheduler pending state.
  - Documented `environment_work` as the queue, lease, and heartbeat object.
  - Captured Pi as the preferred first no-fork tool-routing integration.
  - Captured Codex and OpenCode as guest `/opt` CLI runtime paths.
  - Updated architecture and evidence docs to keep state semantics consistent.

### Design Intent

The design chooses a direct, DB-backed first orchestrator so the platform can
run end-to-end before adding API, Redis, or distributed-worker polish. It keeps
session lifecycle, work leases, and deployment run status separate to avoid
scheduling from idle sessions and to match the managed-agent evidence.

### Files Modified

- `docs/ARCHITECTURE.md`
- `docs/design-docs/index.md`
- `docs/design-docs/open-managed-agents-architecture.md`
- `docs/design-docs/orchestrator-agent-runtime-plan.md`
- `docs/references/anthropic-managed-agents-evidence.md`
- `docs/histories/2026-06/20260620-1302-document-orchestrator-runtime-plan.md`
