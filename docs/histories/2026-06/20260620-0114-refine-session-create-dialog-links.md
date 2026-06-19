## [2026-06-20 01:14] | Task: Refine session create dialog links

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue cloning Claude Platform managed agents surfaces with OBU evidence and small verified milestones.

### Changes Overview

- Area: Console Sessions create flow.
- Key actions:
  - Matched the `Create session` dialog management links to the source TextLink style.
  - Added external-link icons and screen-reader `(opens in new tab)` text to the Agents, Environments, and Credential vaults links.

### Design Intent

Source validation showed the `Create session` dialog at about `706x526`, with blue `12px` management links using an external-link icon and new-tab assistive text. The local dialog already matched the main dimensions and field controls closely, so this change tightens the visible link treatment without changing the session creation flow.

Local OBU validation confirmed the dialog remained `706x526`, retained `data-cds="Dialog"`, and rendered the three management links in blue `12px` text with one icon each.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260620-0114-refine-session-create-dialog-links.md`
