# Refine Agents Control Icons

## Request

Continue the OBU-guided Claude Console clone work by tightening visible icon parity on the Agents list controls.

## Changes

- Replaced the Agents search input icon with the source CDS glyph.
- Replaced Agents row copy icons with the source CDS glyph.
- Replaced Agents pagination arrows with source CDS glyphs.
- Replaced row overflow actions with the source CDS overflow glyph.
- Updated the shared `FieldSelect` chevron and default table action icon to use local CDS glyph rendering.

## Verification

- OBU compared source `/workspaces/default/agents` and local `/agents`.
- Source controls used `Anthropicons-Variable` glyphs: search ``, select chevron ``, copy ``, overflow ``, previous ``, next ``.
- Local controls now report the same glyphs, icon font, sizes, weights, and key rects.
- Local search and select chevrons now match the source muted icon color `rgb(137, 135, 129)`.
- `npm run build --workspace apps/console` passed.
- `go test ./...` passed.
