## [2026-06-21 01:36] | Task: Align credential actions menu

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local cli`

### User Query

> Continue cloning Claude Console one interaction at a time with OBU comparisons and small verified pushes.

### Changes Overview

- Area: Console Credential vault detail credential actions menu.
- Key actions: Updated the credential-level row actions menu shell to the cloned CDS menu token: 160px width, 12px radius, source-style ring and shadow, 8px item radius, and source-like item padding.

### Design Intent

The credential menu keeps its existing actions (`Copy ID`, `Archive`, `Delete`) and separator. This change removes the older `rounded-cds` / bordered `shadow-lg` shell so vault detail row actions visually match the other cloned Claude Console menus.

### Files Modified

- `apps/console/src/App.tsx`
