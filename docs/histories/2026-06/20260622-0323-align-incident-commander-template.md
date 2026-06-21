## [2026-06-22 03:23] | Task: Align incident commander template

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone, avoid broad new work, and close obvious remaining 1:1 gaps.

### Changes Overview

- Area: Console create-agent template flow.
- Key actions:
  - Aligned the `Incident commander` template system prompt with the source console behavior.
  - Switched the template-generated model to `claude-opus-4-8`.
  - Added Sentry, Linear, Slack, and GitHub MCP server/toolset generation for the incident template.
  - Updated YAML-to-JSON preview parsing so the generated incident MCP servers and toolsets are represented.
  - Verified the local dialog via browser automation, then ran console lint and build.

### Design Intent

This closes another visible source-console mismatch in the existing create-agent template flow without broadening the milestone. The implementation stays narrow and mirrors the existing generated-template YAML pattern.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0323-align-incident-commander-template.md`
