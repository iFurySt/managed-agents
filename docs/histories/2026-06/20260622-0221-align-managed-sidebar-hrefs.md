## [2026-06-22 02:21] | Task: Align Managed Agents sidebar hrefs

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison and land verified, scoped milestones.

### Changes Overview

- Area: Console sidebar navigation
- Key actions:
  - Matched Managed Agents child links to Claude Console workspace-prefixed hrefs.
  - Kept workspace redirect behavior so linked routes still resolve to the implemented local pages.
  - Updated sidebar active-state matching so redirected short routes remain highlighted.

### Design Intent

The source console exposes managed-agent sections under `/workspaces/default/...`. This change aligns link semantics without changing the local page implementations or expanding the work beyond navigation parity.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
