## [2026-06-19 09:10] | Task: Refine skill version history

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform managed agents console pages with OBU evidence, including child dialogs and interactions.

### Changes Overview

- Area: console skills UI and shared CDS components
- Key actions:
  - Measured the Claude Platform `xlsx` version history dialog after the loading skeleton completed.
  - Aligned the local version history dialog shell, title, close button, metadata line, section heading, version rows, version pill, and Latest badge to source geometry.
  - Changed version rows from a stretched three-column layout to source-like compact `version / date / badge` columns.
  - Added optional `className` support to the shared CDS `Badge` so one-off source-matched badge geometry can be expressed without a new component.

### Design Intent

The Skills page now has both primary dialogs, create skill and version history, closer to the source Claude Platform UI. This keeps the underlying local data model unchanged while improving the visual contract for a frequently used child dialog.

### Verification

- `npm run build:console`
- `go test ./...`
- OBU source `xlsx` version history dialog measurements:
  - dialog: `x=376`, `y=194`, `w=520`, `h=396`, `radius=12px`
  - title: `x=400`, `y=214`, `font=22px/26px`
  - metadata: `x=400`, `y=254`, `font=14px/20px`
  - heading: `x=400`, `y=298`, `font=15px/20px`, `weight=550`
  - first row: `x=400`, `y=331`, `w=472`, `h=47`
  - first version pill: `x=412`, `y=343`, `w=74`, `h=22`
  - Latest badge: `x=545`, `y=531`, `w=53`, `h=22`, `bg=#cde2fb`
- OBU local `xlsx` version history dialog after the change:
  - dialog: `x=376`, `y=194`, `w=520`, `h=396`, `radius=12px`
  - title: `x=400`, `y=214`, `font=22px/26px`
  - metadata: `x=400`, `y=254`, `font=14px/20px`
  - heading: `x=400`, `y=298`, `font=15px/20px`, `weight=550`
  - first row: `x=400`, `y=330`, `w=472`, `h=47`
  - first version pill: `x=412`, `y=342`, `w=74`, `h=22`
  - Latest badge: `x=547`, `y=546`, `w=52`, `h=22`, `bg=#cde2fb`

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260619-0910-refine-skill-version-history.md`
