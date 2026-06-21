## [2026-06-21 23:53] | Task: Allow console preview origin

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Managed Agents console clone, avoid further expansion, and fix obvious issues found during final smoke checks.

### Changes Overview

- Area: local console/API verification
- Key actions:
  - Added Vite preview origins on ports `4173` and `4174` to the apiserver default CORS allow list.
  - Kept the change scoped to local preview parity so production-build smoke checks can hit the local API without 403 responses.

### Design Intent

The console can already run through the Vite development server, but final convergence checks also use `vite preview` against the production bundle. Vite preview defaults to port `4173`, and this task used `4174`; allowing both keeps local validation straightforward without widening CORS beyond known local origins.

### Files Modified

- `apps/apiserver/main.go`
- `docs/histories/2026-06/20260621-2353-allow-console-preview-origin.md`
