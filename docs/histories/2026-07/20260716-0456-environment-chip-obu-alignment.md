# Environment Chip OBU Alignment

## Summary

- Used Open Browser Use to inspect the live Claude Console Environment Type chip.
- Corrected the local Environment detail value chip to match the live computed styles.

## Details

- Live chip styles measured from the official page: 22px height, 5.5px radius, 8px horizontal padding, 12px text, 15px line-height, 550 weight, neutral 5% black fill, and `#52514E` text.
- Updated the local Networking Type chip from the oversized 25px/14px treatment to the measured 22px/12px treatment.
- Updated `DESIGN.md` so future detail field value chips use the measured live-console style.

## Verification

- `npm --workspace apps/console run lint`
- `npm --workspace apps/console run build`
- OBU computed-style check on local Environment detail page.
