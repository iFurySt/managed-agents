# Refine Skills Version Icon

## Request

- Continue OBU-guided Claude Console cloning across managed-agent console pages.
- Align the Skills list with the source console.

## Changes

- Compared the source Skills list and local Skills list with Open Browser Use.
- Matched the visible version-history control in each skill row:
  - replaced the lucide clock with the Claude console `` icon font glyph
  - made the button visible by default like the source
  - preserved the existing version history dialog behavior

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for the local Skills list after source comparison.
- `npm run build --workspace apps/console`
- `go test ./...`
