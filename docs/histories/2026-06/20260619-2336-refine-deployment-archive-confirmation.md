# Refine Deployment Archive Confirmation

## Request

Continue cloning Claude Platform managed agents surfaces with OBU evidence, including actions, dialogs, and small verified milestones.

## Changes

- Changed deployment row, detail, and agent-panel archive actions to open a confirmation dialog before archiving.
- Added a source-matched `DeploymentArchiveDialog` with `data-cds="ConfirmationDialog"` and `role="alertdialog"`.
- Matched the source confirmation copy: `Archive deployment?` and `Archived deployments stop firing scheduled runs. Run history is kept.`
- Matched the confirmation button set and layout with `Cancel` and danger `Archive` actions.

## Evidence

- Source OBU capture: Archive menu item opens a `data-cds="ConfirmationDialog"` alertdialog at about 510x139 with `Cancel` and `Archive` buttons.
- Local OBU verification: the confirmation dialog renders at 510x138 with the same title, description, button labels, and centered placement.

## Verification

- `npm run build:console`
- `go test ./...`
- `git diff --check`
