# Align Workspace Selector Chevron

## User Request
Continue converging the Claude Console clone quickly without expanding scope.

## Changes
- Replaced the hand-drawn workspace selector chevron with the same Anthropicons glyph used by the source console.
- Preserved the existing workspace selector layout, border, text, and icon positioning.

## Design Intent
OBU comparison showed the local workspace selector matched the source geometry, but the chevron was hand-rendered with borders instead of the source `` glyph. Using the same glyph removes a visible icon-shape mismatch without changing selector behavior or layout.

## Verification
- OBU verified the local workspace selector outer frame remained `x=12`, `y=56`, `w=231.5`, `h=32`.
- OBU verified the `Default` label remained `x=45`, `y=62`, `h=20`.
- OBU verified the chevron is now glyph `` with `x=216.5`, `y=64`, `w=16`, `h=16`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0147-align-workspace-selector-chevron.md`
