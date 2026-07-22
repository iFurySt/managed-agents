## [2026-07-22 00:24] | Task: Align session detail UI with Claude Console reference

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local development workspace`

### User Query

> Commit and push, then align the local session detail page UI/UX with the Claude Console reference, including button borders, Debug controls, and the bottom input. Update `DESIGN.md` if needed.

### Changes Overview

- Area: Console session detail page.
- Key actions:
  - Changed the session detail `Actions` trigger from a bordered secondary button to a transparent ghost button matching the reference.
  - Reworked the transcript toolbar filter and icon buttons to use borderless, hover-fill controls.
  - Removed the extra bordered card from the Debug panel so it shares the transcript surface treatment.
  - Tightened the bottom session message composer to 32px controls with an inset input ring.
  - Updated the Claude Console design reference with the corrected session detail control specs.

### Design Intent

The reference page uses lightweight controls with subtle hover feedback rather than visible secondary-button chrome in the session transcript toolbar. This change keeps that behavior scoped to the session detail page so shared list, editor, and dialog buttons do not unexpectedly change.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`

### Follow-up: Reference chip reuse

- Added a shared `ReferenceChip` component backed by the existing Copy/Copied tooltip behavior.
- Replaced the hand-rolled session detail agent/environment controls with `ReferenceChip`.
- Reused the same component for sessions table agent cells, deployments table agent cells, and deployment detail reference tokens.
- Added a shared boxed `ActionsMenuTrigger` for the session detail text Actions dropdown trigger so its ring/fill style is no longer open-coded in the dropdown component.
