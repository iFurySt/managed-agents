# Refine Deployment Actions Edit

## Request

Continue one-by-one Claude Platform managed agents cloning work with OBU evidence, small verified milestones, and commit/push after each milestone.

## Changes

- Matched the Deployments table row actions menu to source behavior for a paused deployment: `Resume`, `Edit`, and `Archive` only.
- Tuned the actions menu to the captured source geometry: 28px row action trigger, 128px menu width, 104px menu height, and 32px menu items.
- Added an edit deployment path from the deployments list, deployment detail header, and agent deployments panel.
- Reused the deployment form for edit mode with the source title, description, locked current agent display, `Save` button, and edit-height dialog layout.
- Added `PATCH /api/deployments/:id` in `apiserver` and a frontend `updateDeployment` client so edit saves update the persisted deployment record.
- Initialized edit schedule fields from the deployment cron expression so `0 1 * * *` appears as `Custom cron` with the same next-run preview captured from source.

## Evidence

- Source OBU capture: paused row actions menu rendered `Resume / Edit / Archive` in a 128x104 menu with 32px items.
- Source OBU capture: `Edit` opens a 520x751 dialog at y=16 with `Edit deployment`, locked agent/version fields, `Custom cron`, and 1:00 AM next-run previews.
- Local OBU verification: actions trigger is 28x28, menu is 128x104 with `Resume / Edit / Archive`, and edit dialog is 520x751 at y=16 with matching custom cron content.

## Verification

- `npm run build:console`
- `go test ./...`
- `git diff --check`
