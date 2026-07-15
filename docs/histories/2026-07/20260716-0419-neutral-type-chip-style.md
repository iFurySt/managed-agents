## [2026-07-16 04:19] | Task: Align neutral Type chip styling

### Execution Context

- Agent ID: Codex CLI session
- Base Model: GPT-5
- Runtime: local console via Vite

### User Query

> The Environments table Type chip differs from the official Console in font
> color, size impression, and background. Evaluate whether `DESIGN.md` needs
> an update.

### Changes Overview

- Area: `apps/console` shared badge styling and Claude Console design reference.
- Key actions:
  - Updated the shared neutral `Badge` tone to match the documented neutral tag
    style: `rgba(11,11,11,0.05)` fill with `#52514E` text.
  - Removed the Environments Type column's local `#F6F6F4` / `#52514E`
    override so it uses the shared neutral badge contract.
  - Added a `DESIGN.md` guardrail against using near-match solid grays for
    neutral tag pills.

### Design Intent

The Type chip should read as the same neutral tag used by the live Claude
Console: 12px/550 text, 5px radius, 8px horizontal padding, secondary text, and
a subtle 5% black fill. Keeping that in the shared badge tone avoids one-off
table overrides drifting from the reference.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
- `docs/references/claude-console/DESIGN.md`
