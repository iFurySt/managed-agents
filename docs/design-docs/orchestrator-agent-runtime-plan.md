# Orchestrator And Agent Runtime Plan

Status: accepted MVP direction, June 2026.

This document records the first implementation plan for `orchestrator` and the
agent runtime path. It assumes `apiserver` owns product data and that the first
orchestrator cut should consume durable control-plane state directly, then move
behind API or Redis-style delivery only when the behavior is proven.

## Scope

The near-term goal is a runnable end-to-end loop:

1. `apiserver` creates sessions, events, deployments, and queueable work.
2. `orchestrator` claims work, manages leases, and starts or reuses a sandbox.
3. a runner executes one agent turn in the selected environment.
4. product state is finalized so the UI can inspect the result.

The first version may read and update the metadata database directly. The code
should still be shaped around methods such as `poll`, `ack`, `heartbeat`,
`stop`, and `stats` so the same contract can later move behind an API or Redis
notification path.

## Core Decisions

### Session State Is Not The Queue

`sessions.status = idle` means the session is waiting for the next user or
deployment action. It does not mean the session is waiting to be scheduled.

A session can be `idle` after a turn succeeds, after a deployment run succeeds,
or after an agent returns `end_turn`. The scheduler must not scan idle sessions
as pending work. Scheduling is driven by a separate work object.

Durable state is split into three concepts:

| Object | States | Meaning |
| --- | --- | --- |
| `sessions` | `idle`, `running`, `rescheduling`, `terminated` | Conversation or delegated-task lifecycle visible to users. |
| `environment_work` | `queued`, `starting`, `active`, `stopping`, `stopped` | Queue, lease, heartbeat, and stop lifecycle consumed by workers. |
| `deployment_runs` | `pending`, `running`, `success`, `failed`, `cancelled`, `timed_out` | Product-level deployment execution status. |

UI states such as booting, initializing, heartbeat-lost, finalizing, and retrying
should be derived from `environment_work`, run attempts, sandbox state, and
timestamps instead of being overloaded onto `sessions.status`.

### Work Is Lease Oriented

The minimum `environment_work` record should include:

- `id`, `environment_id`, `session_id`, optional `deployment_run_id`;
- `type` such as `session_turn`, `deployment_run`, or `maintenance`;
- `state`, `priority`, `attempt`, `max_attempts`, and `idempotency_key`;
- `payload` or `payload_ref`;
- `worker_id`, `lease_id`, `heartbeat_at`, `heartbeat_ttl_seconds`;
- `expected_last_heartbeat` or an equivalent compare-and-swap token;
- `stop_requested_at`, `started_at`, `stopped_at`, `error`;
- `created_at`, `updated_at`.

The orchestrator should claim work with optimistic concurrency or row locks,
heartbeat active work, and let a reconciler recover work whose heartbeat has
expired. A literal "no previous heartbeat" claim marker is useful for first
claims because it makes duplicate claims explicit.

### Events Are Canonical Product Data

`session_events` should carry a canonical `type` plus structured payload. The
first useful event types are:

- `user.message`;
- `agent.message`;
- `agent.tool_use`;
- `user.tool_result`;
- `session.status_running`;
- `session.status_idle`;
- `session.error`.

Existing role/kind columns can remain as compatibility fields, but consumers
should converge on canonical event types so Codex, OpenCode, Pi, and future
adapters produce one timeline shape.

### Deployment Runs Link To Sessions

A deployment run can finish as `success` while the session created for that run
is `idle`. Store both facts explicitly. `deployment_runs` should include
`session_id` when a run created or reused a session, and `error` when no session
could be produced or the run failed before agent execution.

## MVP Flow

1. `apiserver` persists a user message or deployment trigger.
2. `apiserver` creates an `environment_work` row and optionally emits a
   notification.
3. `orchestrator` polls or receives the work, claims it, and sets work to
   `starting`.
4. `orchestrator` marks the session `running` and records
   `session.status_running`.
5. `orchestrator` asks `sandboxd` to start or reuse a Firecracker sandbox for
   the target environment.
