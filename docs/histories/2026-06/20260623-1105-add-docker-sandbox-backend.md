## [2026-06-23 11:05] | Task: Add Docker sandbox backend

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local macOS with Docker`

### User Query

> Add a Docker-backed sandbox path alongside Firecracker for faster local
> single-machine testing, keep validating with real execution, and commit small
> verified increments before continuing toward Dockerfiles and compose.

### Changes Overview

- Area: `sandboxd`, runtime documentation, execution planning.
- Key actions:
  - Added `sandboxd --backend docker` with Docker-backed one-shot `/runs`.
  - Added Docker-backed sandbox lifecycle start, exec, stop, and remove behind
    the existing `sandboxd` HTTP API.
  - Preserved Firecracker as the default backend.
  - Added fake-Docker unit coverage for backend selection, one-shot execution,
    lifecycle exec, and cleanup.
  - Added an active execution plan for the broader Docker runtime rollout.
  - Updated README, architecture, and quality notes for the Docker local backend.

### Design Intent

The Docker backend is a local development convenience, not a replacement for
Firecracker isolation. Keeping Docker behind `sandboxd` preserves the
orchestrator contract and lets `sandbox-command` and `sandbox-shell` exercise
the same control-plane path with either backend. Temporary Docker workspaces live
under the sandbox work directory and are removed for one-shot runs.

### Verification

- `go test ./apps/sandboxd`
- `go test ./...`
- Started `sandboxd --backend docker --work-dir /tmp/managed-agents-docker-verify --image alpine:3.20 serve`.
- Verified real Docker `/runs` with `alpine:3.20`, stdout capture, exit code,
  backend state, and no leftover labeled containers.
- Verified real Docker lifecycle through `POST /sandboxes`, `POST /exec`,
  `POST /stop`, and `DELETE /sandboxes/{id}`.
- Verified a real apiserver-created session work item with
  `ORCHESTRATOR_RUNTIME=sandbox-command`, Docker-backed sandboxd, and
  `ORCHESTRATOR_SANDBOX_IMAGE=alpine:3.20`; the session reached `Idle` with an
  agent message and the work item reached `stopped`.

### Files Modified

- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/QUALITY_SCORE.md`
- `docs/exec-plans/active/docker-sandbox-runtime.md`
- `docs/histories/2026-06/20260623-1105-add-docker-sandbox-backend.md`
