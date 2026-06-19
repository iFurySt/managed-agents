## [2026-06-19 08:43] | Task: Refine console frame and Skills list geometry

### Request

Continue cloning Claude Platform managed-agents console pages with OBU evidence and small verified milestones.

### Changes

- Split the console content frame so the alert banner uses Claude's narrower outer padding while routed page content uses the wider page gutter.
- Tightened the update banner to the captured `992x76` frame at `x=268, y=12`.
- Removed the extra `PageHeader` bottom margin so page headers rely on the parent gap, matching the captured Skills header/list rhythm.
- Reworked the Skills list to the captured `952px` item frame, `137px` row height, `x=300` inner content origin, `720px` two-line description preview, and `28px` version-history controls.
- Removed the old Files page left-margin compensation because the global page gutter now supplies the captured content origin.
- Follow-up: re-measured the current Claude Skills page and tightened the shared `PageHeader` to the source two-row structure, with the description spanning the full `952px` content width and `128px` right padding.
- Follow-up: added the Skills list top border so the first row starts at the captured `y=225`, changed the slug copy control into the captured compact `44.8x22` pill, and moved metadata to the observed `y=327` baseline.
- Follow-up: matched the Skills Create button to the captured `120x32` primary button, `8px` radius, and `550` font weight.

### Intent

The Claude console uses different horizontal gutters for the global banner and the page body. Matching that frame at the layout level avoids one-off page offsets and keeps subsequent modules aligned with the same shell.

### Verification

- OBU captured Claude Skills geometry:
  - banner `x=268 y=12 w=992 h=76`
  - header `x=288 y=128`
  - list `x=288 y=224 w=952`
  - first item `h=137`
  - description `x=300 y=261 w=720 h=40`
  - version button `x=1200 w=28 h=28`
- OBU post-change local Skills geometry:
  - banner `x=268 y=12 w=992 h=76`
  - header `x=288 y=128`
  - list `x=288 y=224 w=952`
  - first item `h=137`
  - description `x=300 y=260 w=720 h=40`
  - version button `x=1200 w=28 h=28`
- OBU follow-up source Skills measurements:
  - description `x=288 y=168 w=952 h=40`, padding-right `128`
  - Create button `x=1120 y=128 w=120 h=32`, radius `8`, font weight `550`
  - first row `x=288 y=225 w=952 h=137`
  - skill description `x=300 y=261 w=720 h=40`
  - metadata row `x=300 y=327 h=22`
  - slug pill `x=300 y=327 w=44.8 h=22`
- OBU follow-up local Skills measurements:
  - description `x=288 y=168 w=952 h=40`, padding-right `128`
  - Create button `x=1120 y=128 w=120 h=32`, radius `8`, font weight `550`
  - first row `x=288 y=225 w=952 h=137`
  - skill description `x=300 y=261 w=720 h=40`
  - metadata row `x=300 y=327 h=22`
  - slug pill `x=300 y=327 w=44.9 h=22`
- OBU regression checked local Files at `h1 x=288 y=128` and empty-state code panel `x=288 w=952`.
- OBU regression checked local Agents at `h1 x=288 y=128`, filters `x=288 w=952`, and table `x=288 w=952`.
- `npm run build:console`
- `go test ./...`
- `curl -fsS http://127.0.0.1:8080/api/skills` confirmed four skills with `xlsx` first and `updatedLabel: Feb 3`.

### Files

- `apps/console/src/App.tsx`
- `apps/console/src/styles.css`
- `docs/histories/2026-06/20260619-0843-refine-console-frame-skills-list.md`
