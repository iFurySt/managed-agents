## [2026-06-21 03:40] | Task: Align sidebar collapse glyph

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `codex-cli`

### User Query

> The Claude Console sidebar header still differs; the top title and collapse icon are visibly off.

### Changes Overview

- Area: Console sidebar header.
- Key actions: Replaced the Lucide sidebar panel icon with the matching Anthropicons `` glyph used by the source sidebar collapse and expand buttons.

### Design Intent

The sidebar title's computed serif font, size, line height, and weight already match the source sample. The visible mismatch came from rendering the collapse control with a generic SVG instead of the source icon font glyph. Reusing the same icon font keeps the expanded and collapsed sidebar affordances aligned with the rest of the cloned console chrome.

### Files Modified

- `apps/console/src/App.tsx`
