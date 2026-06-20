# Anthropic Managed Agents Evidence Summary

Status: curated summary from the June 2026 Anthropic Managed Agents
investigation corpus.

This note preserves the architecture-relevant conclusions used by this
repository's open managed agents plan. It summarizes the reference corpus rather
than copying private binaries, credentials, or raw forensic artifacts.

## Product Runner

The recovered `environment-manager` shape indicates a product-layer runner above
the low-level sandbox substrate. Its responsibilities include:

- parsing work payloads and session/auth context;
- acknowledging work and posting session events;
- source setup through git clone/fetch, sparse checkout, snapshots, seed
  bundles, branch setup, and post-clone hooks;
- environment initialization for hosted and BYOC-like modes;
- Codex-equivalent agent launch through a dedicated execution path;
- MCP server registration and config merge;
- tunnel registration for previews and named actions;
- heartbeat, lease, diagnostics, and observability.

Design implication: our `env-runner` should own product lifecycle behavior, and
`process-api` should stay a small generic guest process controller.

## Process API

The June 2026 `process_api` binary evidence shows a guest-side PID 1 for
Firecracker-style environments. Confirmed surfaces include:

- `--firecracker-init`;
- process create, attach, stdout/stderr/stdin streaming, signal, exit, timeout,
  CPU timeout, OOM, and container OOM messages;
- V2 attach/create messages, trace events, and zstd capability negotiation;
- control routes such as status, auth public key, write etc files, mount root,
  filesystem freeze/thaw, and shutdown.

Design implication: define a stable process-control protocol early, but keep it
independent of Codex/OpenCode and product-specific concepts.

## Filestore And Mounts

The recovered `rclone-filestore` binary suggests a path-addressed filestore API
mounted into the guest through FUSE. Observed mount roles include:

- `/mnt/session/uploads` as read-only;
- `/mnt/session/outputs` as read-write;
- `/mnt/skills` as read-only.

The API surface includes directory listing, metadata reads, file reads, mkdir,
move, copy, remove, upload/download, import zip, filesystem migration, and
filesystem removal.

Design implication: model session files as a product filesystem, not a raw S3
bucket. The UI and API need path, metadata, TTL, artifact, and quarantine
semantics.

## Work, Lease, And Heartbeat

The recovered orchestrator and pod monitor surfaces show:

- worker registration and worker epoch;
- poll for work;
- work acknowledgement;
- queue-empty and poll-error metrics;
- session heartbeat;
- stuck agent checks;
- lease expiry scheduling;
- stop API calls;
- health file updates.

Design implication: leases are a first-class object. Sessions, run attempts,
VMs, tunnels, and deployment jobs need heartbeats or timeouts plus finalizers.

Additional CLI and SDK corroboration from the managed-agent command surface:

- `worker poll` long-polls an environment for work, then runs a local session
  tool runner for the assigned session.
- `worker run` attaches to an existing session and executes tool-use events
  locally.
- environment work exposes poll, retrieve, update, list, acknowledge,
  heartbeat, stats, and stop operations.
- work heartbeat uses an expected previous heartbeat value, including a
  first-claim marker for no previous heartbeat.
- the observed session status enum is `rescheduling`, `running`, `idle`, and
  `terminated`.
- the observed self-hosted work state enum is `queued`, `starting`, `active`,
  `stopping`, and `stopped`.
- the prebuilt worker can stop after the agent returns an idle/end-turn result.

Design implication: `idle` is a session lifecycle state, not a queued-work
state. The open platform should schedule from explicit environment work records
and keep session status focused on whether a turn is active.

## Auth And Token Containment

The recovered auth/session ingress shape shows a normalized auth context with
session-ingress, API, OAuth, GitHub/source, Supabase, and deploy-related
credentials. Source and provider access use proxy paths such as git proxy,
GitHub API proxy, and deployment proxy.

Design implication: durable provider secrets should stay in a vault/control
plane. Guests receive session-scoped proxy credentials or short-lived material,
with explicit secret bindings and audit events.

## Source Setup

Source setup is explicit structured input rather than inferred from the
workspace. Evidence includes:

- git repo, host, ref, URL, auth, mount path, sparse checkout, and unrestricted
  push policy fields;
- GitHub API validation and git fallback;
- clone/fetch retry and stale-lock cleanup;
- sparse checkout path validation;
- snapshot restore and seed bundle support;
- symlink escape and max-file-size checks for zip extraction.

Design implication: source setup should be a dedicated runner subsystem with
clear events and failure classes.

## MCP And Tools

The recovered MCP registry supports built-in server registration with:

- per-server factory;
- should-register predicate;
- additional system prompt text;
- tool list;
- local HTTP MCP server with bearer token;
- Claude config merge;
- support for local command and remote URL shapes;
- per-tool enablement and permission policy.

Design implication: start with explicit session-scoped MCP registration and
tool policy. A marketplace abstraction can come later.

## Tunnel And Actions

The recovered tunnel client handles long-running control-plane connections,
HTTP forwarding, WebSocket forwarding, cancellation, ping/reconnect behavior,
and an action registry. Confirmed action names include:

- `deploy`;
- `downloadsource`;
- `snapshot`;
- `snapshotproject`;
- `status`.

Design implication: model tunnels as session-scoped product objects with
leases, routes, action permissions, status, and logs.

## Observability

Recovered observability surfaces include:

- session event envelopes with message content, duration, usage, cost, model
  usage, permission denials, errors, and log data;
- activity and step recording, including long-running activity keepalives;
- diagnostic log buffering and remote flushing;
- OTLP metrics/log endpoints;
- metrics for environment-manager start/end, agent start/end, orchestrator
  sessions, empty queues, poll errors, source processing, git proxy setup, init
  scripts, and environment initialization.

Design implication: session events are product data. They should power the UI,
debuggability, audit, metrics, and later incident review.

## Runtime Inventory Caution

A live June 2026 cloud runtime inventory showed Ubuntu 24.04, Python 3.11,
Node.js 20, Java 21, Ruby, PHP, build tools, browser/document tooling, and
various Python packages. It did not confirm Go, Rust, Maven, Gradle, pnpm, yarn,
or a broad global npm package set.

Design implication: our environment inventory should be explicit and image
versioned. Do not rely on assumed preinstalled runtimes.
