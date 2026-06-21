# Align Sidebar Group Defaults

## Request

Continue the Claude Console clone convergence using source evidence while keeping changes narrow.

## Changes

- Matched the source sidebar default state for the `Analytics` and `Claude Code` groups.
- Removed the extra collapsed-group bottom margin so collapsed sidebar groups keep the source 40px vertical rhythm.
- Kept `Build`, `Managed Agents`, and `Manage` behavior unchanged.

## Intent

Reduce visible sidebar layout drift by aligning the default expanded and collapsed group states observed in the source console.

## Files

- `apps/console/src/App.tsx`
