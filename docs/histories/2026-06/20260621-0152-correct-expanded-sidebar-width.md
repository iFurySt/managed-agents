## [2026-06-21 01:52] | Task: Correct expanded sidebar width

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone and tighten visible sidebar-to-content
> typography and spacing differences with OBU comparisons.

### Changes Overview

- Area: console UI sidebar layout.
- Key actions:
  - Rechecked the live Claude Console agents page with OBU against the local
    clone.
  - Corrected the expanded sidebar width back to 256px so the main content,
    header description, and table origin align with the source page.

### Design Intent

The expanded sidebar width controls the whole content start position. Fresh OBU
sampling showed Claude Console using a 256px expanded rail on the agents page,
with main content starting at 256px and the page content at 280px. Restoring
the clone to that width keeps the list-page typography and table layout on the
same horizontal grid while preserving the already-aligned 48px collapsed rail
and 28px sidebar icon buttons.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-0152-correct-expanded-sidebar-width.md`
