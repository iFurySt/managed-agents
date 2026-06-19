# Refine Deployment Trigger Schedule

## Request

Continue cloning Claude Managed Agents console surfaces with OBU-backed, verified milestones.

## Changes

- Replaced the Create deployment trigger select with a source-style trigger picker.
- Added rich Manual and Schedule options with short descriptions.
- Added the Schedule configuration panel with Frequency, Timezone, At, cron expression, Edit cron, and Next 5 runs preview.
- Updated scheduled deployment creation to submit the displayed weekday cron expression.

## Design Notes

- OBU evidence showed the source trigger menu has two 44px options: Manual and Schedule, each with a description.
- Selecting Schedule reveals schedule-specific controls and a five-run preview in the same create dialog.
- The implementation keeps the new trigger picker local to the deployment dialog so existing shared select behavior is unchanged.

## Files

- `apps/console/src/App.tsx`
