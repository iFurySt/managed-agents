## [2026-06-22 06:31] | Task: Align sidebar nav weight

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Quickly converge visible fidelity without expanding scope; visible sidebar font mismatches should be tightened.

### Changes Overview

- Area: Console sidebar.
- Key actions: Changed the top-level ordinary sidebar item weight from `550` to `400` to match the Claude Console reference.

### Design Intent

OBU comparison showed the reference `Dashboard` and `API keys` sidebar links render at `font-weight:400`, while the local clone rendered them at `550`. Keeping group headings untouched preserves their heavier visual hierarchy while making ordinary navigation labels match the source.

### Files Modified

- `apps/console/src/App.tsx`
