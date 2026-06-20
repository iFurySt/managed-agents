# Refine Agent Detail Icons

## Request

Continue OBU-guided Claude Console clone work by tightening the Agent detail page.

## Changes

- Replaced the Agent detail header copy icon with the source CDS copy glyph.
- Replaced the Edit action icon with the source CDS edit glyph.
- Replaced the System prompt copy icon with the source CDS copy glyph.
- Replaced MCP/tool area icons with source-style CDS glyphs for built-in tools, tool permissions, and always-allow state.

## Verification

- OBU compared source and local `/agents/agent_013mi1SmR2hJ6Hk6wNTeJvF9`.
- Source body text showed detail glyphs ``, ``, ``, ``, and ``.
- Local detail now reports the same glyphs with `Anthropicons-Variable` for header copy, edit, system prompt copy, built-in tools, tool permissions, and always allow.
- `npm run build --workspace apps/console` passed.
- `go test ./...` passed.
