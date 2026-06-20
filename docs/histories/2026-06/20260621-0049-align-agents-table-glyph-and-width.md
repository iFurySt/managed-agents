## [2026-06-21 00:49] | Task: Align agents table glyph and width

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning the Claude Console managed-agent pages with OBU-driven visual comparisons and small verified milestones.

### Changes Overview

- Area: Console DataTable and Agents list.
- Key actions:
  - Compared the source and local Agents table with OBU DOM and computed-style sampling.
  - Replaced the blank selection cells in the shared DataTable with the source-style `` glyph.
  - Set the Agents table to preserve the source column-width sum with horizontal overflow.
  - Fixed the Agents table `Name` column at 310px so long names do not collapse in narrow viewports.

### Design Intent

Claude Console keeps table column geometry stable and uses a small glyph in the leading table column rather than rendering an empty checkbox slot. Matching that behavior makes the list read closer to the source and avoids compressing high-value name cells when the viewport is tight.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
