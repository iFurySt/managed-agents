# managed-agents

中文版本：[`managed-agents-cn`](https://github.com/iFurySt/managed-agents-cn)

`managed-agents` is an open-source control plane for running AI agents in
secure, observable sandboxes.

It brings together a console, API server, orchestrator, and worker-host runtime
for sessions, deployments, environments, credentials, memory, skills, files, and
Firecracker-backed hosts.

## Quick Start

Run the managed agents console locally:

```sh
docker compose -f infra/docker-compose.postgres.yml up -d postgres
go run ./apps/apiserver
npm install
npm run dev:console
```

Then open `http://localhost:5173`.

Run one queued session or deployment work item:

```sh
go run ./apps/orchestrator run-once
```

Check the worker-host runtime:

```sh
go run ./apps/sandboxd doctor
```

For architecture and Firecracker setup details, see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/references/gcp-firecracker-kvm.md`](docs/references/gcp-firecracker-kvm.md).

## Project Shape

- `apps/apiserver`: console, API, metadata, vault, filestore, events, skills,
  memory, and deployments.
- `apps/orchestrator`: queue claims, leases, retries, timeouts, cancellation,
  and runtime selection.
- `apps/sandboxd`: worker-host daemon for Firecracker lifecycle and guest
  process execution.
- `apps/console`: React console for the managed agents surface.

## License

[Apache-2.0](LICENSE)
