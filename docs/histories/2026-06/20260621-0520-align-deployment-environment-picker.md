## [2026-06-21 05:20] | Task: Align Deployment environment picker

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue OBU-based Claude Console cloning, including dialogs and nested interactions inside each managed-agents module.

### Changes Overview

- Area: Console Deployments create dialog
- Key actions:
  - Compared the Claude Console and local `Create deployment` Environment picker with OBU.
  - Added the source-style search row to the local Environment picker popover.
  - Matched the trigger width, popover height, list viewport height, timestamps, and host chip typography to the source measurement.

### Design Intent

The source Environment picker uses a searchable popover with a fixed-size scrolling list and compact host badges. The local picker previously rendered a shorter static list with a wider trigger. Matching the source geometry and content treatment keeps the deployment creation flow visually consistent with the original console.

### Files Modified

- `apps/console/src/App.tsx`
