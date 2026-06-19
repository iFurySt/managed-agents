## [2026-06-19 23:14] | Task: Refine deployment time control

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source scheduled deployment `At` control with OBU, including text input sizing, AM/PM segmented radio state, and cron updates.
  - Made the local schedule time input editable instead of read-only.
  - Wired time and AM/PM changes into cron expression generation and next-run preview text for daily, weekday, and weekly schedules.

### Design Intent

The scheduled deployment form should generate the cron expression from user-facing controls. This pass keeps the local implementation explicit and predictable while matching the source control behavior where switching PM changes `9:00 AM` weekday cron from `0 9 * * 1-5` to the corresponding 24-hour value.

### Files Modified

- `apps/console/src/App.tsx`
