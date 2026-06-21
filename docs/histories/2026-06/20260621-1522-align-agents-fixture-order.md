## [2026-06-21 15:22] | Task: Align agents fixture order

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console managed-agents clone and keep converging the replicated surfaces.

### Changes Overview

- Area: Apiserver agents fixture data.
- Key actions:
  - Added the missing source-console `agent_011VCSqwTBQSr7SqT2Mwmus2` fixture.
  - Changed agent fixture seeding to upsert known source agents by id so existing local databases can pick up the current source snapshot.
  - Added source-order sorting for known fixture agents while keeping locally-created agents sorted by creation time ahead of the fixture group.

### Design Intent

The agents page should render the same baseline rows as the source Claude Console after a fresh boot or seed refresh, while preserving CRUD behavior for newly-created local agents.

### Files Modified

- `apps/apiserver/main.go`
