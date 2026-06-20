# Refine Sidebar Width

- Compared Claude Console and local Sessions pages with Open Browser Use at a 2048px viewport.
- Restored the expanded sidebar width to 256px so Sessions page content starts at the same x=376 position as the source.
- Restored the slight Claude Console brand text offset so the brand and collapse button match the source header geometry.
- Verified with Open Browser Use DOM geometry checks, `npm run build --workspace apps/console`, and `go test ./...`.
