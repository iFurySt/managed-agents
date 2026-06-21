## [2026-06-22 02:28] | Task: Align sidebar section test ids

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, landing scoped verified milestones.

### Changes Overview

- Area: Console sidebar DOM parity
- Key actions:
  - Added source-aligned `data-testid` values to expanded sidebar section buttons.
  - Added source-aligned concise `data-testid` values to collapsed sidebar section buttons.
  - Preserved current section button geometry and visual styling.

### Design Intent

Claude Console exposes stable selectors for both expanded and collapsed sidebar section controls. Matching those selectors improves DOM fidelity and supports later automated parity checks without introducing visual churn.

### Files Modified

- `apps/console/src/App.tsx`
