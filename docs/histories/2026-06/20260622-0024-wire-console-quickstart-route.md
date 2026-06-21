## [2026-06-22 00:24] | Task: Wire console quickstart route

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Managed Agents console clone against the Claude Platform pages, preserving source-like navigation behavior where possible.

### Changes Overview

- Area: console sidebar navigation
- Key actions:
  - Added a local `/agent-quickstart` route and route title.
  - Changed the Managed Agents sidebar `Quickstart` item from inert text to a normal navigable sidebar item.
  - Kept the existing Deployments `New` badge behavior through the shared `SidebarItem` component.

### Design Intent

The source sidebar exposes Quickstart as a navigable Managed Agents entry. The local expanded sidebar previously rendered it as a non-clickable text row, making the navigation surface feel incomplete. This change keeps the fix local to the console UI and avoids new backend surface area.

### Files Modified

- `apps/console/src/App.tsx`
