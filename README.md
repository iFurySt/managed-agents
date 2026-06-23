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
