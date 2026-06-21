## [2026-06-22 02:32] | Task: Align sidebar logo link

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, landing scoped verified milestones.

### Changes Overview

- Area: Console sidebar navigation
- Key actions:
  - Matched the expanded sidebar logo link href to Claude Console by pointing it at `/dashboard`.
  - Added the source-aligned `sidebar-logo-home` test id.
  - Added a lightweight Dashboard route so the logo and existing Dashboard sidebar link do not render a blank page.
  - Added a Dashboard document title mapping.

### Design Intent

Claude Console treats the sidebar logo as a Dashboard link. This change aligns that navigation behavior while keeping the Dashboard surface intentionally lightweight until the fuller page is replicated.

### Files Modified

- `apps/console/src/App.tsx`
