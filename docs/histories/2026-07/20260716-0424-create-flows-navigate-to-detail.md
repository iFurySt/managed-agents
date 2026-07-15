## [2026-07-16 04:24] | Task: Navigate to detail pages after create

### Execution Context

- Agent ID: Codex CLI session
- Base Model: GPT-5
- Runtime: local console via Vite

### User Query

> After creating an environment, the UI stays on the list page, but it should
> navigate to the new environment detail page. Check the other create flows too;
> Agents were already handled, but other pages likely were not.

### Changes Overview

- Area: `apps/console` create flows and frontend workflow documentation.
- Key actions:
  - Updated Sessions, Deployments, Environments, Vaults, and Memory stores list
    pages so successful top-level creation navigates to the new object's detail
    route after updating local list state.
  - Updated the Agent detail page's scoped "Create deployment" flow to navigate
    to the newly created deployment detail page.
  - Added a `navigateOnCreated` switch to `CreateAgentDialog` so the top-level
    Agents page keeps its existing create-and-open behavior, while the nested
    Create Session agent picker can create/select an agent without leaving the
    session dialog.
  - Added a Vault creation completion callback so the two-step vault flow
    navigates after the optional first credential step is completed or skipped,
    not immediately after the vault record is created.
  - Documented the workflow rule in `docs/FRONTEND.md`.

### Design Intent

Top-level creates should land the user on the object they just created, where
the next useful action is usually configuration, inspection, or linking. Nested
helper creates inside another workflow should not steal navigation away from
the parent workflow.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/FRONTEND.md`
