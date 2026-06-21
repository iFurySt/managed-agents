## [2026-06-22 07:28] | Task: Align pagination buttons

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone without expanding scope; focus on visible 1:1 mismatches after functionality is mostly complete.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Added a source-style pagination button component with visible 32px rounded border boxes in disabled state.
  - Replaced repeated table pagination controls across agents, sessions, deployments, environments, vaults, vault detail, and memory stores.
  - Kept generic icon buttons unchanged to avoid changing row action and toolbar controls.

### Design Intent

The source console keeps pagination controls visible even when disabled. The local clone had bare chevrons because disabled icon buttons lost the button shell. A dedicated pagination component keeps this fix scoped to pagination without changing unrelated icon-button behavior.

### Files Modified

- `apps/console/src/App.tsx`
