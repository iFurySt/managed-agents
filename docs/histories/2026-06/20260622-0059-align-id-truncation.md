## [2026-06-22 00:59] | Task: Align ID truncation

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> Continue using OBU to compare the Claude Console clone against source pages
> and converge list/table details with real local data.

### Changes Overview

- Area: Console ID rendering.
- Key actions:
  - Changed generic `shortId` output from a fixed 7-character prefix and
    6-character suffix to a source-like resource prefix, ellipsis, and
    7-character suffix.
  - Brought the vault row ID display from `vlt_011...urffJx` to
    `vlt_...WurffJx`.
  - Verified local seeded vault rows through OBU using a temporary Postgres and
    apiserver stack.

### Design Intent

The source console keeps the resource kind prefix visible and preserves more
of the distinguishing suffix. Matching that truncation improves scanability and
visual fidelity across shared ID cells without changing the underlying copied
or linked full ids.

### Files Modified

- `apps/console/src/App.tsx`
