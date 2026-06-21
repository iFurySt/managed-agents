## [2026-06-21 22:59] | Task: Align console content width

### Request

Continue converging the Claude Console clone quickly and focus only on obvious visible differences.

### Changes

- Re-sampled the live Claude Platform `/agents` page and the local console at a 2048x1200 viewport with Open Browser Use.
- Removed centering from the shared console content shell so list pages anchor to the left edge like the source console.
- Reduced the shell horizontal padding and capped the content width at 1584px, matching the source Agents page table geometry.

### Intent

The local console content was visibly shifted right on wide viewports. This adjustment keeps the existing page structure and features intact while aligning the high-level shell geometry with the source.

### Validation

- Source sample: H1 x=272, DataTable x=264/w=1568, table x=272/w=1552.
- Local sample after the change: H1 x=272, DataTable x=264/w=1568, table x=272/w=1552.
- `npm --workspace apps/console run build` passed with the existing Vite chunk-size warning.

### Files

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-2259-align-console-content-width.md`
