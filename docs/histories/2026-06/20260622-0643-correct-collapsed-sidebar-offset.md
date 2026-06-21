## [2026-06-22 06:43] | Task: Correct collapsed sidebar offset

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone with OBU-backed visual checks and correct evidence-backed mismatches.

### Changes Overview

- Area: Console sidebar collapsed state.
- Key actions: Restored the collapsed sidebar occupied width to `48px` after comparing the current Claude Console collapsed deployment page state.

### Design Intent

Fresh OBU evidence on `/deployments` showed the source collapsed state renders main content at `x=48` and the page title at `x=72`. The previous wider local collapsed layout came from an ambiguous hidden-DOM reading; this change restores the visible layout to match current source behavior.

### Files Modified

- `apps/console/src/App.tsx`
