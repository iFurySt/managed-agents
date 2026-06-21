## [2026-06-22 00:27] | Task: Support workspace console paths

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages and their URL structure.

### Changes Overview

- Area: console routing
- Key actions:
  - Added a route alias for source-style `/workspaces/:workspaceId/:section/*` paths.
  - Redirected workspace-prefixed routes to the existing local console sections and detail pages.
  - Preserved the existing short local routes.

### Design Intent

The source Claude Platform pages use workspace-prefixed paths, while the local clone primarily uses short paths such as `/agents`. Supporting workspace-prefixed aliases makes direct source-style URLs land on the correct cloned console pages without duplicating page implementations.

### Files Modified

- `apps/console/src/App.tsx`
