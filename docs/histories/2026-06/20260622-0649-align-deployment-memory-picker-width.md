## [2026-06-22 06:49] | Task: Align deployment memory picker width

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone with OBU-backed visual checks, fixing only evidence-backed mismatches.

### Changes Overview

- Area: Create deployment dialog.
- Key actions: Constrained the memory store picker trigger to `464px` so it aligns with the other create deployment combobox fields.

### Design Intent

OBU comparison showed the source dialog renders the agent, environment, vault, memory store, and trigger comboboxes at `464px`. The local memory store picker was `472px`; it now matches the reference and the neighboring fields.

### Files Modified

- `apps/console/src/App.tsx`
