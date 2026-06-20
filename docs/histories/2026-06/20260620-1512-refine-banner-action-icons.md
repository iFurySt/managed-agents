# Refine Banner Action Icons

## Request

Continue one-by-one Claude Console visual parity work using OBU evidence, focusing on visible icon/font mismatches.

## Changes

- Added a reusable `CdsIconGlyph` helper for source-style `data-cds="Icon"` glyph rendering.
- Reused the helper from `SidebarGlyph` so CDS glyphs share one implementation.
- Replaced the top banner info and dismiss SVG icons with source glyphs.
- Replaced list page header create and documentation action icons with source glyphs across agents, sessions, deployments, environments, credential vaults, memory stores, files, and skills.
- Matched source-style primary header button padding for the affected create actions.

## Verification

- OBU compared source `/workspaces/default/agents` and local `/agents`.
- Source banner icons were `` and ``, `Anthropicons-Variable`, `20px`, weight `433.25`, rect `20x20`.
- Local banner icons now match the same glyphs, font, size, weight, and rects.
- Source create action text was `Create agent`; local now reports `Create agent` with `Anthropicons-Variable`, `20px`, weight `566.5`.
- Source documentation action was ``; local now reports `` with `Anthropicons-Variable`, `20px`, weight `433.25`.
- `npm run build --workspace apps/console` passed. Full `go test ./...` was blocked by an unrelated dirty `apps/orchestrator/main.go` compile failure in the working tree.
