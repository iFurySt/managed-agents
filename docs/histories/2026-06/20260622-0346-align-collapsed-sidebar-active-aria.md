## [2026-06-22 03:46] | Task: Align collapsed sidebar active aria

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone and close sidebar parity gaps.

### Changes Overview

- Area: Console collapsed sidebar navigation.
- Key actions:
  - Added `aria-current="page"` to active collapsed sidebar links.
  - Verified collapsed `/dashboard` marks the Dashboard icon active while leaving API keys inactive.
  - Ran console lint and build.

### Design Intent

Collapsed and expanded sidebar links should expose the same current-page semantics. This keeps active state parity without changing the visual footprint or navigation behavior.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0346-align-collapsed-sidebar-active-aria.md`
