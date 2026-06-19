## [2026-06-20 01:12] | Task: Refine agent edit dialog

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Agents detail surface.
- Key actions:
  - Added `data-cds="Dialog"` to the shared console dialog primitive.
  - Matched the Agent `Edit agent` dialog close label, tab roles, selected state, and editor content positioning to the source dialog.
  - Updated agent YAML defaults and JSON preview to use the source-style `model.id` / `model.speed` object.
  - Kept save behavior compatible with the backend by submitting `model.id`.

### Design Intent

Source validation showed the `Edit agent` dialog at `720x680`, with `data-cds="Dialog"`, a `Close` icon button, `YAML` / `JSON` controls rendered as tabs, and a code area beginning at `x=312.5`, `y=168`. The source JSON preview uses `model: { id, speed }` and includes the default tool, skills, and metadata fields.

Local OBU validation matched the dialog dimensions, `data-cds`, tab `aria-selected` behavior, YAML editor rect `647x475`, and JSON preview rect `647x608` with the source-style `model.id` / `model.speed` structure.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260620-0112-refine-agent-edit-dialog.md`
