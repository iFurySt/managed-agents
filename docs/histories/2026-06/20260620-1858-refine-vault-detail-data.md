# Refine Vault Detail Data

## Request

Continue cloning the Claude Console managed-agents vault surfaces with OBU-backed
comparison and small verified milestones.

## Changes

- Updated seeded vault credentials to match the captured `test_secret` vault
  detail page: five rows, source-aligned labels, targets, last-used values, and
  row order.
- Changed vault credential preloading to `created_at asc` so detail pages render
  the source-aligned order consistently.
- Upserted seeded vaults and credentials on startup, and removed older seeded
  credential ids, so existing local development databases converge to the
  current reference data instead of staying stale.
- Allowed apiserver CORS for Vite's common fallback dev port `5174` in addition
  to `5173`.
- Added `whitespace-nowrap` to the CDS button base so compact action buttons
  such as `Add credential` do not wrap.

## Evidence

- OBU compared source and local vault detail pages at 2048x1200.
- OBU confirmed local detail rows now render `TEST`, `X_LEO_API`,
  `https://api.ifuryst.com/`, `https://gmail.mcp.claude.com/mcp`, and
  `X_LEO_KEY` in the same visible order as the source.
- OBU confirmed the vault action menu shape remains `Archive` and `Delete` with
  a 128px menu width.
- `npm run build --workspace apps/console`
- `go test ./...`
- `git diff --check`

## Files

- `apps/apiserver/main.go`
- `apps/console/src/components/cds.tsx`
