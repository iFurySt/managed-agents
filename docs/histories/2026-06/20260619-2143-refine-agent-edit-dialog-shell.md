## [2026-06-19 21:43] | Task: Refine Agent edit dialog shell

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents modules with OBU evidence, small verified milestones, commits, and pushes.

### Changes Overview

- Area: Console UI, Agents, Agent detail edit dialog.
- Key actions:
  - Compared the Claude Platform Agent edit dialog against local `/agents/:id` with Open Browser Use.
  - Matched the local dialog shell to the source dimensions and chrome: 720px width, 680px height, 12px radius, no border, source-like header spacing, title type, and 32px close button.

### Design Intent

The edit dialog is part of the Agent detail workflow and should use the same modal shell proportions as Claude Console before deeper editor refinements. This keeps the milestone scoped to the shell and header while preserving the existing edit form behavior.

### Files Modified

- `apps/console/src/App.tsx`
