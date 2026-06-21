## [2026-06-22 00:16] | Task: Match detail document titles

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages, using OBU evidence for fidelity fixes.

### Changes Overview

- Area: console navigation UX
- Key actions:
  - Verified the Claude Platform agent detail page keeps the section title `Agents | Claude Platform`.
  - Updated local detail routes to keep the same section-level document title instead of switching to singular titles.

### Design Intent

The previous route title pass matched list pages but inferred singular titles for detail pages. OBU verification showed the source detail route keeps the list/section title. Keeping section titles for nested routes better matches the source browser tab behavior.

### Files Modified

- `apps/console/src/App.tsx`
