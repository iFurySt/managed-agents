## [2026-06-20 17:28] | Task: Refine skills version hover

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue using Open Browser Use to clone Claude Console managed-agents surfaces one module at a time, verifying and pushing small milestones.

### Changes Overview

- Area: Console UI Skills page.
- Key actions: Compared source and local `/skills` pages plus the create skill dialog with Open Browser Use. Updated skill list version-history controls so they are hidden by default and reveal on card hover or focus, matching the source page behavior.

### Design Intent

Keep the Skills list visually quiet by default while preserving keyboard and pointer access to version history actions.

### Files Modified

- `apps/console/src/App.tsx`
