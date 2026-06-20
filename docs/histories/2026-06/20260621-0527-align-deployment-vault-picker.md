## [2026-06-21 05:27] | Task: Align deployment vault picker

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue tightening Claude Console visual parity, including visible font, sidebar, and create-deployment dialog differences.

### Changes Overview

- Area: Console frontend deployment creation dialog.
- Key actions:
  - Matched the Add vault trigger width to the Claude Console dialog.
  - Added the vault picker search row and source-like list height.
  - Updated the visible vault options so the first rows mirror the reference order and metadata.

### Design Intent

The picker should converge on the source UI in small, verifiable steps. This change keeps the existing local dropdown implementation but adjusts layout, copy, and option metadata so the immediately visible surface matches the reference without introducing a broader component rewrite.

### Files Modified

- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260621-0527-align-deployment-vault-picker.md`
