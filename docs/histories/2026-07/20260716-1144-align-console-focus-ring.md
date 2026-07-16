## [2026-07-16 11:44] | Task: Align console focus ring

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Compare the local environment description input focus highlight against Claude Console and align the styling.
> Follow-up: align the environment packages chip input so chips accumulate and wrap inside the package input wrapper.
> Follow-up: hide the package draft placeholder once package chips exist.
> Follow-up: add the missing border around Packages and Metadata section add buttons.
> Follow-up: make the Packages section `+` add another package row.
> Follow-up: leave the package manager unselected on newly added package rows.
> Follow-up: align package chip fill, border, spacing, and close icon behavior with the Claude Console reference.
> Follow-up: align read-only Packages and Metadata rendering with the Claude Console reference so package rows do not flatten into one line and metadata renders as key/value rows.
> Follow-up: correct the read-only Packages row background to match the reference warm-gray block fill.

### Changes Overview

- Area: console frontend styling
- Key actions:
  - Compared the local environment description textarea with the live Claude Console reference using Open Browser Use.
  - Updated the shared `cds-focus` focus-visible treatment from a black outline to the Claude-blue focus ring/glow.
  - Aligned the environment description textarea corner radius with the reference textarea.
  - Moved environment package chips into the bordered package input wrapper so added packages wrap inside the field instead of stretching the row.
  - Hid the package draft placeholder when the package wrapper already contains chips.
  - Split section add icon buttons from row remove icon buttons so Packages and Metadata `+` controls get the bordered treatment without boxing trash buttons.
  - Added package row editing state so the Packages section `+` creates another editable row; saved packages are flattened into the existing API shape.
  - Added select placeholder support and left newly added package rows without a default manager selection.
  - Matched package chips to the reference code-token styling and replaced the circular `×` close affordance with the compact bare icon treatment.
  - Added a `packageRows` update payload so package manager grouping survives save while remaining compatible with the existing `packages` text field.
  - Updated read-only Packages to render one bordered row per package manager row, and read-only Metadata to render as a two-column bordered key/value table.
  - Corrected read-only Packages row fill from canvas to the reference warm-gray block fill.
  - Replaced the inferred design note with the measured focus values from the reference page.

### Design Intent

The local textarea focus state was visibly heavier than the reference because it used a pure black outline. The updated style follows the reference control behavior: darken the hairline border and show a subtle blue ring/glow without browser outline.

The package editor now treats package values as chips inside the same field as the draft input. This preserves the reference layout when multiple packages are added: the field grows vertically and chips wrap instead of pushing the draft input off to the side.

The draft placeholder remains useful for the empty state, but is suppressed after chips exist so it does not read like another package value.

Section-level add actions are visually boxed to match the reference controls. Row-level remove actions remain unboxed because they are secondary cleanup controls inside the field rows.

The package section now supports multiple editable rows in the UI. The current API still stores one package manager and a flat package list, so save preserves the first row's manager and flattens all row package chips into the existing `packages` field.

Newly added package rows intentionally start without a selected manager so the UI does not imply `apt` was chosen for that row.

Package chips now use the same subdued code-token treatment as the reference page: translucent neutral fill, 0.5px border, tighter chip gap, and a small icon-only close target that changes text color on hover without drawing a circular background.

The read-only view now preserves the same row model users edit: package manager rows are displayed independently instead of flattening every package into one `apt:` line. Metadata also uses the reference key/value grid treatment instead of a raw preformatted block.

### Files Modified

- `apps/console/src/styles.css`
- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`
- `apps/console/src/types.ts`
- `apps/apiserver/main.go`
