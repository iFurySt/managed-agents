## [2026-06-21 02:02] | Task: Align agents filter fields

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone and keep tightening visible typography,
> spacing, and component token differences with OBU comparisons.

### Changes Overview

- Area: console UI agents list filters.
- Key actions:
  - Re-sampled Claude Console and the local agents page with OBU for the search
    field and Created/Status select controls.
  - Added the source-style inset field ring to the local agents search field and
    filter select triggers.

### Design Intent

Claude Console field controls use a translucent field background plus a subtle
inset one-pixel ring. The local filters already matched size and position, so
this change keeps the geometry stable while bringing the field shell closer to
the source token.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-0202-align-agents-filter-fields.md`
