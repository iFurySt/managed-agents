## [2026-06-22 02:25] | Task: Align sidebar test ids

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, landing scoped verified milestones.

### Changes Overview

- Area: Console sidebar DOM parity
- Key actions:
  - Added source-aligned `data-testid` values to Build and Managed Agents child navigation links.
  - Extended the shared `SidebarItem` component to accept an optional test id.
  - Verified the added attributes without changing hrefs, row geometry, or visual styling.

### Design Intent

Claude Console exposes stable test ids on sidebar child links. Adding the same DOM semantics improves fidelity and gives later automated checks stable selectors while keeping this convergence step visually neutral.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
