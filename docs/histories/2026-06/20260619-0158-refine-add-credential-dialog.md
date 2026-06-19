## [2026-06-19 01:58 CST] | Task: Refine add credential dialog

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents surfaces with OBU evidence, verify each milestone, then commit and push.

### Changes Overview

- Area: console credential vault detail UI.
- Key actions:
  - Captured Claude Platform `Add credential` dialog from a credential vault detail page with OBU.
  - Changed the local add credential dialog from the generic 706px modal to the captured 510px modal size.
  - Tightened credential form spacing, label line-height, footer spacing, and title sizing.
  - Changed the `Optional` name marker into a compact badge matching the captured dialog treatment.
  - Revisited the dialog with fresh source and local OBU measurements, then aligned the shell to `510x349`, `12px` borderless radius, `22px` title, `31px` close/connect controls, `31px` inputs, half-white field backgrounds, and compact split labels.

### Design Intent

Keep credential CRUD inside `apiserver` while improving the console's vault detail workflow fidelity. The form still submits the same local credential payload, but the initial dialog now matches the captured Claude surface more closely without adding a new credential abstraction.

OBU evidence:

- Claude dialog: 510px wide by 349px high, disabled `Connect` button, compact `Optional` badge.
- Local final dialog: 510px wide by 349px high, with title, close, labels, inputs, type select, target field, and Connect button coordinates matching the captured Claude dialog.

Verification:

- `npm run build:console`
- `go test ./...`
- API smoke created a temporary environment-variable credential and deleted it through the vault credential API.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260619-0158-refine-add-credential-dialog.md`
