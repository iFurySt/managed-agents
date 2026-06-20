## [2026-06-20 13:34] | Task: Add sandboxd exec runner

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the orchestrator implementation toward actual runtime execution by
> connecting it to sandboxd/process-api, while keeping commits small and
> verified.

### Changes Overview

- Area: `sandboxd`, `orchestrator`, runtime documentation.
- Key actions:
  - Added sandboxd HTTP routes for guest `/exec`, process start, process status,
    and process signal.
  - Reused the existing process-api client code behind those HTTP routes.
  - Added orchestrator `sandbox-shell` runtime that starts a sandbox through
    `sandboxd serve`, executes a command through process-api, and cleans up the
    sandbox.
  - Added unit tests for sandboxd process-api proxy routes.
  - Added an orchestrator unit test for the sandbox lifecycle runner.
  - Documented the KVM-host `sandbox-shell` command in the README.

### Design Intent

This step moves from host-local Codex execution toward the real Firecracker
boundary without changing the proven sandbox boot path. `sandboxd` remains the
host daemon that owns privileged lifecycle operations, while `orchestrator`
uses a small HTTP contract to start, execute inside, stop, and remove a sandbox.

### Verification

- `go test ./...`
- `TestSandboxdHTTPHandlerProcessAPIProxy` verifies the sandboxd HTTP exec and
  process proxy routes against a fake process-api.
- `TestRunSandboxShellCallsSandboxdLifecycle` verifies orchestrator start,
  guest exec, stop, and delete calls against a fake sandboxd.

### Files Modified

- `apps/orchestrator/main.go`
- `apps/orchestrator/main_test.go`
- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `README.md`
- `docs/histories/2026-06/20260620-1334-add-sandboxd-exec-runner.md`
