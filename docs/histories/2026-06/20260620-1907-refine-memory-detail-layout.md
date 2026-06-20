# Refine Memory Detail Layout

## Request

Continue cloning Claude Console managed-agents pages with OBU evidence, focusing
on subpages and nested surfaces.

## Changes

- Let memory-store detail routes use the full available main content width
  instead of the generic centered `1600px` page shell.
- Changed the memory file tree to render source-like folder rows and show only
  the currently selected memory under its folder.
- Added a folder label helper so the seeded `/test123` memory appears under the
  `test` folder like the captured source page.
- Upserted seeded memory stores and memory records on apiserver startup so
  existing local Postgres data converges to the current reference state.
- Updated the seeded `world cup` memory store created label to `4 days ago`,
  matching the source detail header.

## Evidence

- OBU compared source and local memory store detail pages at 2048x1200.
- OBU screenshots confirmed the local detail page now starts at the source-like
  x-position, fills the main region, and renders `daily-reports`, `test`, and
  selected `test123` in the file tree.
- `GET /api/memory-stores/memstore_01GToktzJyefFL2DVxmgyT5e` returned
  `createdLabel: "4 days ago"` and the expected seeded memories.
- `npm run build --workspace apps/console`
- `go test ./...`
- `git diff --check`

## Files

- `apps/console/src/App.tsx`
- `apps/apiserver/main.go`
