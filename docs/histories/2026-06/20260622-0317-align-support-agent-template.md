## [2026-06-22 03:17] | Task: Align support agent template

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone, avoid broad new work, and close obvious remaining 1:1 gaps.

### Changes Overview

- Area: Console create-agent template flow.
- Key actions:
  - Aligned the `Support agent` template system prompt with the source console behavior.
  - Added Notion and Slack MCP server/toolset generation for the support template.
  - Updated YAML-to-JSON preview parsing so both MCP servers and toolsets are represented.
  - Verified the local dialog via browser automation, then ran console lint and build.

### Design Intent

This keeps convergence focused on a visible source-console mismatch without expanding the product surface. The implementation follows the existing template-specific YAML generation used for richer starter templates and keeps parsing intentionally narrow to the known generated config shape.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0317-align-support-agent-template.md`
