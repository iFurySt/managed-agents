# Reliability

Define the operational bar for the repository here.

## Managed Agents Runtime Bar

- Every session has a state machine, run attempts, timeout, cancellation path,
  finalizer, and durable terminal reason.
- Every run attempt has a worker id, host id, sandbox id, image digest, start
  time, end time, heartbeat, and diagnostic bundle reference.
- The orchestrator must tolerate process crashes by reconciling leases and
  heartbeat expiry.
- `sandboxd` must report capacity, active VMs, image cache state, sandbox
  failures, OOMs, and timeout exits.
- Guest runners must acknowledge work before execution, heartbeat during setup
  and agent runtime, and post a final outcome on success, failure, or timeout.
- Tunnel connections and deploy jobs need cancellation, reconnect/backoff, and
  terminal status.

## Observability

- Session events are product data, not debug-only logs.
- Required event families: session lifecycle, source setup, environment init,
  mount setup, MCP registration, agent start/end, tool permission denials,
  file/artifact writes, tunnel actions, deploy status, heartbeat, and final
  outcome.
- Services should emit structured logs with request id, session id, run attempt
  id, host id, and actor when available.
- Metrics should cover queue depth, lease age, heartbeat lag, VM boot duration,
  source setup duration, agent runtime duration, failure class counts, and
  storage/tunnel error rates.
- Traces can come later, but `apiserver`, `orchestrator`, `sandboxd`, and
  runner contracts should pass correlation ids from the start.

## Local Validation

The first real validation path should create a session, boot or simulate a
sandbox, run one agent adapter, persist output files, stream events, and verify
the session reaches a terminal state with diagnostics.
