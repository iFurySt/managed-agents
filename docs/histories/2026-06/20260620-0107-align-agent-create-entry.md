## [2026-06-20 01:07] | Task: Align agent create entry

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Agents surface.
- Key actions:
  - Changed the Agents page `Create agent` action from opening a local create dialog to creating a default agent immediately.
  - Navigates directly to the new agent detail config view after creation.
  - Kept backend defaults for `Untitled agent`, `claude-sonnet-4-6`, the blank-agent description, default system prompt, and `agent_toolset_20260401`.

### Design Intent

Source validation showed that clicking `Create agent` on the Claude Platform Agents list creates a new `Untitled agent` and routes to `/agents/<id>?tab=config`; it does not open a create dialog. The local console now matches that primary entry behavior while preserving the existing detail edit flow for configuring the generated agent.

Local OBU validation confirmed the button stayed `132x32`, the route changed from `/agents` to `/agents/agent_local_...?tab=config`, no create dialog appeared, and the detail page rendered the source-matched default fields.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-0107-align-agent-create-entry.md`
