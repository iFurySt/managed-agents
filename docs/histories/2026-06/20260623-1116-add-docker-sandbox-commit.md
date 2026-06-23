## [2026-06-23 11:16] | Task: Add Docker sandbox commit helper

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local macOS with Docker`

### User Query

> Continue the Docker sandbox work with temporary Docker storage semantics and
> local `docker commit` assistance for debugging snapshots.

### Changes Overview

- Area: Docker-backed `sandboxd` lifecycle.
- Key actions:
  - Added `POST /sandboxes/{id}/commit` for Docker-backed sandboxes.
  - Added a best-effort workspace snapshot step that copies `/workspace` into
    `/opt/managed-agents/workspace-snapshot/` before running `docker commit`.
  - Added test coverage for the Docker commit helper with the fake Docker CLI.
  - Documented the local commit behavior in the README and active execution
    plan.

### Design Intent

Docker-backed sandboxes use a temporary bind-mounted workspace for fast local
development. Since Docker commits do not include bind mount contents, the commit
endpoint explicitly snapshots the workspace inside the container first. The
result is intended for local debugging and handoff, not as production-grade
durable storage.

### Verification

- `gofmt -w apps/sandboxd/main.go apps/sandboxd/main_test.go`
- `go test ./apps/sandboxd`
- Rebuilt compose `sandboxd` with `docker compose -f infra/docker-compose.local.yml up --build -d sandboxd`.
- Started a Docker-backed sandbox through `sandboxd`, wrote a file under
  `/workspace`, committed it as a local image, and verified a new container from
  the image could read the file from
  `/opt/managed-agents/workspace-snapshot/`.
- Stopped and deleted the verification sandbox and removed the temporary image.

### Files Modified

- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `README.md`
- `docs/exec-plans/active/docker-sandbox-runtime.md`
- `docs/histories/2026-06/20260623-1116-add-docker-sandbox-commit.md`
