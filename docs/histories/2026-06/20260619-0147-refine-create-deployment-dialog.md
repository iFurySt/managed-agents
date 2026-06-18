## [2026-06-19 01:47 CST] | Task: Refine create deployment dialog

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU evidence, verify each milestone, then commit and push.

### Changes Overview

- Area: console deployments UI and shared CDS dialog controls.
- Key actions:
  - Captured Claude Platform `Create deployment` dialog with OBU and compared it against the local console.
  - Changed the local deployment dialog from the generic 706px modal to a 520px modal with tighter title, field labels, and footer spacing.
  - Replaced the local 28px `Manage ...` buttons with compact new-tab links for agents, environments, vaults, and memory stores.
  - Removed the local-only trigger explanation panel so the initial dialog content matches the captured Claude surface.
  - Updated the shared `ConsoleDialog` close icon button to the captured 32px size.

### Design Intent

Keep this milestone narrowly focused on the deployment creation flow. The dialog remains backed by the existing `apiserver` deployment API, while the UI moves closer to the captured Claude Platform geometry and content order without introducing a new component abstraction.

OBU evidence:

- Claude dialog: 520px wide by about 718px high, 472px content width, disabled `Create` button, no trigger explanation panel.
- Local final dialog: 520px wide by about 725px high, 470px content width, disabled `Create` button, same field order and no trigger explanation panel.

Verification:

- `npm run build:console`
- `go test ./...`
- API smoke created and archived a temporary deployment, then removed the test row from local Postgres.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `docs/histories/2026-06/20260619-0147-refine-create-deployment-dialog.md`
