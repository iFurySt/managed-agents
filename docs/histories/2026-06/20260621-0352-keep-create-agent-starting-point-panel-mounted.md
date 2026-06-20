## [2026-06-21 03:52] | Task: Keep create agent starting point panel mounted

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning the Claude Console managed agents surfaces with OBU comparisons and small verified milestones.

### Changes Overview

- Area: Console create agent dialog.
- Key actions: Kept the Starting point collapsible panel mounted when collapsed, removed the `hidden` attribute, and matched the source panel's settled `transition-duration: 0s` behavior.

### Design Intent

The source dialog leaves the collapsible panel in the layout tree and controls its open state with height and overflow rather than `display: none`. Keeping the local panel mounted preserves measurable layout state and avoids abruptly removing the content subtree when the section is collapsed.

### Files Modified

- `apps/console/src/App.tsx`
