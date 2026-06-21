# Add List Loading Skeletons

## Request

Continue converging the Claude Platform managed agents console clone with OBU evidence and small, verifiable UI improvements.

## Changes

- Added optional loading skeleton rows to the shared `DataTable` component.
- Connected loading skeletons to the Sessions and Environments list pages, matching the source pages observed through OBU while their data was loading.
- Preserved existing row rendering for all other tables by keeping the loading behavior opt-in.

## Files

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
