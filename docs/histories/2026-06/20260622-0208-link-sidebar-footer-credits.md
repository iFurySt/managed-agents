## [2026-06-22 02:08] | Task: Link sidebar footer credits

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue quickly converging the Claude Console clone with OBU-based comparison, focusing on proven functional and visual gaps rather than broad new work.

### Changes Overview

- Area: Console sidebar
- Key actions:
  - Matched the expanded sidebar Credits footer row to Claude Console by adding a full-row billing link overlay.
  - Preserved the visible Credits row layout and amount text while making the row interactive.
  - Kept the accessibility label aligned with the source page.

### Design Intent

The source page renders Credits as a visual row with an inset billing link. This change keeps the local row geometry stable while adding the missing interaction semantics.

### Files Modified

- `apps/console/src/App.tsx`
