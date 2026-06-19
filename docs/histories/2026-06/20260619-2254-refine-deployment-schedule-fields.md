## [2026-06-19 22:54] | Task: Refine deployment schedule fields

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source `Schedule` expansion after selecting the deployment trigger.
  - Reworked the local schedule section into the source-style rounded bordered panel.
  - Matched the two-column frequency/timezone/at layout, `9:00` time input, AM/PM segmented control, cron summary row, and nested `Next 5 runs` card.

### Design Intent

The schedule trigger reveals a substantial subform rather than a loose stack of fields. This pass keeps the existing deployment schedule payload while bringing the visible form structure closer to the captured Claude Platform dialog.

### Files Modified

- `apps/console/src/App.tsx`
