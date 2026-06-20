## [2026-06-21 05:10] | Task: Align Deployment trigger popover

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue OBU-based Claude Console cloning, including dialogs and nested interactions inside each managed-agents module.

### Changes Overview

- Area: Console Deployments create dialog
- Key actions:
  - Opened the Claude Console and local `Create deployment` dialogs with OBU.
  - Compared the Trigger picker popover geometry between source and local.
  - Changed the local Trigger picker menu to open above the trigger field, matching the source popover placement.

### Design Intent

The source Trigger picker opens upward so it stays inside the visible dialog area above the footer. The local picker previously opened downward, overlapping the sticky footer and extending toward the viewport edge. Matching the source placement improves nested dialog fidelity without changing trigger selection behavior.

### Files Modified

- `apps/console/src/App.tsx`
