## [2026-06-19 21:19] | Task: Refine files empty language menu

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue cloning Claude Platform managed agents surfaces with Open Browser Use evidence, preserving small verified milestones with commits and pushes.

### Changes Overview

- Area: Console Files empty state and CDS select component.
- Key actions:
  - Compared Claude Platform and local Files empty state with Open Browser Use.
  - Confirmed the empty upload-template layout already matches the source code block coordinates.
  - Added optional menu and item class hooks to `FieldSelect` without changing default select behavior.
  - Applied those hooks to the Files empty-state language menu so its dropdown uses the source-like 128px menu width and 8px option radius.

### Design Intent

The Files source page is currently an empty state, so this milestone stays scoped to the visible upload-template interaction rather than inventing file-detail work without source evidence. The reusable CDS hooks make future one-off source menu matches possible while keeping existing select defaults intact.

OBU verification points:

- Source language trigger: `x=300 y=250 w=80.9 h=24`; local remains `x=300 y=250 w=81 h=24`.
- Source language dropdown content: `w=128 h=72`; local after change: `w=128 h=74`.
- Source `cURL` option: `w=120 h=32 radius=8px`; local after change: options `w=118 h=32 radius=8px`.
- Source code shell: `x=288 y=244 w=952 h=207.9`; local remains `x=288 y=244 w=952 h=207.9`.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
