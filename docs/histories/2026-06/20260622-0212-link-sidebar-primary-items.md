## [2026-06-22 02:12] | Task: Link sidebar primary items

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, prioritizing functional parity and avoiding unnecessary expansion.

### Changes Overview

- Area: Console sidebar
- Key actions:
  - Matched the expanded sidebar Dashboard row to Claude Console by making it a `/dashboard` link.
  - Matched the expanded sidebar API keys row to Claude Console by making it a `/settings/workspaces/default/keys` link.
  - Preserved row height and geometry while adding source-aligned test ids.

### Design Intent

The collapsed sidebar already exposed these destinations as links. This change brings the expanded sidebar to the same interaction semantics as the source page without introducing new out-of-scope page surfaces.

### Files Modified

- `apps/console/src/App.tsx`
