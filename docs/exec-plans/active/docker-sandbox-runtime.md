# Docker Sandbox Runtime

## Goal

Add a Docker-backed local sandbox runtime alongside the existing Firecracker
path so developers can run the managed agents stack on a single machine with
`docker compose`, exercise the console-to-orchestrator-to-sandbox flow quickly,
and still keep Firecracker as the production isolation target.

## Scope

- In scope:
  - `sandboxd` backend selection for Firecracker and Docker.
  - Docker-backed one-shot `/runs` execution and basic sandbox lifecycle.
  - Local development Dockerfiles and compose wiring for console, apiserver,
    orchestrator, sandboxd, Postgres, and runtime templates.
  - Documentation, history entries, and repeatable validation commands.
- Out of scope:
  - Treating Docker isolation as production-equivalent to Firecracker.
  - Full Firecracker snapshot parity for Docker.
  - Durable remote object storage; Docker workspaces may use temporary local
    storage in this phase.

## Context

- Relevant docs:
  - `docs/ARCHITECTURE.md`
  - `docs/SECURITY.md`
  - `docs/RELIABILITY.md`
  - `docs/SUPPLY_CHAIN_SECURITY.md`
- Relevant code paths:
  - `apps/sandboxd/main.go`
  - `apps/orchestrator/main.go`
  - `apps/process-api/main.go`
  - `infra/`
- Constraints:
  - Firecracker stays the production target.
  - Docker support is a local single-machine development path.
  - Every slice must be verified with real commands before committing.

## Risks

- Risk: Docker socket access grants host-level control.
  - Mitigation: document Docker backend as local-only and keep defaults on
    Firecracker until compose explicitly selects Docker.
- Risk: diverging Firecracker and Docker API behavior.
  - Mitigation: keep the same `sandboxd` HTTP surface and add backend-specific
    implementation behind existing handlers.
- Risk: filesystem cleanup leaks temporary containers or directories.
  - Mitigation: write state files, label containers, remove containers and
    sandbox directories in tests and real validation.

## Milestones

1. Add Docker backend selection and one-shot command execution.
2. Add Docker basic lifecycle commands behind existing sandboxd routes.
3. Wire orchestrator validation through Docker-backed sandboxd.
4. Add Dockerfiles and local compose stack.
5. Update documentation and quality notes.

## Validation

- Commands:
  - `go test ./...`
  - `npm run build:console`
  - `go run ./apps/sandboxd --backend docker --work-dir /tmp/managed-agents-docker run ...`
  - `go run ./apps/sandboxd --backend docker serve`
  - `go run ./apps/orchestrator --runtime sandbox-command run-once`
  - `docker compose ... up`
- Manual checks:
  - Console opens and lists API-backed data.
  - Session turn and deployment run reach `Idle` / `Success`.
  - Docker containers and temporary sandbox directories are cleaned up.
- Observability checks:
  - `sandboxd` state exposes backend/image/status.
  - Orchestrator writes session lifecycle and agent message events.

## Progress Log

- [x] Confirmed repository rules and current Firecracker-only host limitation.
- [x] Implement Docker backend one-shot execution and basic lifecycle.
- [x] Verify Docker backend locally with real Docker.
- [x] Commit and push the first verified slice.
- [x] Add service Dockerfiles, Docker runtime template, microVM template, and
  local compose stack.
- [x] Verify compose stack from browser-visible console through orchestrator to
  Docker-backed sandboxd.
- [x] Add and verify a Docker sandbox commit helper that snapshots the temporary
  `/workspace` mount into the container before running `docker commit`.

## Decision Log

- 2026-06-23: Keep Firecracker as the default backend and require explicit
  Docker selection for local development. This preserves the security posture
  while unblocking fast local testing on non-KVM machines.
- 2026-06-23: Reuse the existing `sandboxd` HTTP API for Docker instead of
  adding an orchestrator-specific Docker path. This keeps orchestration stable
  while the host-plane backend changes behind `sandboxd`.
- 2026-06-23: Docker commits are a local debugging aid, not durable storage.
  Because Docker does not include bind-mounted `/workspace` content in a
  committed image, `sandboxd` first copies the workspace into
  `/opt/managed-agents/workspace-snapshot/` inside the container.
