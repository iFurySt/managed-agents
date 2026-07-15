# Claude Console Design Reference

Reusable design system extracted from the logged-in **Claude Console**
(`platform.claude.com`) — the surface our own `apps/console` should match.
Captured July 2026 via live computed styles across Dashboard, Agents, Sessions,
Deployments, Environments, and Quickstart.

## Files

- [`DESIGN.md`](DESIGN.md): the design system (colors, type, components, layout,
  depth, responsive rules, agent prompt guide). Source of truth for iterating
  the console web.
- [`preview.html`](preview.html): a standalone, dependency-free implementation of
  the **Sessions** list page (app shell + sidebar + filter bar + table + status
  pills + pagination). It is the visual test that the document is faithful.
- [`preview-dropdown.html`](preview-dropdown.html): the Sessions page with the
  **Status filter dropdown open** (popover + selected item with blue check).
- [`preview-create-session.html`](preview-create-session.html): the
  **Create session modal** over the dimmed Sessions page (scrim, 720px dialog,
  form fields, credential-vault authorization box, disabled footer action).
- [`preview-session-detail.html`](preview-session-detail.html): the **session
  detail / transcript viewer** (breadcrumb + Ask Claude, meta chips, segmented
  controls, timeline scrubber, transcript rows with role pills, idle
  separators, and the right event-detail panel).

## Preview

`preview.html` uses only inline CSS and inline SVG (no build step, no network).
`file://` may be blocked by the browser; serve it over HTTP:

```sh
cd docs/references/claude-console
python3 -m http.server 8899
# open http://localhost:8899/preview.html
```

Validated at 1440px (desktop) and 390px (mobile).

## Note vs. the marketing-site design-md

There is a separate community `DESIGN.md` for the Claude **marketing** site
(parchment `#f5f4ed`, serif headlines, terracotta CTAs). That surface shares two
principles with the Console — warm-toned neutrals and ring-based (`0 0 0 1px`)
depth instead of drop shadows — but the Console is intentionally whiter and more
utilitarian: canvas `#FCFCFB`, serif only for the "Claude Console" wordmark, and
color reserved for status pills and model tiles. This folder documents the
**Console**, not the marketing site.
