## [2026-06-20 02:22] | Task: Refine button transition shadow

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and verified small milestones.

### Changes Overview

- Area: Console CDS Button primitive.
- Key actions:
  - Rechecked the local Create agent Generate button with OBU after the previous Generate action milestone.
  - Confirmed the enabled button still rendered at opacity `0.5` because the local Button used all-property `transition`, leaving an opacity transition stuck at the disabled value.
  - Sampled the source Generate button and confirmed it uses `transition-shadow` with `box-shadow` as the transition property.
  - Changed the shared local Button primitive to `transition-shadow` so disabled opacity is immediate and enabled opacity returns to `1`.

### Design Intent

Claude Console buttons animate focus/shadow affordances rather than all visual properties. Matching that behavior removes a local opacity artifact and keeps the shared Button primitive closer to the source CDS button.

### Files Modified

- `apps/console/src/components/cds.tsx`
