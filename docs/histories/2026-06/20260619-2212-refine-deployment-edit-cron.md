# Refine Deployment Edit Cron

## Request

Continue cloning Claude Managed Agents console surfaces with OBU-backed, verified milestones.

## Changes

- Added the Create deployment schedule `Edit cron` interaction.
- Switching to custom cron now updates Frequency to `Custom cron`.
- Replaces the simple At row with a Cron expression input and helper copy.
- Keeps the next-run preview visible below the cron editor.

## Design Notes

- OBU evidence showed the source dialog converts the weekday schedule panel into a custom cron editor after `Edit cron`.
- The first implementation keeps the cron expression local to the dialog UI while preserving the submitted weekday expression already used for scheduled deployments.

## Files

- `apps/console/src/App.tsx`
