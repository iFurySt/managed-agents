# Product Specs Index

Use this directory for user-visible behavior and workflow definitions.

Suggested conventions:

- One spec per feature or workflow.
- Start with the user problem, not implementation detail.
- State acceptance criteria and observable outcomes.
- Cross-link the related execution plan, release note, and architecture changes.

## Initial Managed Agents Workflows

Create focused specs for these workflows before implementation:

- Create a session from an agent profile, environment, source repo, prompt, file
  uploads, skills, and vault bindings.
- Diagnose a failed session from status, failure class, run attempt, host,
  image digest, logs, steps, files, credential denials, and diagnostics.
- Manage an agent profile with adapter type, model/provider, prompt policy,
  default tools, skills, and environment.
- Manage an environment with image, resources, init script, egress policy,
  sandbox policy, and tool inventory.
- Bind a credential to a session, tool, source proxy, or deployment job without
  exposing the durable secret to the guest workspace.
- Browse session files and artifacts across uploads, outputs, snapshots,
  skills, memory, TTL, quarantine, import, and export.
- Register a skill package and mount it read-only into selected sessions.
- Inspect a tunnel or preview action with route, protocol, lease, last ping,
  cancellation, and action logs.
- Promote a session artifact to a deployment record with provider status, URL,
  logs, and rollback pointer.

The first spec should be the session creation and failure diagnosis workflow,
because it validates the core product loop.
