## [2026-06-21 01:48] | Task: Align sidebar header controls

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone and tighten the obvious sidebar differences,
> especially the top `Claude Console` header and the sidebar collapse icon.

### Changes Overview

- Area: console UI sidebar shell.
- Key actions:
  - Matched the expanded sidebar to the observed Claude Console width used by
    the managed-agent pages.
  - Matched the collapsed rail width to the observed 48px rail.
  - Replaced the generic button wrapper for sidebar expand/collapse with a
    dedicated 28px CDS-style icon button.

### Design Intent

The sidebar header is a first-viewport visual anchor. Using the same width,
button size, radius, glyph treatment, and hover shell as Claude Console keeps
the navigation rail and content start position closer to the source UI without
changing the underlying route structure.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-0148-align-sidebar-header-controls.md`
