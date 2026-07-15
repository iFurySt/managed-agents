# Table Row Detail Navigation

## Summary

- Promoted the Agents full-row detail navigation behavior to all resource tables that have detail pages.
- Updated the shared table primitive so plain row content navigates while interactive controls keep their own behavior.

## Details

- `DataTable` now handles non-interactive row clicks through the shared component instead of relying on a first-cell link overlay.
- Row navigation ignores links, buttons, inputs, checkboxes, and explicit row-click opt-out targets.
- Added detail-row targets for Deployments, Environments, Vaults, Memory Stores, Files, Agent sessions, and Agent deployments.
- Left tables without detail routes, such as deployment runs and vault credentials, non-navigable.
- Updated the Claude Console design reference to describe the shared full-row navigation contract.

## Verification

- `npm --workspace apps/console run lint`
- `npm --workspace apps/console run build`
