# List Table Horizontal Scroll

## Summary

- Converted the Agents list table from a fixed wrapper width to a responsive horizontal-scroll table pattern.
- Aligned other fixed-width list tables with the same `w-full` plus `min-width` contract used by Environments.

## Details

- List table sections now preserve `min-w-0` so narrow split-screen layouts can shrink.
- Data table containers now fill the available width while table elements keep their minimum column width and scroll internally.
- Applied the pattern across Agents, Sessions, Deployments, Vaults, Memory Stores, Vault credentials, and Agent detail session history.

## Verification

- `npm --workspace apps/console run lint`
- `npm --workspace apps/console run build`
