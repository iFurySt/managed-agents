## [2026-07-16 12:47] | Task: Align vault credential dialog

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Align the vault creation/detail/edit surfaces with the Claude Console reference, starting with the visible Add credential dialog differences.
> Follow-up: fix the Add credential Type select closing/jittering when clicked or selecting a type.
> Follow-up: align the vault detail Add credential button styling with the reference.
> Follow-up: align the vault detail table empty area height and remove the final row divider.
> Follow-up: restore the empty credential state lock icon.
> Follow-up: align the Add credential Type select hover behavior.
> Follow-up: add real Gmail and Notion MCP targets and render Type-specific credential forms.
> Follow-up: restore boxed Status filter styling on vault detail and align detail-page filter controls.

### Changes Overview

- Area: console vault UI styling
- Key actions:
  - Compared the local and Claude Console vault Add credential dialogs with Open Browser Use.
  - Aligned the vault creation flow's second-step Add credential dialog with the compact `510px` reference dialog used by vault detail.
  - Changed the MCP server field to render the example URL as a muted placeholder while no value is selected.
  - Updated the shared `FieldSelect` placeholder wrapper so empty select placeholders inherit muted text consistently.
  - Changed the creation-flow `Skip for now` action from a bare ghost button to the bordered secondary button treatment.
  - Removed press-scale feedback from credential modal select triggers to prevent popover jitter.
  - Allowed Radix Select popovers during dialog pointer/focus outside handling so selecting Type is not treated as clicking outside the modal.
  - Changed the vault detail header Add credential action to the black primary button treatment and the empty-state action to the boxed secondary button.
  - Aligned the empty credential table height and removed the final body row's bottom divider.
  - Restored the large lock icon above the empty credential state title.
  - Moved credential select hover feedback from the transparent trigger to the outer field shell border/ring.
  - Added real MCP server options for Gmail and Notion in the credential MCP server picker.
  - Added Type-specific credential form behavior: MCP OAuth and Bearer token use the MCP server picker, while Environment variable expands to variable/value, networking, allowed hosts, injection location, warning, and acknowledgement controls.
  - Reset credential form Type state when the dialog closes so reopening starts from the reference default.
  - Replaced the vault detail Status filter's transparent trigger with the shared boxed filter shell.
  - Replaced the deployment detail Runs tab Trigger/Result filters' transparent triggers with the shared boxed filter shell.
  - Documented the vault credential modal variant in the Claude Console design reference.

### Design Intent

Vault credential creation should use one compact dialog pattern whether it is
opened after creating a vault or from an existing vault detail page. The previous
creation-flow second step fell back to the shared dialog default width, making
the form visibly wider than the reference and causing the controls to feel
misaligned. The updated flow keeps the form dimensions and field treatment
consistent with the source console.

Credential select triggers intentionally avoid the editor toolbar's press-scale
microinteraction. Select popovers are positioned relative to their trigger; a
scaled trigger moves during pointer interactions and can make the popover appear
to shake. Because Radix Select content is portaled outside the dialog DOM, the
shared dialog also guards select popovers from being misclassified as outside
interaction.

Credential select hover feedback is intentionally shell-level instead of
trigger-level. The reference combobox keeps the trigger background transparent
and darkens the field boundary on hover, so the local implementation mirrors
that behavior to avoid a filled rectangle appearing inside the field.

Credential Type controls the rest of the modal. OAuth-style credentials still
ask for an MCP server endpoint, and the local test set now uses real Gmail and
Notion MCP endpoints. Environment variable credentials require a larger dialog
because the reference form collects secret name/value, networking restrictions,
injection location, and an explicit shared-credential acknowledgement before
enabling submission.

Detail-page table filters should use the same boxed filter shell as top-level
table filters unless a component has a separate explicit reference variant. A
transparent trigger makes the label/value pair read like plain text and breaks
alignment with the Claude Console filter control.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `apps/console/src/styles.css`
- `docs/references/claude-console/DESIGN.md`
- `docs/histories/2026-07/20260716-1247-align-vault-credential-dialog.md`
