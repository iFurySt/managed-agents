# Refine Sidebar Collapse

## Request

Tighten the Claude Console clone sidebar after visual feedback that the top
branding, collapse icon area, and sidebar text/icon alignment still had visible
differences.

## Changes

- Matched the collapsed sidebar closer to source geometry: 48px width, a
  compact workspace cube control, and delayed nav icon start.
- Kept the managed-agents icon highlighted in collapsed mode for managed-agent
  routes such as vaults, environments, deployments, sessions, and agents.
- Replaced the workspace selector drawing with the Anthropic icon glyph used by
  the rest of the console clone.
- Replaced group disclosure glyph rendering with a stable CSS down chevron.
- Adjusted sidebar item badge layout so the Deployments `New` badge sits next
  to the label instead of being pushed to the far right.

## Evidence

- OBU compared source and local `/vaults` sidebars at 2048x1200.
- OBU screenshots confirmed expanded sidebar badge/chevron/cube changes and
  collapsed sidebar workspace/active state.
- `npm run build --workspace apps/console`
- `go test ./...`
- `git diff --check`

## Files

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
