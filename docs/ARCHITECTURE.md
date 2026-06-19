# Architecture

This repository is becoming an open-source managed agents platform. The detailed
target design lives in
[Open Managed Agents Architecture](design-docs/open-managed-agents-architecture.md).
This file is the short top-level map.

## Product Surfaces

- Management UI for agents, sessions, deployments, credential vaults,
  environments, memory stores, skills, files, and hosts.
- API/SDK for creating sessions, streaming events, managing files and skills,
  registering agents, and administering environments.
- Runtime services for scheduling, sandbox lifecycle, file mounts, credential
  release, source setup, MCP tools, tunnels, deployments, and observability.

## Runtime Topology

The system has three hard layers:

- Control plane: `apiserver`, metadata DB, work queue, session service,
  orchestrator, vault module, filestore module, memory module, skill registry,
  deployment records, and event ingestion.
- Host plane: `sandboxd`, Firecracker, image/snapshot manager, network/egress
  gateway, resource monitor, and local diagnostics.
- Guest plane: `process-api`, `env-runner`, Codex/OpenCode adapters,
  `fs-bridge`, git/provider proxy, MCP servers, tunnel client, and disposable
  workspace.

## Intended Repository Shape

- `apps/`: deployable applications such as `apiserver`, `orchestrator`, and
  `sandboxd`.
- `packages/`: shared contracts, SDKs, agent adapters, storage clients,
  policy helpers, and runtime libraries.
- `infra/`: local development environments, Firecracker host setup, object
  storage, database, queue, and deployment definitions.
- `scripts/`: repository automation that agents can run directly.
- `docs/`: the repository knowledge base and system of record.

## Boundary Rules

- Code agents never talk directly to durable product databases.
- Firecracker and host lifecycle details stay in the host plane.
- `orchestrator` decides what should run and where; `sandboxd` performs the
  local sandbox lifecycle work on a worker host.
- Product behavior belongs in the control plane and `env-runner`, not in
  `process-api`.
- Codex and OpenCode integration must go through an adapter contract.
- Durable provider secrets stay in the vault/control plane. Guests receive only
  session-scoped proxy credentials or short-lived material.
- Session files are persisted through filestore/object storage; VM disks are
  disposable.
- Every long-running session, run attempt, VM, tunnel, and deployment job has a
  lease, heartbeat or timeout, and finalizer.
- UI status values must map to real lifecycle states such as queued, assigned,
  booting, initializing, running, heartbeat-lost, finalizing, failed, timed-out,
  cancelled, succeeded, and archived.
- When the architecture changes, update this file and the relevant design docs
  in the same task.

## First Build Target

The first useful cut has three long-running services:

- `apiserver`: UI, API, CRUD, auth/RBAC, session APIs, filestore, vault,
  events, skills, memory metadata, and deployment records.
- `orchestrator`: work queue claims, leases, state machine, host selection,
  retries, timeout, cancellation, and reconciliation.
- `sandboxd`: worker-host daemon that starts, monitors, and cleans up
  Firecracker sandboxes.

For the MVP, `filestore`, `vault`, `events`, `skills`, `memory`, and
`deployments` are logical modules inside `apiserver`, not separate deployed
services.

This means the service boundary is intentionally small:

- `apiserver` is the product/control-plane service. Do not call it `web-api`;
  the name would understate that it owns the UI, public API, CRUD modules,
  metadata APIs, and control-plane product behavior.
- `orchestrator` is the scheduler and reconciler. It decides which work should
  run, claims leases, assigns hosts, retries, times out, cancels, and repairs
  stuck state.
- `sandboxd` is the worker-host daemon. It is the host-side agent by role, but
  the service name is `sandboxd` because its job is local sandbox lifecycle,
  monitoring, diagnostics, and cleanup.
