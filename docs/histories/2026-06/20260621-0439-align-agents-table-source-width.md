## [2026-06-21 04:39] | Task: Align Agents table source width

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue using OBU to compare Claude Console pages and converge the local managed-agents clone one section at a time.

### Changes Overview

- Area: Console Agents list
- Key actions:
  - Matched the Agents table fixed column widths to the source Claude Console layout.
  - Removed the medium-viewport compact table profile.
  - Set the Agents table minimum width to the measured source width of `1106px`.

### Design Intent

The compact Agents table kept the row actions visible in the expanded-sidebar viewport, but OBU comparison showed Claude Console uses a wider horizontally scrollable table at the same viewport. This change favors visual fidelity: the local table now matches the source column widths and action-column position while preserving the existing scroll container.

### Files Modified

- `apps/console/src/App.tsx`
