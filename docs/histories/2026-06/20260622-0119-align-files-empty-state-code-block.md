# Align Files Empty State Code Block

## User Request

Continue converging the Claude Console clone quickly while avoiding broad new scope.

## Changes

- Matched the Files empty-state wrapper to the source layout with a vertical flex stack and `gap-3`.
- Changed the upload template code block background from the local fill token to the source-style 5% black tint.
- Kept the existing language menu, documentation link, copy action, and code template behavior unchanged.

## Design Intent

OBU comparisons showed the Files empty state already matched the source dimensions, but the code block background token differed. The local code now preserves the source coordinates while using the same visual tint.

## Verification

- OBU verified local Files empty-state wrapper `y=100`, code block `y=132`, width `952`, height `207.875`.
- OBU verified local code block background is `rgba(0, 0, 0, 0.05)`.
- `npm --workspace apps/console run lint`
- `VITE_API_BASE=http://127.0.0.1:8080 npm --workspace apps/console run build`

## Files Touched

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0119-align-files-empty-state-code-block.md`
