## [2026-06-21 01:16] | Task: Align collapsed sidebar rail

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console with OBU source comparisons; the sidebar collapse icon and sidebar details are visibly off.

### Changes Overview

- Area: Console collapsed sidebar.
- Key actions: Matched the collapsed rail width and icon x positions to source measurements, changed collapsed group entries from links to buttons, aligned non-active icon color, and wired source-like compact links for Dashboard, API keys, Documentation, and Credits.

### Design Intent

Source OBU inspection showed the collapsed rail is a compact navigation surface with 36px controls at x=6, group entries rendered as buttons, and non-active icons colored `#52514e`. The change keeps the existing expanded sidebar stable while tightening collapsed-state fidelity.

### Files Modified

- `apps/console/src/App.tsx`
