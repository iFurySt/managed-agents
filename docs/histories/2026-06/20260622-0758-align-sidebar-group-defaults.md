## [2026-06-22 07:58] | Task: Align sidebar group defaults

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone now that functionality is mostly in place, focusing only on obvious source-proven mismatches.

### Changes Overview

- Area: Console sidebar visual parity.
- Key actions:
  - Matched the source sidebar default group state by keeping `Analytics` and `Claude Code` collapsed.
  - Left `Build`, `Managed Agents`, and `Manage` expanded to preserve the source default layout.
  - Verified source and local sidebar group `aria-expanded` values and y positions through Open Browser Use.

### Design Intent

This keeps the convergence pass narrow and source-driven. The change avoids new interaction scope and fixes a global sidebar layout mismatch that affects every managed-agents page.

### Files Modified

- `apps/console/src/App.tsx`
