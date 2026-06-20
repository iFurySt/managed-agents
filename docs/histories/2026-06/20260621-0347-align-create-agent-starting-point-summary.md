## [2026-06-21 03:47] | Task: Align create agent starting point summary

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> Continue cloning the Claude Console managed agents surfaces with OBU comparisons and small verified milestones.

### Changes Overview

- Area: Console create agent dialog.
- Key actions: Matched the Starting point header structure more closely to the source dialog by using an 8px baseline gap, a stronger title weight, muted selected-template summary text, and hiding the summary while the section is expanded.

### Design Intent

The source dialog keeps the selected starting point summary available in the collapsed header but fades it out while the panel is open. Mirroring that behavior reduces visual duplication in the expanded state while preserving the useful compact summary when the section is collapsed.

### Files Modified

- `apps/console/src/App.tsx`
