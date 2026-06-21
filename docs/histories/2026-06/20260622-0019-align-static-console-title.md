## [2026-06-22 00:19] | Task: Align static console title

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages, keeping changes scoped and evidence-driven.

### Changes Overview

- Area: console metadata fidelity
- Key actions:
  - Updated the static HTML document title from `Managed Agents Console` to `Claude Platform`.
  - Verified the built HTML uses the new static title while runtime route title logic remains responsible for page-specific titles.

### Design Intent

The React app already sets Claude Platform-style titles after route initialization. Aligning the static HTML title removes the last visible `Managed Agents Console` browser metadata fallback before hydration or when inspecting the served shell.

### Files Modified

- `apps/console/index.html`
