## [2026-06-23 11:12] | Task: Add local compose Dockerfiles

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local macOS with Docker`

### User Query

> Continue the Docker sandbox work by adding Dockerfiles for services and
> environment templates so a local Docker Compose stack can be started and used.

### Changes Overview

- Area: Docker packaging and local development workflow.
- Key actions:
  - Added Dockerfiles for `apiserver`, `orchestrator`, `sandboxd`,
    `process-api`, and `console`.
  - Added Docker runtime template and microVM template Dockerfiles under
    `infra/images/`.
  - Added `infra/docker-compose.local.yml` for a local Postgres, apiserver,
    console, orchestrator, Docker-backed `sandboxd`, and runtime template image.
  - Added `.dockerignore` to keep build contexts small and avoid local artifacts.
  - Documented the compose quick start and explicit template image builds.

### Design Intent

The compose stack is the fast local path: `sandboxd` runs with the Docker
backend and talks to the host Docker daemon through the mounted Docker socket.
The Docker runtime template provides a lightweight workspace image for local
execution. The microVM template records the corresponding guest-style template
with `process-api` installed, while Firecracker remains the production isolation
target.

### Verification

- `docker compose -f infra/docker-compose.local.yml config`
- `docker compose -f infra/docker-compose.local.yml up --build -d`
- `curl http://localhost:8080/healthz`
- `curl http://localhost:8787/healthz`
- `curl http://localhost:5173/`
- `POST http://localhost:8787/runs` returned `compose-sandboxd-ok` from the
  Docker template image.
- Created a session through apiserver and verified the compose orchestrator
  consumed it through Docker-backed `sandboxd`; the session returned to `Idle`.
- Opened `http://localhost:5173/sessions` in Chrome and verified the
  `Compose docker stack smoke` session was visible in the web console.
- `docker build -f apps/process-api/Dockerfile -t managed-agents/process-api:local .`
- `docker compose -f infra/docker-compose.local.yml --profile templates build microvm-template`
- Ran `process-api --help` from both `managed-agents/process-api:local` and
  `managed-agents/microvm-template:local`.

### Files Modified

- `.dockerignore`
- `apps/apiserver/Dockerfile`
- `apps/orchestrator/Dockerfile`
- `apps/sandboxd/Dockerfile`
- `apps/process-api/Dockerfile`
- `apps/console/Dockerfile`
- `infra/docker-compose.local.yml`
- `infra/images/docker-template/Dockerfile`
- `infra/images/microvm-template/Dockerfile`
- `README.md`
- `docs/exec-plans/active/docker-sandbox-runtime.md`
- `docs/histories/2026-06/20260623-1112-add-local-compose-dockerfiles.md`
