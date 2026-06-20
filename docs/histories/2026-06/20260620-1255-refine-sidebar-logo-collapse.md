# Refine Sidebar Logo And Collapse Icon

## Request

Continue the Claude Console clone and address the visible mismatch called out
for the left sidebar header: the "Claude Console" logo typography and the
collapse icon.

## Changes

- Reworked the sidebar header wrapper to match the source layout rhythm:
  40px header block, translated 28px inner row, and right-aligned 28px
  collapse button.
- Restored the visible product logo layer to the source-like ProductLogo
  structure: 16px anthropic serif, `dlig`/`ss01` font features, leading-none,
  and the small negative left margin.
- Replaced the CSS-drawn collapse icon with the lucide `PanelLeft` icon in a
  20px slot so the button reads as an actual sidebar collapse affordance.

## Verification

- Compared the source and local `/agents` sidebar header with Open Browser Use.
- Verified local logo link at `x=12`, `y=16.5`, logo span at `x=18.40625`,
  `y=18`, `16px` font size, `16px` line height, and `550` weight.
- Verified local collapse button at `x=215.5`, `y=13`, `28x28`, with a
  `20x20` icon slot at `x=219.5`, `y=17`.

## Files

- `apps/console/src/App.tsx`
