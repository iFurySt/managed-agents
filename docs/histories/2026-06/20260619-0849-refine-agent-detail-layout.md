## [2026-06-19 08:49] | Task: Refine Agent detail layout

### Request

Continue cloning Claude Platform managed-agents console pages and their subpages with OBU evidence.

### Changes

- Reworked the Agent detail header so the breadcrumb, title row, status badge, metadata row, Edit button, and more-actions button align with the captured Claude detail page.
- Changed the Agent detail tabs to use the Claude-like `NavigationTabs` sizing and the captured `32px` height.
- Tightened the version selector to the observed `105px` control width.
- Replaced the System prompt paragraph and large copy button with a two-line-compatible `pre` preview block and compact floating copy icon.
- Added the captured vertical spacing before `MCPs and tools` so the first visible sections match the source page rhythm.

### Intent

Agent detail is one of the core managed-agents subpages, so this pass moves it away from the generic page-header layout and toward the specific Claude Platform detail structure. The change is visual and interaction-preserving: edit, copy, tabs, and actions still use the existing local API and Radix-backed controls.

### Verification

- OBU captured Claude Agent detail geometry:
  - breadcrumb `x=268 y=120 h=28`
  - title `x=288 y=164 h=32`
  - status `x=806 y=171 h=20`
  - description `x=288 y=234 h=20`
  - tabs `x=288 y=270 w=952 h=32`
  - version selector `x=288 y=322 w=105 h=32`
  - model title `x=288 y=370`
  - system prompt title `x=288 y=471`
  - system prompt pre `x=304 y=515 w=920 h=120`
  - prompt copy button `x=1210 y=507 w=22 h=29`
  - MCPs and tools title `x=288 y=699`
- OBU post-change local Agent detail geometry:
  - breadcrumb `x=268 y=120 h=28`
  - title `x=288 y=164 h=32`
  - status `x=801 y=170 h=20`
  - description `x=288 y=234 h=20`
  - tabs `x=288 y=270 w=952 h=32`
  - version selector `x=288 y=322 w=105 h=32`
  - model title `x=288 y=374`
  - system prompt title `x=288 y=471`
  - system prompt pre `x=304 y=515 w=920 h=120`
  - prompt copy button `x=1210 y=507 w=22 h=29`
  - MCPs and tools title `x=288 y=699`
- `npm run build:console`
- `go test ./...`
- `GET /api/agents/agent_013mi1SmR2hJ6Hk6wNTeJvF9` returned the expected seed agent.

### Files

- `apps/console/src/App.tsx`
