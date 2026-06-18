# Product Sense

This product is an open managed agents platform for teams that want to delegate
software work to Codex, OpenCode, or future code agents while keeping the
runtime inspectable and self-hostable.

## Primary Users

- Engineers running long-lived coding sessions that need source access, tools,
  files, credentials, and deployment previews.
- Platform owners who need to manage sandbox images, credentials, policies,
  hosts, and audit logs.
- Agent builders who want to package reusable skills, memory stores, MCP tools,
  and agent profiles without binding to one proprietary control plane.

## Differentiation

- Open control plane around disposable isolated agent sessions.
- Agent-agnostic runtime contract, with Codex and OpenCode as first adapters.
- Operational session model: leases, run attempts, files, events, logs,
  diagnostics, tunnels, and outcomes are first-class product objects.
- Credential containment by default through a vault/proxy boundary.
- Local-first development path that can grow into Firecracker-backed production
  isolation.

## Quality Priorities

Trust is the primary quality attribute. Users must understand what an agent did,
which tools it used, which files it touched, which credentials it was allowed to
access, and why a session failed.

The next priorities are:

- isolation and secret safety;
- reproducible session setup;
- clear failure diagnosis;
- adapter flexibility;
- low-friction local install;
- predictable costs and resource limits.

## Early Stage Bias

Optimize early work for one complete, inspectable session loop instead of broad
feature coverage. A narrow end-to-end path with real isolation, storage,
heartbeat, cancellation, and logs is more valuable than many partially modeled
objects.

## Mature Stage Bias

As the product matures, optimize for multi-host reliability, policy automation,
image provenance, richer memory and skill workflows, deployment integrations,
and reviewable audit trails.
