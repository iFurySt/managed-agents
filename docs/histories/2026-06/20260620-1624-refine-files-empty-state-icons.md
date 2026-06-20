# Refine Files Empty State Icons

## Request

- Continue OBU-guided Claude Console cloning across managed-agent console pages.
- Align the Files page empty state with the source console.

## Changes

- Compared the source Files page and local Files page with Open Browser Use.
- Confirmed the source Files page currently renders an empty state rather than a data table.
- Replaced lucide icons in the Files empty-state code block controls with Claude console icon font glyphs:
  - language chevron: ``
  - View docs external-link icon: ``
  - Copy code icon: ``

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for the local Files empty state after source comparison.
- `npm run build --workspace apps/console`
- `go test ./...`
