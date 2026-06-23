## [2026-06-23 12:25] | Task: Align agent detail configuration panels

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local macOS with Docker`

### User Query

> Compare the Claude Platform and local agent detail pages with Open Browser
> Use, then align the detail-page controls, configuration sections, empty
> states, and related styling in small verified steps.

### Changes Overview

- Area: Console frontend.
- Key actions:
  - Aligned the agent detail version select with the shared inset-bordered
    filter shell.
  - Reworked the Agent tab configuration layout with consistent section
    headings, top dividers, and body text styling.
  - Styled the model value as lighter body text, matching the reference
    hierarchy.
  - Wrapped the system prompt in a light code-block surface with rounded
    corners and inline copy action.
  - Moved MCP tool permission badges to a second line under the built-in tools
    row and added a collapsed-row affordance.
  - Replaced the framed Skills empty state with the reference-style
    `No skills configured.` text.
  - Restored inset borders on agent-session tab filters and added the empty
    sessions message.
  - Gave the agent-deployments empty-state create button a framed treatment.
  - Follow-up: matched the agent detail actions menu width to the reference
    menu and shortened the detail-page archive action copy.

### Design Intent

The detail page should move closer to the Claude Platform reference without
changing data contracts or shared table behavior. The first pass focuses on
well-scoped visual discrepancies that can be verified directly in the running
console.

### Verification

- `npm run build:console`
- Rebuilt the local compose `console` service.
- Used Open Browser Use to compare the official and local agent detail pages.
- Verified the local Agent tab now has an inset-bordered version selector,
  light system-prompt code block, lighter model body text, section dividers,
  second-line MCP permission badges, and frameless Skills empty copy.
- Verified the local Sessions tab filters use inset-bordered shells and the
  empty state reads `No sessions yet, run this agent to create a session`.
- Verified the local Deployments tab empty state shows a framed
  `Create deployment` button.
- Compared the official actions menu with Open Browser Use; matched the local
  detail actions menu width and archive label in source after measuring the
  reference popup.

### Files Modified

- `apps/console/src/App.tsx`
