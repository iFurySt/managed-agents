## [2026-06-19 01:40] | Task: Refine create vault dialog

### Request

Continue cloning the Claude Platform managed-agents console, including clicked dialogs and sub-surfaces, using OBU evidence.

### Changes

- Captured Claude and local `Create vault` dialogs with OBU.
- Narrowed the local create-vault step from the generic CRUD width to the Claude-like `510px` modal.
- Matched compact title styling and close label for the create-vault step.
- Added the info icon in the shared-vault notice and tightened the notice/form/footer spacing.
- Allowed the Continue button to stay enabled with an empty name and changed apiserver to default empty vault names to `Untitled vault`.
- Revisited the first step with fresh OBU measurements and aligned it to the source `510x306` shell, `12px` borderless modal radius, `22px` title, `31px` close/Continue controls, `82px` shared-vault notice, and `31px` half-white name input.
- Split the Name label from the input wrapper so the rendered label row matches Claude's compact `14px` label geometry.

### Intent

The visible Claude modal allows proceeding from an empty first step and renders as a compact `510px` dialog. The local implementation now follows that surface while preserving backend validation for overlong names.

### Verification

- OBU captured Claude `Create vault` at `510x306`.
- OBU confirmed the local create-vault step after the latest refinement at `510x306`, with title, close, notice, field, helper, and Continue coordinates matching the captured Claude dialog.
- API smoke created an empty-name vault as `Untitled vault`, then deleted the test row.
- `npm run build:console`
- `go test ./...`

### Files

- `apps/console/src/App.tsx`
- `apps/apiserver/main.go`
