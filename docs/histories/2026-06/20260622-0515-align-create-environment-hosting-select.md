## [2026-06-22 05:15] | Task: Align create environment hosting select

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local`

### User Query

> Continue converging the Claude Console clone with focused, verified UI fixes.

### Changes Overview

- Area: Create environment dialog.
- Key actions:
  - Compared the source and local Create environment dialogs with Open Browser Use and CDP.
  - Changed the Hosting type select to use an outer field shell with an inner transparent trigger.
  - Verified the local `Cloud` trigger now matches the source structure: transparent button, 8px left padding, and narrowed inner width.

### Design Intent

The source dialog renders the Hosting type select as a CDS field shell whose
button is transparent. The local trigger previously carried the white field
background, rounded corners, and inset ring directly on the button, which made
the select read heavier than the source. Moving those visuals to the wrapper
matches the source pattern without changing behavior.

### Files Modified

- `apps/console/src/App.tsx`
