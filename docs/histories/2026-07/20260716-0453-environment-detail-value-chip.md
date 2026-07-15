# Environment Detail Value Chip

## Summary

- Tightened the Environment detail Networking Type chip to match the Claude Console value-chip treatment more closely.
- Documented the detail field value chip as a distinct badge variant.

## Details

- Replaced the generic `Badge` override with an explicit static value chip so table/header badge defaults do not leak into detail fields.
- Added a `DESIGN.md` rule for body-sized static value chips in detail sections.

## Verification

- `npm --workspace apps/console run lint`
- `npm --workspace apps/console run build`
