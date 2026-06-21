## [2026-06-21 15:28] | Task: Align sidebar footer copy

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone, but avoid broad divergence now that the functional surface is mostly in place.

### Changes Overview

- Area: Console sidebar copy.
- Key actions:
  - Matched the source console's non-breaking space in the credits amount.
  - Matched the source console's organization name apostrophe in the user footer.

### Design Intent

This closes a small but global sidebar text mismatch that appears on every managed-agent page. The change is intentionally narrow and does not alter navigation behavior.

### Files Modified

- `apps/console/src/App.tsx`
