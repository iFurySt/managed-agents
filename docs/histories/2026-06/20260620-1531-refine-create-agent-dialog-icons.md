# Refine Create Agent Dialog Icons

## Request

Continue OBU-guided Claude Console clone work by tightening the Create agent dialog.

## Changes

- Replaced the shared dialog close marker with the source CDS close glyph.
- Replaced the Create agent dialog Starting point icon with the source chevron glyph.
- Replaced the Create agent dialog copy-code icon with the source copy glyph.
- Matched the Create agent dialog panel shadow to the source panel shadow.
- Added the source-style screen-reader editor hint for the YAML editor.

## Verification

- OBU opened source and local `/agents`, clicked `Create agent`, and compared dialog DOM/styles.
- Local close now reports ``, `Anthropicons-Variable`, `20px`, weight `433.25`.
- Local Starting point now reports ``, `Anthropicons-Variable`, `16px`, weight `533.25`, color `rgb(82, 81, 78)`.
- Local Copy code now reports ``, `Anthropicons-Variable`, `20px`, weight `433.25`.
- Local dialog now uses the same panel ring/shadow layers and contains the source `sr-only` editor hint.
- `npm run build --workspace apps/console` passed.
- `go test ./...` passed.
