## [2026-06-19 00:13] | Task: Refine managed agents module

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: CLI

### User Query

> Continue cloning the Claude Platform Managed Agents console one module at a time, using OBU evidence and committing verified milestones.

### Changes Overview

- Area: `apiserver`, console UI, API client, type contracts.
- Key actions: refined the Agents list, create dialog, detail page, action menus, and edit flow against fresh OBU DOM and screenshot evidence.
- Follow-up: rechecked the Claude Agents table with OBU and tightened the shared CDS table density so headers render at about 32px, body rows at 45px, and icon action buttons at 28px with transparent styling.
- Follow-up: after enabling fixed table layout for the shared CDS table, retuned Agents column widths to keep the table near the captured Claude width and prevent horizontal overflow.
- Follow-up: re-captured the current Claude Agents list after the shared page-header changes and aligned the local Agents content frame to the source `x=280, w=968` list layout without changing the Skills-specific `x=288, w=952` frame.
- Follow-up: matched the Agents filter selects to the source no-border, semi-transparent white, `8px` radius controls and moved the Agents table into the captured `-mx-2 p-2` horizontal scroll shell.
- Follow-up: raised shared CDS table header text weight to `550`, matching the current Claude table header token.

### Design Intent

Agents are the primary entry point for sessions and deployments, so this pass moves beyond the basic list/detail scaffold into the Claude-like operational surface: copyable IDs, status filtering, row actions, version selection, config editing, save-new-version behavior, and archive handling. The backend keeps these controls in `apiserver`, consistent with the MVP decision that CRUD and registry behavior live in the control plane.

The follow-up keeps the table density and fixed-layout changes in the shared CDS layer because Agents, Sessions, Deployments, Environments, Vaults, Files, and other management lists share the same Claude table token.

### Follow-up: Agents List Geometry

- Re-captured the Claude Platform Agents list with OBU at a 1272px viewport.
- Aligned the Agents filter row to the captured controls: 320px search field, 142px Created select, and 123px Status select with the same x-position spacing as Claude.
- Set the Agents table actions column to 56px so the list keeps the captured 1106px row shape with 40/180/240/170/120/150/150/56 column geometry.
- Verified the local `/agents` page with OBU after the change; filter and table x/width/height values match the Claude reference, while global shell vertical positioning remains a separate follow-up.
- OBU follow-up source Agents measurements:
  - content section `x=280 y=128 w=968`
  - Create agent button `x=1116.2 y=128 w=131.8 h=32`
  - filters `x=280 y=204 w=968 h=40`
  - Created select `x=608 y=204 w=142.3 h=32`, no border, radius `8`
  - Status select `x=766.3 y=204 w=123.1 h=32`, no border, radius `8`
  - table shell `x=272 y=252 w=984`, padding `8`
  - table `x=280 y=260 w=1106`, first row `x=280 y=292 h=46`
  - table header cells use `font-weight=550`
- OBU follow-up local Agents measurements:
  - content section `x=280 y=128 w=968`
  - Create agent button `x=1116 y=128 w=132 h=32`
  - filters `x=280 y=204 w=968 h=32`
  - Created select `x=608 y=204 w=142 h=32`, no border, radius `8`
  - Status select `x=766 y=204 w=123 h=32`, no border, radius `8`
  - table shell `x=272 y=252 w=984`, padding `8`
  - table `x=280 y=260 w=1106`, first row `x=280 y=292 h=45`
  - table header cells use `font-weight=550`

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/types.ts`
