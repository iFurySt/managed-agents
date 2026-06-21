## [2026-06-22 00:32] | Task: Preserve workspace route state

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Quickly converge the console clone now that functionality is mostly in place, avoid further expansion, and keep tightening obvious mismatches.

### Changes Overview

- Area: Console workspace route compatibility.
- Key actions:
  - Preserved query strings and hashes when redirecting source-style workspace URLs into local console routes.

### Design Intent

Source console routes can carry list state such as filters or search values in
the URL. The compatibility redirect should map the path without silently
discarding that state, keeping the clone behavior closer to the source while
staying narrowly scoped.

### Files Modified

- `apps/console/src/App.tsx`
