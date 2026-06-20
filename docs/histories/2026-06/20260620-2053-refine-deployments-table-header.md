## [2026-06-20 20:53] | Task: Refine Deployments table and header

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local-cli`

### User Query

> Continue one-by-one Claude Console parity work with OBU source/local comparison.

### Changes Overview

- Area: Console UI
- Key actions:
  - Added the Deployments header documentation icon button.
  - Matched the Deployments table wrapper width to the source capture while preserving the wider inner table.
  - Updated paused deployment badges to the source warning color.
  - Restyled deployment agent references as bordered pills with a separate compact version tag.

### Design Intent

The source Deployments page uses the same header action pattern as adjacent Managed Agents pages and keeps the row agent reference visually separate from its version. The local page had the documentation action missing, a wrapper width mismatch, a neutral paused badge, and an overly heavy agent button. The changes align those elements with the captured source DOM geometry and styles.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