6. the runner starts the selected agent runtime and heartbeats the work lease.
7. tool execution is routed through `sandboxd` and `process-api`, or the whole
   CLI runs inside the guest when tool replacement is not practical.
8. on agent turn completion, the runner records events, files, logs, and usage.
9. `orchestrator` marks work `stopped`, sets the session `idle`, records
   `session.status_idle`, and updates the deployment run if one exists.
10. a reconciler periodically stops expired work, retries eligible attempts, and
    cleans up orphaned sandboxes.

The first binary can combine poller, runner, and reconciler code, but the
interfaces should remain separate:

- poller: work claim, acknowledgement, stop requests, and queue statistics;
- runner: sandbox startup, agent process execution, event streaming, heartbeat;
- reconciler: expired heartbeat handling, retries, finalizers, sandbox cleanup.

## Agent Runtime Strategy

Pi is the preferred first integration because it can replace built-in tools via
extensions without forking the agent. Codex and OpenCode remain viable by running
the whole CLI inside the sandbox image under `/opt`.

| Runtime | First path | Why | Expected command shape |
| --- | --- | --- | --- |
| Pi | Host process plus managed extension. | Extensions can register custom tools and disable built-ins, so read/write/edit/bash/list/search can be routed into `sandboxd` and `process-api`. Auth can remain on the host. | `pi --no-builtin-tools -e /opt/managed-agents/pi-sandbox-extension --mode json --no-session -p "$PROMPT"` |
| Codex | Guest CLI under `/opt/codex`. | `codex exec --json` is stable for noninteractive runs, but no-fork built-in tool replacement is not clean enough for the first cut. Let the guest boundary be the sandbox. | `/opt/codex/bin/codex exec --json --ephemeral --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -C /workspace "$PROMPT"` |
| OpenCode | Guest CLI under `/opt/opencode`. | `opencode run --format json` and plugins are useful, but custom tool overriding is less direct than Pi. Use the sandbox image boundary first. | `/opt/opencode/bin/opencode run --format json --dir /workspace "$PROMPT"` |

For Pi, the extension should map the agent's file and shell tools to platform
operations:

- read/list/search -> `process-api` file read or controlled guest command;
- write/edit -> controlled guest file mutation plus event capture;
- bash -> `process-api` process create/attach/signal with timeout;
- tool results -> canonical `agent.tool_use` and `user.tool_result` events.

For Codex and OpenCode, the runner should stream each CLI's JSON output and
translate it into the same canonical event timeline.

## Guest Image Layout

The sandbox image should make agent runtimes explicit instead of relying on
whatever happens to be in `PATH`:

```text
/opt/pi
/opt/codex
/opt/opencode
/opt/managed-agents/guest-runner
/workspace
/mnt/session/uploads
/mnt/session/outputs
/mnt/skills
/mnt/memory
```

This mirrors the managed-agent pattern of shipping tool roots under `/opt`,
keeps the user workspace stable at `/workspace`, and lets the runner select a
runtime by environment or agent profile.

## Data Model Sketch

The first database expansion should be small and explicit:

- `sessions`: add or normalize `status`, `agent_id`, `environment_id`,
  `current_work_id`, `terminated_at`, `last_active_at`.
- `session_events`: add canonical `type`, monotonic `seq`, structured `payload`,
  optional `work_id`, optional `deployment_run_id`, and correlation ids.
- `environment_work`: add the queue and lease fields listed above.
- `deployment_runs`: keep product status, add `session_id`, `work_id`, `error`,
  `started_at`, `completed_at`.
- `run_attempts`: optional in the first migration, but useful once retries and
  sandbox diagnostics are real.

## Implementation Sequence

1. Add `environment_work` and canonical event typing in `apiserver`.
2. Create `apps/orchestrator` with DB-backed poll, claim, heartbeat, stop, and
   reconcile loops.
3. Add a `sandboxd` client and a minimal process runner for `process-api`.
4. Build the Pi sandbox extension and run one turn with host-side tool routing.
5. Add guest CLI runners for Codex and OpenCode using `/opt/codex` and
   `/opt/opencode`.
6. Add integration tests for claim races, heartbeat expiry, session idle
   semantics, deployment-run success, and sandbox cleanup.
