## [2026-06-22 02:40] | Task: Align collapsed sidebar link test ids

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue converging the Claude Console clone with OBU-based comparison, landing scoped verified milestones.

### Changes Overview

- Area: Console collapsed sidebar DOM parity
- Key actions:
  - Added source-aligned concise test ids to collapsed Dashboard and API keys links.
  - Added source-aligned concise test ids to collapsed Documentation and Credits links.
  - Preserved current link hrefs, accessibility labels, and geometry.

### Design Intent

Claude Console exposes stable selectors for collapsed sidebar links. Matching these test ids improves DOM fidelity and supports later parity checks while leaving the visual layout unchanged.

### Files Modified

- `apps/console/src/App.tsx`
