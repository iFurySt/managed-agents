## [2026-06-22 06:14] | Task: Align agent config highlighting

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local CLI`

### User Query

> Continue converging the Claude Console clone quickly, using OBU comparisons and avoiding unnecessary expansion.

### Changes Overview

- Area: Console Agents create/edit dialogs.
- Key actions:
  - Compared source and local `/agents` with OBU at a fixed desktop viewport.
  - Replaced the plain YAML config textarea with an editable highlighted textarea layer.
  - Matched YAML token colors for keys and values to the source editor.

### Design Intent

The Claude Console create-agent dialog renders Agent config as a highlighted code editor. The local clone previously used a plain textarea, which preserved editing but missed the visible red/green YAML syntax treatment. The change keeps the implementation lightweight and editable by overlaying a highlighted `<pre>` behind a transparent textarea, avoiding a new editor dependency while improving visual fidelity.

### Files Modified

- `apps/console/src/App.tsx`
