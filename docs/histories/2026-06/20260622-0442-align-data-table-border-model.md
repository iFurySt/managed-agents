# Align Data Table Border Model

## User Request

Continue converging the Claude Console clone with OBU comparisons, focusing on page-level visual fidelity.

## Changes

- Removed the shared `border-collapse` class from the console `DataTable` base table.
- Let page-level table classes use the Claude Console-style `border-separate border-spacing-0` model without a conflicting base class.
- Aligned body row classes with the source table's `h-11` and relative transform treatment.
- Verified with Open Browser Use that the Agents table computes `border-collapse: separate`.

## Intent

Keep the shared DataTable closer to Claude Console's table rendering model before making more granular row-height adjustments.

## Files

- `apps/console/src/components/cds.tsx`
