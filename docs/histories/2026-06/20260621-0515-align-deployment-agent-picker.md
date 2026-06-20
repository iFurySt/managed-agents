## [2026-06-21 05:15] | Task: Align Deployment agent picker

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue OBU-based Claude Console cloning, including dialogs and nested interactions inside each managed-agents module.

### Changes Overview

- Area: Console Deployments create dialog
- Key actions:
  - Compared the Claude Console and local `Create deployment` Agent picker popover with OBU.
  - Added the source-style search row to the local Agent picker popover.
  - Matched the popover height, list viewport height, option ordering, and muted timestamp typography to the source measurement.

### Design Intent

The source Agent picker uses a searchable 320px popover with a 37px search header and a constrained scrolling option viewport. The local picker previously rendered a shorter static list without the search row. Aligning this nested picker improves the create deployment workflow fidelity while keeping selection behavior local and simple.

### Files Modified

- `apps/console/src/App.tsx`
