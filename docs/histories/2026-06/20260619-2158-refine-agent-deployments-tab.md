# Refine Agent Deployments Tab

## Request

Continue cloning the Claude Managed Agents console with OBU-backed, verified milestones.

## Changes

- Replaced the Agent detail `Deployments` dashed empty card with the source-matched empty CTA layout.
- Added an Agent detail deployment panel that loads deployments filtered to the current agent and renders a compact table when deployments exist.
- Wired the empty CTA to the existing Create deployment dialog.
- Added an optional `initialAgentId` to the Create deployment dialog so Agent detail can open it with the current agent preselected.

## Design Notes

- OBU evidence for the managed SSH agent showed the source tab has no deployments and displays an unframed centered empty state at the same tab-panel offset as the Sessions child tab.
- The empty state copy now matches the source: "No deployments" and "Deploy this agent to run it on a schedule, via webhook, or manually."
- Keeping the table path in the panel preserves useful behavior for agents that do have deployments without changing the top-level Deployments page.

## Files

- `apps/console/src/App.tsx`
