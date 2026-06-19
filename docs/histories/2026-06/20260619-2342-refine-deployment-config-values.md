# Refine Deployment Config Values

## Request

Continue cloning Claude Platform managed agents surfaces with OBU evidence, including deployment detail child pages and small verified milestones.

## Changes

- Restyled deployment detail `Schedule` and `Initial message` values to match the source value container.
- Added the source-like shallow value row treatment: 792px row, 8px/12px padding, 6px radius, half-pixel border, and `#f9f9f7` background.
- Matched the value text treatment with monospace 12px text and wrapping/break behavior.
- Matched the source copy action as a 22px icon button that appears on value-row hover or focus.

## Evidence

- Source OBU capture: both value rows use `group/value flex items-start gap-2 rounded-md border-0.5 bg-bg-200 px-3 py-2`; schedule row is 792x35 and initial-message row is 792x49.
- Local OBU verification: local rows now render at 792px wide with 8px/12px padding, 6px radius, `rgb(249, 249, 247)` background, 12px monospace pre text, and 22px copy buttons.

## Verification

- `npm run build:console`
- `go test ./...`
- `git diff --check`
