# Wire Deployment Cron Payload

## Request

Continue cloning Claude Managed Agents console behavior with OBU-backed, verified milestones.

## Changes

- Wired the Create deployment custom cron input into the deployment create payload.
- Reset the schedule expression after successful create.
- Added a shared deployment trigger label helper so deployment tables display custom cron schedules instead of a fixed daily label.

## Design Notes

- OBU evidence showed the source custom cron field is editable and retains custom input in the dialog.
- Local verification created a deployment through the UI and confirmed the API returned the custom cron schedule.
- The temporary local test deployment was removed after verification so the Agent detail Deployments tab returns to the source-matched empty state.

## Files

- `apps/console/src/App.tsx`
