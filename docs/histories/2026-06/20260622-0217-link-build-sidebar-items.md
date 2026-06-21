## [2026-06-22 02:17] | Task: Link Build sidebar items

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, landing verified milestones and keeping the scope tight.

### Changes Overview

- Area: Console sidebar and build routes
- Key actions:
  - Matched the expanded Build sidebar children to Claude Console link semantics.
  - Added source-aligned hrefs for Workbench, Files, Skills, and Batches.
  - Added lightweight Workbench and Batches route fallbacks so newly linked items do not render a blank page.
  - Added document titles for Workbench and Batches.

### Design Intent

The source sidebar exposes each Build child as a navigable item. This change focuses on that proven semantic gap while preserving the existing sidebar geometry and avoiding a broader Build surface implementation.

### Files Modified

- `apps/console/src/App.tsx`
