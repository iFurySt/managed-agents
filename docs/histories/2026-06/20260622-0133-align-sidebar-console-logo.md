# Align Sidebar Console Logo

## User Request
Continue converging the Claude Console clone quickly, with attention to visible sidebar differences such as the top `Claude Console` wordmark and collapse icon.

## Changes
- Matched the sidebar `Claude Console` title to the source wordmark spacing and OpenType settings.
- Kept the existing collapse and expand sidebar controls unchanged after verifying their glyph, size, and placement against the source.

## Design Intent
OBU comparison showed the source title uses the same 16px serif font but applies a `-0.1em` left offset plus `ss01` and `dlig` font features. The local title now uses the same settings without changing the surrounding sidebar layout.

## Verification
- OBU verified the local sidebar title now matches the source title geometry: `x=18.40625`, `y=18`, `w=120.7734375`, `h=16`.
- OBU verified the local title keeps `fontSize: 16px`, `fontWeight: 550`, `lineHeight: 16px`, `fontOpticalSizing: auto`, and `fontFeatureSettings` including `ss01` and `dlig`.
- OBU verified the collapse button remains `28x28` at `x=215.5`, `y=13` with glyph ``.
- OBU verified collapsing the sidebar shows the expand button at `x=8`, `y=12`, `28x28` with glyph ``.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0133-align-sidebar-console-logo.md`
