# Refine Button Font Weight

## Request

Continue the Claude Console clone with OBU-based parity work and keep improving
shared console UI tokens.

## Changes

- Updated the shared CDS `Button` wrapper to use a default `550` font weight
  instead of Tailwind's `font-medium` default.
- Kept select/filter controls unchanged because they are not rendered through
  the shared `Button` wrapper and source selects use regular-weight text.

## Verification

- Compared visible `data-cds="Button"` elements on source and local `/agents`
  with Open Browser Use.
- Source buttons such as sidebar collapse, banner action, create agent,
  documentation, row actions, and pagination report computed `fontWeight: 550`.
- Verified local shared-button elements now compute to `fontWeight: 550`.
- Verified local filter select triggers remain at `fontWeight: 400`.

## Files

- `apps/console/src/components/cds.tsx`
