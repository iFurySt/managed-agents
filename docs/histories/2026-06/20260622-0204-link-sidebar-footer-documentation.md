## [2026-06-22 02:04] | Task: Link sidebar footer documentation

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Quickly converge the Claude Console clone now that functional behavior is mostly complete; avoid broad new work and tighten visible 1:1 gaps.

### Changes Overview

- Area: Console sidebar
- Key actions:
  - Matched the expanded sidebar Documentation footer row to Claude Console by making it a real `/docs/en/home` link.
  - Preserved the expanded Credits footer row as a non-interactive row, matching the source page behavior.
  - Added footer hover background styling without changing row geometry.

### Design Intent

This keeps the convergence pass narrowly scoped: only the verified semantic mismatch was changed, while existing footer spacing and the Credits row behavior were left intact.

### Files Modified

- `apps/console/src/App.tsx`
