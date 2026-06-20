## [2026-06-20 22:47] | Task: Refine sidebar header icon

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> The left sidebar top `Claude Console` wordmark still differs, and the sidebar collapse icon is not done.

### Changes Overview

- Area: Console global sidebar header.
- Key actions:
  - Removed the extra local scale and negative margin from the `Claude Console` product label while keeping the source-style `font-voice` 16px wordmark.
  - Replaced the CSS-drawn sidebar collapse panel with the matching Anthropicons `` glyph.
  - Verified both expanded and collapsed sidebar controls render the glyph through Open Browser Use computed-style checks.

### Design Intent

The sidebar header is visible on every cloned console surface. Matching the source wordmark treatment and using the same glyph system as the rest of the console removes a high-signal visual mismatch without widening the shared navigation abstraction.

### Verification

- Open Browser Use local check:
  - Expanded collapse icon: `Anthropicons-Variable`, `20px`, weight `433.25`, glyph ``.
  - Collapsed expand icon: `Anthropicons-Variable`, `20px`, weight `433.25`, glyph ``.
  - Product wordmark: `anthropicSerif` voice stack, `16px`, line-height `16px`, weight `550`.
- `npm run build --workspace apps/console`
- `go test ./...`

### Files Modified

- `apps/console/src/App.tsx`
