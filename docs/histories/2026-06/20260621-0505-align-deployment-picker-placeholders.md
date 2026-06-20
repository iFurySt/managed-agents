## [2026-06-21 05:05] | Task: Align Deployment picker placeholders

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue OBU-based Claude Console cloning, including dialogs and nested interactions inside each managed-agents module.

### Changes Overview

- Area: Console Deployments create dialog
- Key actions:
  - Compared the Claude Console and local `Create deployment` dialog with OBU.
  - Identified that empty picker labels used primary text locally while the source used muted placeholder text.
  - Updated the empty states for agent, environment, vault, memory store, and trigger pickers to use muted placeholder styling.

### Design Intent

The source dialog distinguishes unselected picker placeholders from selected values using muted text and lighter weight. Matching that treatment improves visual fidelity without changing picker behavior, data flow, or submitted values.

### Files Modified

- `apps/console/src/App.tsx`
