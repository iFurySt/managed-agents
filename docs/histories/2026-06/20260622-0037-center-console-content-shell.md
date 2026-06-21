## [2026-06-22 00:37] | Task: Center console content shell

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local-cli`

### User Query

> The managed agents console clone is functionally close; quickly converge the
> remaining visual mismatches without expanding scope.

### Changes Overview

- Area: Console layout fidelity.
- Key actions:
  - Matched the primary content shell to the source console's centered
    `max-w-7xl` layout with `px-6` / `md:px-8` padding.
  - Preserved the existing full-width memory-store detail route behavior.
  - Kept banner pages at the tighter top offset while using the same content
    shell padding.

### Design Intent

The source console centers list-page content within a constrained shell on wide
screens. The local clone previously used a wider non-centered shell, which made
wide screenshots drift left. The new shell keeps the existing 1272px layout
coordinates stable while improving wide-viewport fidelity.

### Files Modified

- `apps/console/src/App.tsx`
