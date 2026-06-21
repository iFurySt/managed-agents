## [2026-06-22 06:55] | Task: Align deployment picker icons

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue converging the Claude Console clone quickly, avoid further expansion, and focus on visible parity now that functionality is mostly in place.

### Changes Overview

- Area: Console create-deployment dialog.
- Key actions: Replaced the deployment dialog picker trigger SVG chevrons and add icons with Anthropicons glyphs, and adjusted trigger text layout so combobox icon positions match the Claude Console source capture.

### Design Intent

This keeps the final convergence pass scoped to a source-proven visual mismatch. The create-deployment dialog already matched sizing and functional behavior, so the change only updates the trigger internals to use the same icon font, text wrapping, and right-edge chevron placement as the source UI.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260622-0655-align-deployment-picker-icons.md`
