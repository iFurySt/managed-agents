# Refine Create Deployment Context

## Request

Continue cloning Claude Managed Agents console surfaces with OBU-backed, verified milestones.

## Changes

- Refined the Agent detail `Create deployment` dialog path using OBU evidence.
- Added optional scoped-agent context to the Create deployment dialog.
- When opened from an Agent detail page, the dialog now shows the agent name, a version picker label, and the agent's default debug environment instead of raw ID-only selectors.
- Added external-link icons and accessible "opens in new tab" labels to the dialog's View/Manage links.

## Design Notes

- Source evidence showed the Agent detail deployment CTA opens the same 520px dialog, but with Agent and Version displayed as a two-column scoped context row.
- The managed SSH agent path now preselects `managed-ssh-debug-env`, matching the source dialog while preserving the existing top-level Deployments create flow.

## Files

- `apps/console/src/App.tsx`
