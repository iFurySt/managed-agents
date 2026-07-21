# managed-agents

中文版本：[`managed-agents-cn`](https://github.com/iFurySt/managed-agents-cn)

`managed-agents` is an open-source control plane for running AI agents in
secure, observable sandboxes.

It brings together a console, API server, orchestrator, and worker-host runtime
for sessions, deployments, environments, credentials, memory, skills, files,
Firecracker-backed hosts, and a Docker-backed local development sandbox.

## Quick Start

Run the full local Docker stack:

```sh
docker compose -f infra/docker-compose.local.yml up --build
```

Then open `http://localhost:5173`. The local stack starts Postgres, apiserver,
console, orchestrator, and Docker-backed `sandboxd`. Postgres is exposed on
`localhost:55432` to avoid colliding with a host Postgres on `5432`.

Run the managed agents console locally:

```sh
docker compose -f infra/docker-compose.postgres.yml up -d postgres
go run ./apps/apiserver
npm install
npm run dev:console
```

Then open `http://localhost:5173`.

Build the runtime template images explicitly:

```sh
docker build -f apps/process-api/Dockerfile -t managed-agents/process-api:local .
docker compose -f infra/docker-compose.local.yml --profile templates build microvm-template
```

Run one queued session or deployment work item:

```sh
go run ./apps/orchestrator run-once
```

Check the worker-host runtime:

```sh
go run ./apps/sandboxd doctor
```

Run the worker-host runtime with the local Docker sandbox backend:

```sh
go run ./apps/sandboxd --backend docker --work-dir /tmp/managed-agents-docker --image alpine:3.20 serve
```

Docker-backed sandboxes use a temporary `/workspace` bind mount. For local
debugging, `POST /sandboxes/{id}/commit` first copies `/workspace` into
`/opt/managed-agents/workspace-snapshot/` inside the container and then runs
`docker commit`, so the committed image carries a best-effort workspace snapshot.

Then point the orchestrator at it for fast local execution:

```sh
ORCHESTRATOR_RUNTIME=sandbox-command \
SANDBOXD_URL=http://127.0.0.1:8787 \
ORCHESTRATOR_SANDBOX_IMAGE=alpine:3.20 \
go run ./apps/orchestrator run-once
```

Run the same local path with Codex inside the Docker sandbox:

```sh
CODEX_HOME=$HOME/.codex \
ORCHESTRATOR_RUNTIME=sandbox-codex \
ORCHESTRATOR_RUNTIME_TIMEOUT=15m \
docker compose -f infra/docker-compose.local.yml up --build
```

`sandbox-codex` reads `auth.json` from `CODEX_HOME`, mounts it read-only into
the orchestrator container, injects it into the one-shot sandbox, downloads the
Linux Codex CLI release, runs `codex exec --json`, and writes the final Codex
message back to the session transcript. The download URL is adjusted for
`x86_64` or `aarch64` guests so the same compose path works on Intel and Apple
Silicon Docker hosts.

For a host-run development loop, keep Postgres and `sandboxd` in Docker and run
the API, console, and one orchestrator claim locally:

```sh
docker compose -f infra/docker-compose.local.yml up -d postgres docker-template sandboxd

APISERVER_ADDR=:18080 \
DATABASE_URL=postgres://managed_agents:managed_agents@127.0.0.1:55432/managed_agents?sslmode=disable \
go run ./apps/apiserver

VITE_API_BASE=http://127.0.0.1:18080 npm run dev:console -- --host 127.0.0.1 --port 5174

DATABASE_URL=postgres://managed_agents:managed_agents@127.0.0.1:55432/managed_agents?sslmode=disable \
go run ./apps/orchestrator \
  --runtime sandbox-codex \
  --codex-home "$HOME/.codex" \
  --sandboxd-url http://127.0.0.1:8787 \
  --sandbox-image managed-agents/docker-template:local \
  --runtime-timeout 15m \
  run-once
```

For architecture and Firecracker setup details, see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/references/gcp-firecracker-kvm.md`](docs/references/gcp-firecracker-kvm.md).

## Project Shape

- `apps/apiserver`: console, API, metadata, vault, filestore, events, skills,
  memory, and deployments.
- `apps/orchestrator`: queue claims, leases, retries, timeouts, cancellation,
  and runtime selection.
- `apps/sandboxd`: worker-host daemon for Firecracker lifecycle, Docker-backed
  local sandboxes, and guest process execution.
- `apps/console`: React console for the managed agents surface.

## License

[Apache-2.0](LICENSE)
