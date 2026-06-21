## [2026-06-22 07:52] | Task: Align files language menu

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone through OBU-backed source/local comparison without expanding scope.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Matched the Files empty-state language menu shadow to the source menu.
  - Replaced the selected language indicator with the source-style Anthropicons check glyph.

### Design Intent

The source Files language selector uses the CDS menu shadow and an icon-font check indicator. The local clone used the generic `shadow-lg` menu and a lucide SVG check, which made the menu subtly diverge from the source. The change is scoped to the Files language menu only.

### Files Modified

- `apps/console/src/App.tsx`
