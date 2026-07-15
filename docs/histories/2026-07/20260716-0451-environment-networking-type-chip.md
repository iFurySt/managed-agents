# Environment Networking Type Chip

## Summary

- Aligned the Environment detail Networking Type value with the Claude Console chip treatment.
- Restored the section divider below Networking so Packages starts after a visible hairline separator.

## Details

- Changed the read-only Networking Type value from plain text to a neutral badge.
- Added the missing border for separated Environment detail sections.

## Verification

- `npm --workspace apps/console run lint`
- `npm --workspace apps/console run build`
