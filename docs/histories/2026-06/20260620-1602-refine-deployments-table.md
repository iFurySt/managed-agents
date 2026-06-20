# Refine Deployments Table

## Request

- Continue OBU-guided Claude Console cloning across the managed-agent console pages.
- Carry the list-table parity pattern into Deployments.

## Changes

- Compared the source Deployments list and local Deployments list with Open Browser Use.
- Matched Deployments table overflow, fade mask, separate border model, and nowrap table text.
- Updated deployment ID copy controls to use the source copy glyph, gray color, 22px sizing, and hover-only visibility.
- Matched deployment name links to source 14px / 400-weight text.
- Replaced remaining lucide row/page glyphs in the Deployments list with Claude console icon font glyphs.

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for source and local Deployments list.
- `npm run build --workspace apps/console`
- `go test ./...`
