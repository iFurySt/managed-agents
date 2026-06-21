## [2026-06-22 03:39] | Task: Align sidebar active aria

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge the Claude Console clone and keep closing visible/sidebar parity gaps.

### Changes Overview

- Area: Console sidebar navigation.
- Key actions:
  - Added `aria-current="page"` to active `SidebarItem` links.
  - Verified the active `Agents` child item exposes `aria-current="page"` while inactive sibling links do not.
  - Ran console lint and build.

### Design Intent

The source console marks active child navigation links with `aria-current="page"`. Matching this improves DOM/accessibility parity without changing visual layout or routing behavior.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260622-0339-align-sidebar-active-aria.md`
