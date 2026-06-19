## [2026-06-19 22:57] | Task: Refine deployment cron editor

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source `Edit cron` state inside the scheduled deployment form.
  - Tuned the local schedule panel to match the source 0.5px borders and nested `Next 5 runs` card height.
  - Matched the source custom cron state with a `Custom cron` frequency selector, full-width cron expression input, helper text, and unchanged next-run preview card.

### Design Intent

The scheduled deployment flow has two states: a friendly weekday/time editor and a custom cron editor. This pass keeps the same schedule payload while making the custom cron state match the observed Claude Platform form structure and dimensions.

### Files Modified

- `apps/console/src/App.tsx`
