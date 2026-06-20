# Refine Sessions Table

## Request

- Continue OBU-guided Claude Console cloning across managed-agent pages.
- Carry the list-table parity work from Agents into Sessions.

## Changes

- Compared the source Sessions list and local Sessions list with Open Browser Use.
- Matched the Sessions `DataTable` wrapper position, padding, overflow, mask, and table border model to the source.
- Updated session ID copy controls to use the source copy glyph, gray color, 22px sizing, and hover-only visibility.
- Matched session name links to source 14px / 400-weight text.
- Replaced remaining lucide row/page glyphs in the Sessions list with the Claude console icon font glyphs.

## Files

- `apps/console/src/App.tsx`

## Verification

- Open Browser Use DOM/style check for local Sessions list after source comparison.
- `npm run build --workspace apps/console`
- `go test ./...`
