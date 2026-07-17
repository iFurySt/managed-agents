## [2026-07-16 16:43] | Task: Unify session filter dropdown behavior

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Align the console filter dropdown behavior with Claude Console: sessions Agent and Deployment filters should be searchable, sessions Status should be multi-select, and dropdown patterns should be reviewed across pages.

### Changes Overview

- Area: Console filters and session API filtering.
- Key actions:
  - Added a reusable multi-select filter dropdown for session lifecycle status filtering.
  - Kept reference collection filters searchable and extended that pattern to agent-detail deployment filtering.
  - Added CSV status filtering support to the apiserver session list endpoint.
  - Documented the multi-select filter dropdown behavior in the Claude Console design reference.
  - Fixed searchable and multi-select filter trigger hover backgrounds so the right-side chevron area receives the same hover fill as the rest of the control.
  - Replaced the Sessions Status filter's fixed width with a content-safe minimum width so "Active" does not truncate in narrower layouts.
  - Added shared outside-click and Escape dismissal for custom filter popovers so filters remain mutually exclusive.
  - Prevented modal-embedded Radix Select triggers from closing their parent dialog when users click an already-open trigger to collapse the picker.
  - Added dialog-level suppression for close requests emitted immediately after Create Session and Add Credential embedded pickers close, covering Radix close paths that bypass trigger pointer handlers.
  - Aligned the Create Session Environment picker option metadata to use concrete console date labels and Cloud/Self-hosted neutral tag chips.
  - Restored the Create Session credential-vault authorization acknowledgement as an amber warning block.
  - Reworked the Create Session Resource menu as an in-dialog click-open menu with boxed secondary trigger styling, preventing trigger press/release from accidentally selecting the first resource item or closing the modal.
  - Aligned all Create Session resource cards so GitHub Repository, File, and Memory Store fields share the same hairline borders, white fill, 35px control height, muted chevrons, and Claude-blue focus treatment.
  - Made the Resource menu open above the trigger once resource cards exist, and removed menu-open scroll resets that could place the trigger and menu outside the visible modal body.
  - Added post-add scroll stabilization so adding multiple resources keeps the resource list end and `+ Resource` control reachable.
  - Aligned File resource details with the reference modal: red required markers, `Manage files` link on the File ID row, `Mount path` casing, and a larger gap before the next `+ Resource` control.
  - Made GitHub Repository Checkout and Memory Store Access real selectable controls with in-dialog option menus and selected-value updates.
  - Moved the `+ Resource` menu to a fixed-position body portal outside the dialog scroll body so it can render above the modal surface and extend outside the dialog bounds.
  - Kept the Create Session dialog content clipped with rounded corners, and made the body-level resource portal explicitly accept pointer events so menu items remain hoverable/clickable inside Radix modal pointer-event constraints.

### Design Intent

Session status is a grouped user-facing filter: "Active" means a specific set of runtime lifecycle states, while users can still refine that set with checkboxes. Reference-object filters use search because their option lists can grow and are identified by names or exact IDs. Small fixed enums remain plain dropdowns.

Filter trigger hover state belongs on the complete bordered shell, not only the inner button, because the shell owns the full visual width and the chevron area. Keeping the button transparent and full-width avoids clipped hover fills.

The Sessions Status trigger should not hard-code an exact width. The label, value, and chevron need enough intrinsic space to render "Status Active" without ellipsis, and longer summaries can still grow from the same minimum.

Filter popovers should behave like one coordinated filter bar. Opening another filter is an outside interaction for the active custom popover, so the active popover closes before the next one opens.

Dialog-embedded Radix Select controls need a close-only path when their trigger is clicked while already open. That interaction should close the select popover and stop propagation before dialog outside-interaction handling can interpret it as a modal dismissal.

Some Radix Select close paths fire before the second trigger pointer event is observable by the trigger handler. Modal dialogs therefore also track a short "nested picker just closed" window and ignore parent dialog close requests in that window. This keeps Create Session Agent/Environment/Vault and Add Credential Type/MCP picker collapse interactions from dismissing the whole modal.

Create Session reference pickers use concrete date captions for environment rows rather than relative "5 days ago" labels in this modal. Same-year dates render like `Jun 16`; older years include the year. Environment type is a neutral tag chip so Cloud and Self-hosted metadata aligns with the rest of the console badge system. Selecting a credential vault exposes an amber authorization block because the acknowledgement is a warning/consent action, not plain inline helper text.

The Resource menu is intentionally rendered inside the dialog and opened after the trigger click completes. This avoids Radix DropdownMenu's pointer-down opening behavior, where releasing the same mouse press over the newly opened first item can accidentally add a GitHub Repository resource.

Resource card fields use the same modal control vocabulary as the rest of Create Session. The warning amber palette is reserved for the credential-vault authorization block, while focus remains the Claude-blue ring. Resource menus should preserve local scroll context: opening a menu is not a reason to reset the dialog to the top, and adding several resources should keep the user near the resource editor rather than requiring manual scroll recovery.

Required markers inside resource cards are independent red asterisks so they do not inherit the muted label color. Resource-specific management links belong on the relevant label row, and the next Resource button should not visually crowd an existing resource card.

Select-like controls in resource cards must not be static buttons. They use the same click-open local menu pattern as the Resource menu so option selection updates the displayed value without triggering parent modal dismissal.

The `+ Resource` menu is visually layered over the modal rather than confined by the dialog body's overflow. Outside-click logic must treat both the trigger and the portal menu as inside the same interaction so selecting a resource still adds it without dismissing the parent dialog first.

When a modal uses body-level pointer-event suppression, body-portaled interactive content must explicitly opt back into pointer events. The Resource menu uses a fixed-position `document.body` portal with `pointer-events: auto`, while the dialog itself keeps overflow clipping so sticky footers and scroll content cannot square off the modal's rounded bottom corners.

### Files Modified

- `apps/console/src/App.tsx`
- `apps/apiserver/main.go`
- `docs/references/claude-console/DESIGN.md`
