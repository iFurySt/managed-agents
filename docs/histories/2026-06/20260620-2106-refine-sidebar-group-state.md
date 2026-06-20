## [2026-06-20 21:06] | Task: refine sidebar group state parity

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone with OBU-driven one-to-one visual parity across the managed agent console pages.

### Changes Overview

- Area: Console frontend
- Key actions:
  - Matched sidebar group title weight to the active route state instead of hard-coding different weights by group.
  - Replaced the custom group chevron with the measured Anthropicons expand glyph and source-sized 12px icon metrics.

### Design Intent

Keep sidebar typography and disclosure controls consistent with source DOM measurements so list and detail pages inherit the same navigation parity.

### Files Modified

- `apps/console/src/App.tsx`
