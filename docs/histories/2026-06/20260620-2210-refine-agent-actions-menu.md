## [2026-06-20 22:10] | Task: Refine agent actions menu

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue one-to-one Claude Console replication across managed agents surfaces, including child pages, menus, and dialogs.

### Changes Overview

- Area: Console frontend agent row/detail actions menu.
- Key actions:
  - Compared the source and local agent detail more-actions menu through Open Browser Use.
  - Expanded the local menu to match the source actions: Start session, Guided edit, Create deployment, and Archive.
  - Matched the source menu width, height, item sizing, panel ring/shadow, and vertical offset.
  - Wired actions to existing local routes or the existing edit/archive flows.

### Design Intent

Move beyond visual polish by adding the missing action surface the source console exposes on agent details. The menu now has the same four-item structure and dimensions as the source while using the repository's existing local routes and dialogs for behavior.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-2210-refine-agent-actions-menu.md`
