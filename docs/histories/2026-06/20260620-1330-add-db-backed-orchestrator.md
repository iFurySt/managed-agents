## [2026-06-20 13:30] | Task: Add DB-backed orchestrator

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Begin implementing the agreed orchestrator plan. Build toward an actual
> runnable path, use Codex-style local authentication for the agent runtime,
> verify in stages, commit and push our own changes only, and leave unrelated
> console work alone.

### Changes Overview

- Area: `apiserver`, `orchestrator`, runtime state, documentation.
- Key actions:
  - Added `EnvironmentWork` as the durable work queue and lease record.
  - Added canonical session event fields for type, payload, and work linkage.
  - Changed session messages to enqueue `session_turn` work without marking the
    session as queued.
  - Changed deployment runs to start as `Pending` with linked work instead of
    being marked `Success` immediately.
  - Added `apps/orchestrator` with DB-backed claim, active, finalize, session
    event, and deployment-run update flow.
  - Added `codex-local` and deterministic `shell` runtimes for the first
    runnable stage.
  - Documented the local orchestrator commands in the README.

### Design Intent

This slice makes the planned session/work split executable before adding
Firecracker runtime execution. `apiserver` now produces real work rows and
`orchestrator` owns the transition from queued work to running agent turn to
idle session. The shell runtime gives a deterministic local verifier, while
`codex-local` proves the OpenAI Codex CLI authentication path.

### Verification

- `go test ./...`
- Started local `apiserver` against Postgres on a temporary port.
- Created a session through the HTTP API.
- Posted a session message and verified `environment_work.state = queued` while
  the session remained `Idle`.
- Ran `orchestrator --runtime shell run-once` and verified work became
  `stopped`, the session returned to `Idle`, and the timeline contained
  `session.status_running`, `agent.message`, and `session.status_idle`.
- Ran `orchestrator --runtime codex-local run-once` against local Codex CLI auth
  and verified the agent message `codex-runtime-ok` was persisted.
- Triggered a deployment run through the HTTP API and verified it started as
  `Pending`, then became `Success` after orchestrator execution.

### Files Modified

- `apps/apiserver/main.go`
- `apps/orchestrator/main.go`
- `README.md`
- `docs/QUALITY_SCORE.md`
- `docs/histories/2026-06/20260620-1330-add-db-backed-orchestrator.md`
