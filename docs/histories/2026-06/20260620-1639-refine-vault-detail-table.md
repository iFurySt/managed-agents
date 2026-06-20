## [2026-06-20 16:39] | Task: Refine vault detail table

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue comparing the Claude Console managed-agents clone against the source UI, with attention to visible font, icon, and spacing mismatches.

### Changes Overview

- Area: Console vault detail page and apiserver demo data.
- Key actions:
  - Aligned the vault detail credential table with the source `DataTable` wrapper, separated table borders, nowrap text, and masked horizontal overflow.
  - Replaced vault detail copy, add credential, and pagination lucide icons with source-style Anthropicons glyphs.
  - Hid copy affordances until row/header hover to match the source interaction style.
  - Adjusted the vault detail status filter spacing to match captured source coordinates.
  - Added a fifth seeded vault credential so the demo detail page matches the source row count.

### Design Intent

The detail page should reuse the same source-aligned table and icon treatment already applied to the list pages, avoiding a separate visual language on drill-down surfaces. The seed row keeps pagination and table height comparable to the captured source state without changing runtime behavior.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/apiserver/main.go`
