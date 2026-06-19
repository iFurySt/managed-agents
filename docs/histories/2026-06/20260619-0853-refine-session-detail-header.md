## [2026-06-19 08:53] | Task: Refine Session detail header and toolbar

### Request

Continue cloning Claude Platform managed-agents console pages and subpages with OBU evidence, committing verified milestones.

### Changes

- Reworked the Session detail top row so the breadcrumb, Actions menu, and Ask Claude button align with the captured Claude layout.
- Restyled the Session detail title and status row to match Claude's `22px/28px` title rhythm and compact `20px` status badge.
- Tightened the metadata row under the title and removed the cost chip from that row to match the captured Claude session header.
- Moved the Transcript/Debug segmented control and event filter toolbar to the captured vertical rhythm.
- Narrowed the Transcript/Debug segmented control and event filter to the observed `152px` and `97px` widths.
- Fixed the detail Actions trigger width to the captured `96px`.

### Intent

Session detail is the main run-debugging surface. This pass focuses on the header and transcript toolbar, moving the local page onto the same Claude detail-page grid before deeper transcript-row and event-panel refinements.

### Verification

- OBU captured Claude Session detail geometry:
  - breadcrumb nav `x=256 y=116 h=36`, breadcrumb link `x=268 y=120`
  - Actions `x=1020 y=118 w=96 h=32`
  - Ask Claude `x=1124 y=118 w=116 h=32`
  - title `x=288 y=168 h=28`
  - metadata row `x=288 y=204 h=25`
  - segmented control `x=288 y=249 w=152 h=28`
  - event filter `x=465 y=249 w=97 h=28`
  - Copy all `x=1176 y=249 w=28 h=28`
  - Download `x=1212 y=249 w=28 h=28`
- OBU post-change local Session detail geometry:
  - breadcrumb nav `x=256 y=118 h=32`
  - Actions `x=1020 y=118 w=96 h=32`
  - Ask Claude `x=1124 y=118 w=116 h=32`
  - title `x=288 y=168 h=28`
  - metadata row `x=288 y=204 h=25`
  - segmented control `x=288 y=249 w=152 h=28`
  - event filter `x=464 y=249 w=97 h=28`
  - Copy all `x=1176 y=249 w=28 h=28`
  - Download `x=1212 y=249 w=28 h=28`
- `npm run build:console`
- `go test ./...`
- `GET /api/sessions/sesn_01MwRxWt4Enabbz8a2Vk66M7` returned the expected seeded session with seven events.

### Files

- `apps/console/src/App.tsx`
