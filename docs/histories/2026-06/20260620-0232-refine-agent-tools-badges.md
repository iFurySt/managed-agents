## [2026-06-20 02:32] | Task: Refine agent tools badges

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and verified small milestones.

### Changes Overview

- Area: Console Agent detail MCPs and tools section.
- Key actions:
  - Used OBU to compare the source and local Agent detail MCPs and tools area.
  - Split the local combined `Tool permissions · 8` badge into separate `Tool permissions` and `8` badges.
  - Added source-like small icons for permission and allow-status chips using existing lucide icons.

### Design Intent

The source renders the permission label and value as distinct chips. Splitting the local badge preserves that hierarchy while keeping the current static agent detail data unchanged.

### Files Modified

- `apps/console/src/App.tsx`
