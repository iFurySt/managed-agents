## [2026-06-20 01:34] | Task: Refine files empty state docs link

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Files empty state.
- Key actions:
  - Added the source-matched `data-cds="Button"` marker to the `View docs` link in the Files empty state code toolbar.
  - Kept the existing link destination, visual sizing, and code copy behavior unchanged.

### Design Intent

Source OBU validation showed the Files empty state code block at about `952x208`, with a `36px` toolbar, a `View docs` anchor rendered as `data-cds="Button"` around `96.2x24`, and a copy button around `24x24`. The local toolbar already matched the visual measurements, but the docs link lacked the CDS button marker used by the source DOM.

Local OBU validation confirmed `View docs` as `data-cds="Button"` at `96x24`, with the copy control still rendered as `data-cds="Button"` at `24x24`.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-0134-refine-files-empty-state-docs-link.md`
