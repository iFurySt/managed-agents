## [2026-06-19 22:46] | Task: Align deployment agent initial state

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Stopped preselecting an agent when `Create deployment` opens from the deployments page.
  - Hid the `Version` field until an agent is selected, matching the observed Claude Platform initial dialog.
  - Let the agent picker render at the source-width 464px trigger in the empty state, then collapse to the 292px selected-agent layout beside the version picker after selection.

### Design Intent

The source dialog treats agent selection as an explicit user choice. Keeping the empty state faithful also preserves the create button's validation path because deployments still require an agent before submission. The agent-detail scoped flow continues to show the fixed agent and version immediately.

### Files Modified

- `apps/console/src/App.tsx`
