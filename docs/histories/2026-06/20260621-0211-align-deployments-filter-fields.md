## [2026-06-21 02:11] | Task: Align deployments filter fields

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone and keep tightening visible component token
> differences with OBU comparisons.

### Changes Overview

- Area: console UI deployments list filters.
- Key actions:
  - Sampled the live Claude Console deployments page and local deployments page
    with OBU for search and filter field shells.
  - Added the source-style inset field ring to the deployments search field.
  - Added the same field ring to the custom deployment filter select shell
    while keeping the trigger button transparent.
  - Moved `data-cds="TextInput"` to the search field shell to better match the
    source DOM shape.

### Design Intent

Deployments uses the same translucent field shell and one-pixel inset ring as
the agents and sessions filters. This change preserves filter geometry and
interaction behavior while bringing the visible field token closer to Claude
Console.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-0211-align-deployments-filter-fields.md`
