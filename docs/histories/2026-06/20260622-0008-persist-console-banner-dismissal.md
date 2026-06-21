## [2026-06-22 00:08] | Task: Persist console banner dismissal

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages, focusing on obvious UI/UX mismatches without expanding scope.

### Changes Overview

- Area: console UI state
- Key actions:
  - Persisted the update banner dismissal state in local storage.
  - Kept the banner dismissible for the current render even when storage is unavailable.

### Design Intent

The Claude Platform banner can remain dismissed across navigation. The local console previously remounted the banner when returning to Vaults, shifting the page content down again. Persisting the dismiss state keeps the Vaults layout stable after the user closes the banner.

### Files Modified

- `apps/console/src/App.tsx`
