## [2026-06-22 02:49] | Task: Align collapsed workspace picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the managed agents console clone without broad new exploration; focus on visible and functional parity issues.

### Changes Overview

- Area: Console collapsed sidebar parity.
- Key actions:
  - Used Open Browser Use to compare the source Claude Console and local clone on the Agents page.
  - Confirmed the collapsed expand button already matched the source at x=8, y=12, w=28, h=28.
  - Added the source-compatible `sidebar-workspace-scope-picker-concise` structure for the collapsed workspace selector.
  - Preserved a hidden `Default` label and combobox role while keeping the local picker aligned to the source x=8, y=56, w=32, h=32 container and x=9, y=57, w=30, h=30 trigger.

### Design Intent

Keep this convergence step narrow and evidence-based. The change improves DOM and accessibility parity for the collapsed workspace picker without changing page routing or broader sidebar behavior.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0249-align-collapsed-workspace-picker.md`
