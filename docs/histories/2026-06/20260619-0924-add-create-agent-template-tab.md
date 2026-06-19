## [2026-06-19 09:24] | Task: Add create agent template tab

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue cloning the Claude Platform Managed Agents console with OBU evidence and commit/push verified milestones.

### Changes Overview

- Area: Console UI, Agents page Create agent dialog.
- Key actions: Added the Template starting-point tab with source-like template cards and selection behavior.
- Verification: Compared source and local Template tab through OBU CDP measurements, then ran `npm run build:console` and `go test ./...`.

### Design Intent

The Create agent dialog now supports both source starting-point modes. Template selection updates the visible starting point label and regenerates the YAML config while preserving the compact modal layout already aligned in previous milestones.

OBU measurements used for alignment:

- Source Template radio: `x=636 y=179 w=328 h=29`.
- Source first row cards: `Blank agent x=307 y=221 w=212 h=95`, `Deep researcher x=530 y=221 w=212 h=95`, `Structured extractor x=754 y=221 w=212 h=95`.
- Local after refinement: Template radio `x=636 y=179 w=328 h=29`; first row cards `x=307/530/753 y=221 w=212 h=95`.
- Local behavior check: selecting `Deep researcher` updates the label to `Starting point·Deep researcher` and the YAML starts with `name: Deep researcher`.

### Files Modified

- `apps/console/src/App.tsx`
