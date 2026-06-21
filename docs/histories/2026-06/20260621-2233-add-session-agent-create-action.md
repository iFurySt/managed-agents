# Add Session Agent Create Action

## Request

Continue source-driven convergence of the Claude Console managed agents clone.

## Changes

- Added the source-observed `Create new agent` footer action to the Create session agent picker.
- Reused the existing Create agent dialog and automatically selects the newly created agent for the pending session.
- Adjusted the picker viewport height so the footer matches the source popover structure instead of being clipped.

## Intent

Close a functional gap in a high-frequency nested workflow without adding a new abstraction or changing unrelated pickers.

## Files

- `apps/console/src/App.tsx`
