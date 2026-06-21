## [2026-06-22 05:12] | Task: Align deployment filter chevrons

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local`

### User Query

> Continue converging the Claude Console clone with focused, verified fixes.

### Changes Overview

- Area: Deployments page filter controls.
- Key actions:
  - Compared Claude Console and local Deployments top filter controls with Open Browser Use and CDP.
  - Replaced the deployment filter lucide chevron with the Anthropic-style `` glyph.
  - Removed the extra left margin around the Status filter so it aligns with the source spacing.

### Design Intent

The source Deployments filters render as compact CDS comboboxes with the ``
glyph and only the parent row gap controlling horizontal spacing. This change
keeps the local filter controls visually consistent with that source pattern
without changing filtering behavior.

### Files Modified

- `apps/console/src/App.tsx`
