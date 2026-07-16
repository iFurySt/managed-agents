## [2026-07-16 15:51] | Task: Add collapsed sidebar flyouts

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> In the collapsed left sidebar, hovering should reveal a readable flyout. Compare against the reference and update `DESIGN.md` as needed.
> Follow-up: prevent main table content from showing above/through the flyout.

### Changes Overview

- Area: console sidebar navigation
- Key actions:
  - Compared the reference collapsed sidebar behavior with Open Browser Use.
  - Added hover/focus flyouts for collapsed sidebar group icons.
  - Reused each group's child navigation labels and routes in the collapsed flyout.
  - Preserved active child row styling inside the flyout.
  - Raised the collapsed sidebar rail and flyout stacking layer so table rows and transformed content cannot paint over it.
  - Documented the collapsed sidebar flyout variant in the Claude Console design reference.

### Design Intent

Collapsed navigation still needs a readable path to nested sections without
requiring the user to permanently expand the whole sidebar. The reference uses a
group-level flyout: hovering a collapsed group icon opens a compact white panel
with the group title and its children. The local implementation follows that
pattern and keeps the active row treatment consistent with full sidebar items.
The flyout is intentionally opaque and elevated above page content; table rows
may create their own stacking contexts, so the collapsed rail needs an explicit
z-index rather than relying on DOM order.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`
- `docs/histories/2026-07/20260716-1551-collapsed-sidebar-flyouts.md`
