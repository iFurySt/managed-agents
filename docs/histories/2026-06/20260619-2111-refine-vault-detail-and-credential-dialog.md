## [2026-06-19 21:11] | Task: Refine vault detail and credential dialog

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue cloning Claude Platform managed agents surfaces with Open Browser Use evidence, preserving small verified milestones with commits and pushes.

### Changes Overview

- Area: Console credential vault detail page and Add credential dialog.
- Key actions:
  - Compared Claude Platform and local vault detail pages with Open Browser Use.
  - Shifted the vault detail header, status filter, and table onto the source page's left rhythm.
  - Replaced the detail status pill with source-like plain status text.
  - Made Add credential and Status filter controls transparent source-style buttons.
  - Showed the full vault id in the detail metadata row.
  - Matched the Add credential dialog's MCP OAuth controls by rendering Type and MCP server as transparent select triggers.
  - Changed the dialog Connect action from a black primary button to the source transparent action style.

### Design Intent

The vault detail page source is closer to a sparse object detail view than the denser list-page treatment. This change keeps list badges and CRUD behavior intact while making the detail header and credential dialog match the observed Claude Console visual system.

OBU verification points:

- Source vault title: `x=292 y=164 font=22px weight=580`; local: `x=292 y=164 font=22px weight=580`.
- Source status filter: `x=288 y=238 h=32`; local: `x=292 y=238 h=32` after detail content alignment.
- Source table: `x=288 y=286 w=1108`; local: `x=292 y=286 w=1108` after detail content alignment.
- Source Add credential dialog: `x=381.2 y=217.1 w=509.6 h=348.9`; local: `x=381 y=217 w=510 h=349`.
- Source dialog Type trigger: `x=404.7 y=395.4 w=454.7 h=31.4`; local: `x=405 y=395 w=455 h=31`.
- Source dialog Connect button: transparent `x=786.6 y=511.1 w=80.7 h=31.4`; local: transparent `x=786 y=511 w=81 h=31`.

### Files Modified

- `apps/console/src/App.tsx`
