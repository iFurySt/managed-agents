## [2026-06-20 22:19] | Task: Refine sidebar header fidelity

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Tighten Claude Console sidebar fidelity, especially the top product label, collapse icon, and visible font/size mismatch between the sidebar and main content.

### Changes Overview

- Area: Console sidebar UI fidelity.
- Key actions:
  - Reduced the expanded sidebar width to better match the Claude Console layout.
  - Switched the product label to the wider `font-voice` stack and added `data-cds="ProductLogo"`.
  - Replaced the private collapse glyph with a CSS-drawn panel icon so the control renders consistently.

### Design Intent

The sidebar header is a first-viewport fidelity anchor. This change keeps the implementation in local React/Tailwind components while matching the source console's visible typography and panel control more closely.

### Files Modified

- `apps/console/src/App.tsx`
