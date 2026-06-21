## [2026-06-22 05:02] | Task: Align data table body row height

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local`

### User Query

> Continue converging the Claude Console clone quickly, focusing on visible fidelity without expanding scope.

### Changes Overview

- Area: Shared console data table styling.
- Key actions:
  - Compared Claude Console and local Sessions tables with Open Browser Use and CDP.
  - Adjusted body row sizing so the first body row renders at 46px and subsequent rows render at 45px.
  - Added the source-style top border on first body-row cells.

### Design Intent

The source table uses a denser row rhythm after the first body row. Matching this
in the shared `DataTable` improves visual fidelity across table-heavy console
surfaces without changing product behavior or page-specific data.

### Files Modified

- `apps/console/src/components/cds.tsx`
