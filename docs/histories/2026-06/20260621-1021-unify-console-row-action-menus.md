## [2026-06-21 10:21] | Task: Unify console row action menus

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone now that the primary functionality is mostly in place.

### Changes Overview

- Area: Console frontend row action menus.
- Key actions:
  - Added shared Claude-style menu content, item, danger item, and separator class constants.
  - Migrated row action menus across agents, sessions, deployments, environments, vaults, credentials, memory stores, memory records, files, and skills to the shared menu styling.
  - Replaced older bordered menu variants with the same 12px radius, ink ring, compound shadow, and 32px item rhythm used by the main managed-agent menus.

### Design Intent

This change favors a small shared styling contract for high-frequency action menus instead of continuing page-by-page visual fixes. It preserves existing behavior while reducing visible drift between surfaces.

### Files Modified

- `apps/console/src/App.tsx`
