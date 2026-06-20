## [2026-06-21 04:32] | Task: Align DataTable selection boxes

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue using OBU comparisons to converge obvious Claude Console visual mismatches.

### Changes Overview

- Area: Console CDS DataTable
- Key actions:
  - Replaced the selection-column glyph with an empty checkbox-style box.
  - Centered the 16px selection box inside the 40px table selection column.
  - Matched the Claude Console checkbox border color, 1px stroke, and 4px radius.

### Design Intent

The local DataTable rendered the selection glyph as a checkmark, while Claude Console shows an empty rounded checkbox in unselected rows. A CSS box avoids depending on local icon-font codepoint mapping and keeps every DataTable selection cell visually aligned with the source UI.

### Files Modified

- `apps/console/src/components/cds.tsx`
