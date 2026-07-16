## [2026-07-16 16:30] | Task: Add searchable session filters

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> The Sessions page Agent/Deployment dropdowns should be searchable like the Claude Console reference. Commit and push the fix.

### Changes Overview

- Area: console session list filters
- Key actions:
  - Reused the searchable filter dropdown pattern for the Sessions page Agent and Deployment filters.
  - Generalized the existing deployment filter component into `SearchableFilterSelect`.
  - Added stable session deployment filter metadata so the Deployment filter can show name/date rows instead of raw IDs.
  - Added `onInput` handling to the searchable filter input so programmatic and browser input paths both update filtering state.
  - Verified Agent and Deployment filter search behavior with Open Browser Use.

### Design Intent

Reference-collection filters should not behave like small enum selects. Agent
and Deployment lists grow over time, so their filters need a search input and
name/date rows matching the existing searchable filter design. Keeping this as a
shared component prevents Sessions and Deployments list filters from drifting.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-07/20260716-1630-session-searchable-filters.md`
