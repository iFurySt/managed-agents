# Refine Agent Sessions Tab

## Request

Continue cloning the Claude Managed Agents console one module at a time, using OBU evidence and committing each verified milestone.

## Changes

- Replaced the Agent detail `Sessions` empty state with a Claude Console-style child tab panel.
- Added URL-backed Agent detail tabs so `/agents/:id?tab=sessions` opens the Sessions child tab directly.
- Added agent-filtered session loading, source-matched filters for Created, Version, Deployment, and Status, and a compact table with ID, Name, Status, Version, and Created columns.
- Kept row copy, detail navigation, status badge, and session row actions aligned with the existing Sessions page behavior.

## Design Notes

- OBU source evidence showed the Agent detail Sessions tab uses filter controls and a DataTable rather than an empty state.
- The local seeded data already includes the same two sessions for the managed SSH agent, so the child tab now demonstrates the intended relationship without backend changes.
- Session version is displayed from the current agent version because session records do not yet expose a dedicated version field.

## Files

- `apps/console/src/App.tsx`
