## [2026-06-19 23:18] | Task: Refine deployment weekly day picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured the source weekly schedule `On` combobox with OBU, including option order, popup dimensions, selected state, and cron behavior.
  - Replaced the local static Monday field with an interactive CDS-style weekday picker.
  - Wired weekday selection into weekly cron generation and next-run preview dates.

### Design Intent

Weekly schedules should be configurable through the same user-facing controls as the source console. This pass keeps the picker local and explicit while matching the source menu shape and behavior where Tuesday maps to `0 9 * * 2` and Tuesday next-run dates.

### Files Modified

- `apps/console/src/App.tsx`
