# Refine Vaults Table

## Request

- Continue OBU-guided Claude Console cloning across managed-agent console pages.
- Carry the list-table parity pattern into Credential vaults.

## Changes

- Compared the source Credential vaults list and local Vaults list with Open Browser Use.
- Matched Vaults table overflow, fade mask, separate border model, and nowrap table text.
- Updated vault ID copy controls to use the source copy glyph, gray color, 22px sizing, and hover-only visibility.
- Matched vault name links to source 14px / 400-weight text.
- Replaced remaining lucide pagination glyphs in the Vaults list with Claude console icon font glyphs.

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for source and local Vaults list.
- `npm run build --workspace apps/console`
- `go test ./...`
