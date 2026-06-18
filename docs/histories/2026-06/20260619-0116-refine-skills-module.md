## [2026-06-19 01:16] | Task: Refine managed agents skills module

### Request

Continue cloning the Claude Platform managed-agents console one module at a time, using OBU captures for DOM and visual comparison. This milestone focuses on the Skills page, create dialog, and version history dialog.

### Changes

- Added configurable width, title styling, and close-label props to the shared `ConsoleDialog` component so individual Claude-like dialogs can match narrower modal sizes without affecting wider CRUD dialogs.
- Refined the Skills list so skill slugs are copyable controls matching the Claude page affordance.
- Tightened the Create skill dialog to match Claude's narrow upload modal and disabled Continue state.
- Refined the Skill version history dialog with Claude-like width, compact title sizing, copyable version labels, and reduced bottom whitespace.
- Changed apiserver seed behavior to upsert built-in Anthropic skills and versions on startup, keeping local development databases aligned with the captured Claude labels and version history while preserving user-created skills.
- Follow-up: rechecked the Claude Skills page and Create skill dialog with OBU, widened the local skills list to the observed 952px content width, changed version-history controls to transparent 28px icon buttons, and reshaped the upload drop zone so the 112px dashed box only contains the upload prompt while the 8MB limit/help links sit below it.

### Intent

Skills remain a logical module inside `apiserver` for the MVP. The UI keeps the Claude surface simple and avoids adding filters/search that are not visible in the captured Skills page, while making copy/version/create interactions behave closer to the source console.

### Verification

- OBU captured Claude and local Skills list, Create skill dialog, and xlsx Version history dialog.
- OBU post-change local dialog measurements:
  - Create skill: `510x264`, matching Claude's `510x265` modal.
  - Version history: `520x393`, matching Claude's `520x396` modal.
- OBU follow-up measurements confirmed the local Skills list at `952px`, version-history buttons at `28x28`, and the Create skill upload drop zone at `460x112` with a transparent dashed style.
- `npm run build:console`
- `go test ./...`
- `curl -sS http://127.0.0.1:8080/api/skills` confirmed the built-in xlsx skill uses `createdLabel: Oct 14, 2025` and `updatedLabel: Feb 3`.
- `POST /api/skills` plus `DELETE /api/skills/:id` smoke created and removed a temporary local skill.

### Files

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `apps/apiserver/main.go`

### Follow-up: Skills List Geometry

- Re-captured the Claude Platform Skills list with OBU.
- Shifted the local skill item list to the observed x=300 content origin and narrowed it so version-history buttons align at x=1200.
- Tightened skill item headings to the captured 16px/24px rhythm and softened slug copy controls to match the muted compact Claude affordance.
