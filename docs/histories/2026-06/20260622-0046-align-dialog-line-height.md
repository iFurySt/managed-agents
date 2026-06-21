## [2026-06-22 00:46] | Task: Align dialog line height

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue using OBU to compare the Claude Console clone against source pages
> and converge small visual fidelity differences.

### Changes Overview

- Area: Shared console dialog component.
- Key actions:
  - Added the source dialog default `text-sm leading-5 text-ink` token to
    `ConsoleDialog` content.
  - Verified the Create vault dialog with OBU after rebuilding.

### Design Intent

The source Create vault dialog computes to 14px text with 20px line height.
The local dialog inherited the page body's 21px line height. Setting the shared
dialog content token keeps modal body text aligned with the source while
leaving page-level typography unchanged.

### Files Modified

- `apps/console/src/components/cds.tsx`
