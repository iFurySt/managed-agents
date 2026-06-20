## [2026-06-21 04:59] | Task: Align Sidebar collapse icon

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> The left sidebar top area still has visible drift: the Claude Console title should be checked and the sidebar collapse icon still needs to be implemented.

### Changes Overview

- Area: Console sidebar
- Key actions:
  - Measured the source and local sidebar title styles with OBU before editing.
  - Kept the title styling unchanged because the source and local computed title styles matched.
  - Replaced the private glyph-based collapse icon with the visible Lucide `PanelLeft` icon.

### Design Intent

The sidebar title already matched the source typography in the live browser, so changing it would risk adding drift. The collapse control now uses a standard SVG icon to avoid relying on private icon-font rendering while keeping the existing button size, position, and interaction behavior.

### Files Modified

- `apps/console/src/App.tsx`
