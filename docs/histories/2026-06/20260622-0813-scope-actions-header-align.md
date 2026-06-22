## [2026-06-22 08:13] | Task: Scope actions header alignment

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone through source/local OBU comparison, keeping changes narrow and source-proven.

### Changes Overview

- Area: Console shared table component.
- Key actions:
  - Added a configurable `actionsHeaderAlign` prop to `DataTable`.
  - Kept the default action-header alignment left for tables whose source action column is blank-left aligned.
  - Explicitly right-aligned deployment action headers and the environments action column to match source behavior.
  - Verified local `deployments`, `environments`, and `memory-stores` action header alignment through Open Browser Use.

### Design Intent

The previous global right-align behavior was too broad. This change preserves the source-proven right alignment where needed while avoiding regressions on tables such as memory stores where the source leaves the blank action header left-aligned.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
