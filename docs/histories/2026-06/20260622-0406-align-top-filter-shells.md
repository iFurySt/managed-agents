## [2026-06-22 04:06] | Task: Align top filter shells

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone quickly, using OBU comparisons and avoiding broad new scope.

### Changes Overview

- Area: Console top-level list filters.
- Key actions:
  - Used Open Browser Use to compare source and local filter controls across the main Managed Agents pages.
  - Added an opt-in `FieldSelect` shell so top-level filters can match the source split between the outer field chrome and inner transparent trigger.
  - Updated Agents, Sessions, Environments, Credential vaults, Memory stores, and Deployments filter controls to use the source outer shell/right-padding structure.

### Design Intent

Claude Console renders these filters with a white translucent shell, inset ring, and right padding on the outer field, while the trigger itself stays transparent with left-only padding. Keeping this as an opt-in prop avoids changing dialog/detail selects that have different geometry.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260622-0406-align-top-filter-shells.md`
