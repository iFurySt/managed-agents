## [2026-06-19 22:39] | Task: Clarify service boundaries

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Clarify the main services, keep modules 4-7 folded into the API server for simplicity, use `apiserver` instead of `web-api`, explain that the host-side service is `sandboxd`, then commit and push the docs.

### Changes Overview

- Area: architecture documentation and runtime naming.
- Key actions:
  - Documented the first build target as three services: `apiserver`, `orchestrator`, and `sandboxd`.
  - Made `apiserver` the canonical product/control-plane service name, explicitly avoiding `web-api`.
  - Clarified that `sandboxd` is the host-side daemon name; `host-agent` is only a role description.
  - Replaced remaining `host-agent` artifact and reliability references with `sandboxd`.

### Design Intent

Keep the MVP service topology small and legible. CRUD, filestore, vault, events, skills, memory, and deployment records stay as logical modules inside `apiserver`; `orchestrator` owns scheduling and reconciliation; `sandboxd` owns high-privilege worker-host sandbox lifecycle.

### Files Modified

- `docs/ARCHITECTURE.md`
- `docs/design-docs/open-managed-agents-architecture.md`
- `docs/RELIABILITY.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `docs/histories/2026-06/20260619-2239-clarify-service-boundaries.md`
