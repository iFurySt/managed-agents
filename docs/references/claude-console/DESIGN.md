# Design System Inspiration of Claude Console

Reference: Anthropic Claude Console (`platform.claude.com`), the Managed Agents
control plane. Extracted from the logged-in product UI (Dashboard, Agents,
Sessions, Deployments, Environments, Quickstart) via computed styles, July 2026.
Primary mode: **light**. No distinct dark surface is used inside the console
shell, so only the light system is documented.

This document is the visual source of truth for iterating our own managed-agents
console web (`apps/console`).

## 1. Visual Theme & Atmosphere

- Quiet, information-dense operations console. Not marketing.
- Warm off-white "paper" canvas (`#FCFCFB`) with a slightly darker sidebar
  (`#F9F9F7`); the whole surface reads as soft neutral, never pure white.
- Almost no color: near-black text, warm gray secondary text, and hairline
  borders drawn with translucent black. Color appears only in small status
  pills, model art tiles, and the single black primary button.
- Depth is **border-first**: 1px translucent-black inset rings define cards,
  inputs, and pills. Drop shadows are essentially absent in the app shell.
- Compact control heights (28-36px), 12-13-14px type, tight vertical rhythm.
  The result feels native, calm, and fast to scan.
- Recognizable markers: the serif "Claude Console" wordmark in the sidebar,
  the workspace switcher pill at the top of the sidebar, dense list pages built
  from real HTML tables, and the single solid-black call-to-action per header.

## 2. Color Palette & Roles

Values are the observed computed colors. `#0B0B0B` is expressed by the app as
`srgb 0.043` (= `rgb(11,11,11)`); translucent variants reuse it at low alpha.

### Neutrals & Surfaces

- **Canvas** (`#FCFCFB`): main content background and card fill (cards share the
  canvas color and are separated only by their border ring).
- **Sidebar surface** (`#F9F9F7`): left navigation background.
- **Ink** (`#0B0B0B`): primary text, headings, active nav label, primary button
  fill.
- **Text secondary** (`#52514E`): section labels, `h3` card titles, table
  headers, subtitles, inactive-but-legible text.
- **Text muted** (`#898781`): meta text, empty-state text, placeholder-level
  copy.
- **Nav idle** (`#524F4E` / `srgb 0.322`): idle sidebar item and group label.
- **Border hairline** (`rgba(11,11,11,0.10)`): the universal 1px ring for cards,
  inputs, filter pills, and dividers. Usually drawn as `box-shadow: 0 0 0 1px
  inset` rather than a CSS border.
- **Border faint** (`rgba(11,11,11,0.05)`): active nav item background fill and
  neutral pill fill.
- **Sidebar divider** (`rgba(11,11,11,0.10)`, 0.5px right border on the sidebar).

### Brand / Action

- **Primary button fill** (`#0B0B0B`): solid near-black; text `#FFFFFF`. One per
  page header ("Build an agent", "Create environment", "Create session", etc.).
- **Accent tint (translucent white)** (`rgba(255,255,255,0.5)`): fill of
  secondary/filter controls over the canvas, combined with the hairline ring.
- **Workspace pill accent** (`#5B57D6` region, Inferred): the small cube glyph in
  the workspace switcher reads violet/indigo. Used only as a tiny icon accent.

### Status Colors (pills)

- **Success text** (`#006300`) on **success fill** (`#CAEAC7`): "Active".
- **Warning text** (`#734500`) on **warning fill** (`#F9DCA4`): "Paused".
- **Info/badge text** (`#184F95`): inline "New" / "Beta" labels (no fill, colored
  text only), and the "Updated" nav badge (light blue fill, Inferred `#DBEAFE`).
- **Neutral pill** text `#52514E` on fill `rgba(11,11,11,0.05)`: type tags such
  as "Cloud", "Self-hosted", and model capability tags.
- **Danger/link** (`#8E2626`): destructive-adjacent inline links such as
  "Turn on auto-reload", underlined with `rgba(142,38,38,0.4)`; also the Error
  badge text on fill `#FAD6D6`.

### Transcript Role Colors (session detail)

- **User rose** (`#C46686`, ticks at 0.8 alpha): User role pill fill and
  timeline tick, white text.
- **Agent blue** (`rgba(37,107,193,0.8)` ≈ `#256BC1`): Agent role pill fill and
  timeline tick, white text; the solid `#256BC1` is also the timeline playhead
  outline and focus-ring blue.
- **Tool neutral** (`#F6F6F4` fill, `#52514E` text; ticks
  `rgba(139,138,133,0.7)`).
- **Ask Claude spark** (`#D97757`): the only warm-orange accent, used for the
  starburst icon inside the black "Ask Claude" button.

### Model Art Tiles (Dashboard only)

- Blue `#5C93D6` (Inferred), Terracotta `#E08A63` (Inferred), Warm stone
  `#ECE7DE` (Inferred), Sage `#AEC4B4` (Inferred). Decorative only; do not use as
  UI status colors.

## 3. Typography Rules

### Font Family

- Primary: `anthropicSans` with fallback
  `system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Secondary: same sans; there is no separate display face except the serif
  wordmark.
- Wordmark: a serif face used only for the "Claude Console" wordmark
  (`anthropicSerif`, **16px / weight 500 / line-height 1**, ink color). Do not
  use serif elsewhere.
- Monospace: `anthropicMono` with fallback
  `ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`. Used for object IDs
  (`env_…`, `agent_…`, `sesn_…`, `dep_…`) and model slugs (`claude-sonnet-4-6`).

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Page title (`h1`) | Sans | 22px | 550 | 26px | normal | e.g. "Environments", "Good evening, Leo" |
| Wordmark ("Claude Console") | **Serif** | 16px | 500 | 1 (16px) | normal | only serif use in the app |
| Section heading (`h2`) | Sans | 15px | 580 | 20px | normal | e.g. "Models", "Resources" |
| Card title (`h3`) | Sans | 14px | 600 | 20px | normal | color `#52514E` |
| Body / default | Sans | 14px | 400 | 21px | normal | body color `#0B0B0B` |
| Table header | Sans | 13px | 550 | ~18px | normal | color `#52514E`, not uppercased |
| Table cell | Sans | 14px | 400 | 20px | normal | ink text |
| Subtitle / description | Sans | 14px | 400 | 20px | normal | color `#52514E` |
| Meta / muted | Sans | 14px | 400 | 20px | normal | color `#898781` |
| Pills / badges | Sans | 12px | 550 | ~16px | normal | status + tags |
| Inline label badge (New/Beta) | Sans | 12px | 550 | ~16px | normal | colored text, no fill |
| Nav item — top-level / group header | Sans | 14px | 550 | 20px | normal | Dashboard, API keys, Build, Managed Agents… (bold when unselected) |
| Nav item — child | Sans | 14px | 400 | 20px | normal | Sessions, Agents…; 36px row, icon↔label gap 12px, 4px row gap; active only changes color, not weight |
| User chip name | Sans | 14px | 550 | 20px | normal | sidebar footer, ink color |
| User chip role | Sans | 12px | 430 | 16px | normal | "Admin · …", color `#52514E` |
| Mono ID (table/breadcrumb) | Mono | 12px | 550 | ~16px | normal | object IDs — slightly bolder than body; falls back via `--fw-emphasis` |
| Mono meta (timestamps, event types, stats) | Mono | 12px | 400 | ~16px | normal | color `#898781` |
| Role pill (User/Tool/Agent) | Sans | 10px | 430 | 20px row | normal | transcript viewer |
| Primary button | Sans | 14px | 500 | 20px | normal | white on black |

**Important — variable font vs. fallback weight.** Claude Console loads
`anthropicSans` as a **variable font** (weight axis 300–800), so `550`/`580`
render as a genuine mid-weight. If that font is not available and the stack
falls back to `system-ui`, the browser **rounds `550`/`580` up to the nearest
static weight — usually `700` (full bold)** — which makes nav labels, headings,
and table headers look noticeably too heavy. When the Anthropic variable font is
not shipped, **map the "emphasis" weights (550/580) to `500`** in the fallback,
not `600`/`700`. Use `400` for regular and `500` for emphasis; reserve `600`+
only where the real UI is clearly heavier (e.g. large numeric figures). Keep the
`550`/`580` values in this doc as the design intent, but implement them through a
single `--fw-emphasis: 500` token when the variable font is missing.

## 4. Component Stylings

### Buttons

- **Primary (solid)**: fill `#0B0B0B`, text `#FFFFFF`, radius `8px`, height
  `32px`, padding `0 12px`, font 14px/500, no shadow. Optional leading icon at
  16px, `gap: 8px`. Hover (Inferred): slight lift to `#1A1A1A`.
- **Secondary / ghost**: transparent-to-`rgba(255,255,255,0.5)` fill, hairline
  ring `box-shadow: 0 0 0 1px inset rgba(11,11,11,0.1)`, text `#0B0B0B`, radius
  `8px`, height `32px`, padding `0 12px`, font 14px/500. Used for "Get API key".
- **Small dark button** (in-banner "Learn more"): fill `#0B0B0B`, text white,
  radius `7px`, height `28px`, padding `0 10px`, font 14px/500.
- **Icon button**: 28-32px square, transparent, icon color `#89857F`, radius
  `7px`; hover fill `rgba(11,11,11,0.05)`.
- **Pagination arrows**: **32×32 rounded-rect boxes**, radius `8px`, fill
  `rgba(255,255,255,0.1)`, with a hairline inset ring **plus a soft shadow**:
  `box-shadow: inset 0 0 0 1px rgba(11,11,11,0.1), 0 1px 2px rgba(0,0,0,0.05)`.
  Glyph ink `#0B0B0B` at 16px; disabled state dims the whole button to
  `opacity: 0.5`. Placed as a `< >` pair with `gap: 8px` below the table.
  (Note: the ring/fill live on an inner span in the real DOM — probing the outer
  `<button>` reports `box-shadow: none`, which previously led to a wrong
  "ghost button" reading. They ARE boxed.)

### Cards & Containers

- Fill = canvas `#FCFCFB` (no contrast fill). Separation = `box-shadow: 0 0 0 1px
  inset rgba(11,11,11,0.1)`.
- Radius `12px`. Padding `20px`. No drop shadow.
- Dashboard metric cards sit in a 3-up row; a wide card (Token volume) spans the
  row below. Model tiles are 4-up with a colored art header band (~`120px` tall,
  radius `12px` top) over a white body listing name + capability tags.
- Resource cards: hairline ring, `16-20px` padding, icon + title + one-line
  description, radius `12px`.

### Inputs & Forms

- Search field: wrapper height `32px`, radius `8px`, hairline ring, fill
  transparent/`rgba(255,255,255,0.5)`, padding `0 12px`, `gap: 8px` between
  prefix and input. Placeholder text muted (`#898781`), input text `#0B0B0B`,
  font 14px.
- **Search prefix varies by page**: Agents/Deployments/Environments use a
  16px magnifier glyph in `#89857F` (rendered as an icon-font glyph ``,
  not an SVG). **Sessions uniquely uses a plain "ID" text prefix** (14px,
  `#898781`, weight 400) because it searches by session ID.
- The `<input>` itself is borderless; the ring lives on the wrapper.
- Modal form fields (text input / select): height `36px`, radius `8px`,
  hairline ring, fill `rgba(255,255,255,0.5)`, padding `0 12px`; selects show
  the value + a muted 14px chevron; removable values swap the chevron for a
  muted `×`.
- Focus (Inferred): ring darkens to `rgba(11,11,11,0.25)` or a 2px focus ring.

### Tables (list pages)

- **ID cell**: `anthropicMono` **12px / weight 550**, ink — slightly bolder
  than body text (use the `--fw-emphasis` fallback mapping below). The ID is a
  link; a small copy button (20px, muted `#898781` icon) fades in on row hover.
- **Reference chip** (Agent column, also env/agent chips on detail pages): a
  hoverable chip — `border: 0.5px solid rgba(11,11,11,0.1)`, radius `5.5px`,
  padding `2px 6px`, `gap: 6px`, 14px icon + 14px text both `#52514E`,
  transparent fill. Hover: fill `rgba(11,11,11,0.05)` and text darkens to ink.
- **Time/Created column**: text secondary `#52514E` (visibly lighter than the
  ink Name column).
- **Row menu `⋮`**: the dots are **ink/near-black `#0B0B0B`** (not muted), in a
  28px icon button; hover fill `rgba(11,11,11,0.05)`.
- Row hover: `rgba(11,11,11,0.05)` across the row.

### Dropdown menu (filter, open state)

- Popover: white `#FFFFFF`, radius `12px`, padding `6px`, hairline ring + soft
  drop shadow (`0 0 0 1px rgba(11,11,11,0.1), 0 4px 16px rgba(0,0,0,0.08)`),
  min-width ~`192px`, opens `4px` below the trigger.
- Items: height `32px`, padding `4px 12px`, radius `8px`, 14px ink text.
  Hover: fill `rgba(11,11,11,0.05)`. **Selected item**: same faint fill plus a
  right-aligned **blue check `#184F95`** (16px).

### Modal dialog (Create session)

- Scrim `rgba(0,0,0,0.4)`; modal width `720px`, white, radius `12px`, padding
  `24px`, ring + soft shadow.
- Title 22px/580 ink + close icon button top-right; subtitle 14px `#52514E`.
- Field blocks stack with `20px` gaps: label row (label 14px/550 ink, optional
  right-aligned **blue link `#184F95`** "Manage agents ↗" with a 12px external
  arrow) above a 36px field.
- Authorization warning box (credential vaults): amber fill `#F7E3B4`
  (tint of the warning family), radius `8px`, padding `12px`, leading checkbox,
  14px ink text.
- Footer: right-aligned primary button; **disabled = `opacity: 0.5`** on the
  solid black button.

### Session detail page (transcript viewer)

- **Breadcrumb row**: "Sessions" (14px muted, hover ink) `/` mono ID
  (13px, emphasis weight, ink). Right-aligned: "Actions ▾" secondary button +
  a black primary **"Ask Claude"** button with an orange starburst icon
  (`#D97757`).
- **Title block**: h1 22px/550 + status pill inline; below it a meta row (14px
  `#52514E`): agent reference chip · environment chip · duration (timer icon) ·
  tokens `in / out` · relative time, separated by `·` dots.
- **Segmented control** (Transcript | Debug): container height `28px`, padding
  `1px`, radius `7px`, fill `rgba(11,11,11,0.05)`; active segment white fill,
  radius `6px`, hairline ring + `0 1px 2px rgba(0,0,0,0.04)`, ink text; idle
  segment text `#52514E`. A small 12px variant (Rendered | Raw | Deltas) is
  `24px` tall, radius `6px`.
- **Toolbar**: segmented control, 1px divider, "All events ▾" filter (28px),
  search icon button; right-aligned icon buttons (shortcuts / copy / download).
- **Timeline scrubber**: full-width track, height `28px`, radius `8px`, fill
  `#F6F6F4`; event ticks are `24px` tall rounded-`4px` bars — User rose
  `rgba(196,102,134,0.8)`, Tool gray `rgba(139,138,133,0.7)`, Agent blue
  `rgba(37,107,193,0.8)`; idle stretches render as faint diagonal hatching;
  the playhead is a white bar with a 2px blue `#256BC1` outline.
- **Two panes** under a full-width hairline: transcript list (left, ~58%) and
  a detail panel (right, ~42%, hairline left border, `16px 24px` padding).
- **Transcript rows**: height `36px`, padding `0 32px`, hover
  `rgba(11,11,11,0.05)`, **selected `rgba(11,11,11,0.10)`** (stronger than
  hover). Row = role pill + text (tool rows: tool name in ink + command in
  muted) + optional badges + mono 12px muted stats (tokens, duration) +
  right-aligned mono 12px muted timestamp.
- **Role pills**: 10px / weight 430, height `20px`, padding `0 6px`, radius
  `6px` — User white on rose `#C46686`; Tool `#52514E` on `#F6F6F4`; Agent
  white on blue `rgba(37,107,193,0.8)`.
- **Error badge**: 10px/550, height `16px`, padding `0 4px`, radius `4px`,
  `#8E2626` on `#FAD6D6`, with a small ⊗ icon.
- **Idle separators**: full-width rows, height `24px`, radius `6px`, border
  `1px solid rgba(31,31,30,0.08)`, faint diagonal-hatch fill, centered 12px
  muted label ("Session idle · 6m 46s").
- **Detail panel**: header = role pill + event kind (16px emphasis) + close
  button; a mono 12px muted id/timestamp line + the small segmented control;
  then per-event blocks: mono 12px muted event type (`agent.message`) with a
  right-aligned underlined mono link (`sevt_… ↗`) and timestamp; rendered
  content sits in a card (`#FAFAF8`, radius `8px`, hairline ring, `16px`
  padding) — tables inside use 12px cells, hairline cell borders, mono values
  in faint code chips.

### Navigation

- Left sidebar, width ~`245px`, fill `#F9F9F7`, right edge `0.5px` hairline. The
  scrollable nav region and footer use `12px` horizontal padding.
- Top: serif "Claude Console" wordmark (16px/500, ink) + search icon +
  sidebar-collapse icon. The wordmark row sits at `12px` inset with `~12px`
  bottom padding.
- Below: workspace switcher — a full-width pill (radius ~`10px`, hairline ring)
  with a small violet cube glyph, "Default", and a chevron.
- Nav items: height `36px`, radius `8px`, padding `0 8px`, 14px text, leading
  icon at 16px with a **`12px` gap** between icon and label. Items are stacked in
  a flex column with a **`4px` vertical gap** between rows.
  - **Font weight rule**: top-level items (Dashboard, API keys) and group
    headers (Build, Managed Agents, Analytics, Claude Code, Manage) are
    **weight 550** — bold even when not selected. Child items (Quickstart,
    Agents, Sessions, Deployments, Limits, …) are **weight 400**.
  - Group headers show a chevron and are collapsible; child items are indented
    (`padding-left: 40px`).
  - **Idle item**: text `#524F4E`, transparent background.
  - **Active item**: text `#0B0B0B`, background `rgba(11,11,11,0.05)`, radius
    `8px`. **Active does not change the font weight** — a child stays weight
    400 when active; only its color darkens to ink and it gains the faint fill.
  - Hover (Inferred): background `rgba(11,11,11,0.05)`.
- Sidebar footer: "Documentation", "Credits $3.10", and a **user chip**. The
  chip is ~`48px` tall, padding `6px 8px`, radius `8px`, `12px` gap; it holds a
  **32×32** rounded-`6px` avatar filled with `rgba(11,11,11,0.05)` (**no ring**),
  a name line (14px/550 ink) and a role line ("Admin · …", 12px `#52514E`), and
  a trailing chevron. Footer rows ("Documentation", "Credits") are 36px with a
  `12px` icon↔label gap.
- Global top banner (dismissible): full-width, hairline bottom, info icon +
  message on the left, small dark "Learn more" button + close "×" on the right.

### Badges / Tags

- **Status pill**: radius `5px`, padding `0 8px`, font 12px/550, colored text on
  a tinted fill (success/warning above). Height ~`18-20px`.
- **Neutral tag pill**: radius `5px`, padding `0 8px`, fill `rgba(11,11,11,0.05)`,
  text `#52514E`, 12px/550. Used for type ("Cloud", "Self-hosted") and model
  capability tags ("Most capable", "Coding").
- **Inline label** ("New", "Beta"): colored text `#184F95`, no fill, 12px/550,
  placed immediately after a title.
- **Version chip** ("v2"): small neutral mono-ish chip next to agent name in
  deployment rows.

### Links / Interactive States

- Default text links are ink or secondary and underline on hover (Inferred).
- Footer links ("API status", "Help and support", "Feedback"): muted `#52514E`,
  underlined, 14px, centered.
- Destructive-adjacent link: danger red `#8E2626` with a low-alpha underline.
- "Compare models" style link: secondary color, underlined.

## 5. Layout Principles

### Page Composition

Two-column app shell:

1. Fixed left sidebar (~`245px`, `#F9F9F7`, hairline right edge) with wordmark,
   workspace switcher, scrollable nav groups, and footer chips.
2. Main region on canvas `#FCFCFB`, starting with the optional global banner,
   then the page content.

**Dashboard** page order: greeting `h1` + header actions (book icon, "Get API
key" secondary, "Build an agent" primary) → 3 metric cards → wide "Token
volume" card → "Models" section (4 art tiles) → "Resources" section (4 cards) →
centered footer links.

**List pages** (Agents, Sessions, Deployments, Environments) order: `h1` +
one-line subtitle on the left, primary "Create …" + docs icon on the right →
filter bar (search input + filter dropdowns like Created/Status/Agent/
Deployment) → full-width table → pagination arrows. Empty rows render an en dash
`–`.

**Quickstart**: top numbered stepper ("1 Create agent POST /v1/agents → 2
Configure environment → 3 Start session → 4 Integrate"), a centered "What do you
want to build?" prompt with a bottom composer input, and a right "Browse
templates" panel (searchable 2-column template cards with integration icons and
"Recurring" tags).

Content hierarchy rule: object title first, then status/type/agent/tokens/
created metadata in adjacent table columns; IDs render in monospace.

### Spacing System

- Base unit 4px. Common steps: 4, 8, 12, 16, 20, 24, 32.
- Control inner padding `0 8px` (nav, filters) to `0 12px` (buttons).
- Card padding `20px`; content top padding `~48px` on dashboard, `24px` on list
  pages; content horizontal padding `24px`.
- Table cell padding `8px 12px`; header-to-first-row gap tight.
- Section vertical gap ~`24-32px`.

### Grid & Container

- Content max width `1600px` (list pages), centered with `24px` side padding;
  the dashboard content column is narrower (`max-width: 960px`, `px-4`).
- Dashboard metric cards: 3-column grid, `~12-16px` gap. Model tiles and
  resource cards: 4-column grid. Quickstart templates: 2-column grid.
- Tables are full width within the content container.

### Section Rhythm

- Each section = 15px/580 heading (optionally with a right-aligned link like
  "Compare models") + grid/table body, separated by `24-32px`.

### Border Radius Scale

- `5px`: status/tag pills.
- `7px`: small buttons (banner CTA), icon buttons.
- `8px`: standard buttons, inputs, filter controls, nav items.
- `10px`: workspace switcher pill (Inferred).
- `12px`: cards, model tiles, resource cards.

## 6. Depth & Elevation

Border-first system. Prefer inset rings over shadows.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | no border, no shadow | plain text blocks, table cells |
| Ring 1 | `box-shadow: 0 0 0 1px inset rgba(11,11,11,0.10)` | cards, inputs, filter pills, secondary buttons |
| Divider | `0.5px`–`1px` hairline `rgba(11,11,11,0.10)` | sidebar right edge, banner bottom, row separators |
| Fill emphasis | background `rgba(11,11,11,0.05)` | active nav item, neutral tag pills |
| Solid | fill `#0B0B0B` | single primary button per header |
| Boxed control | inset ring + `0 1px 2px rgba(0,0,0,0.05)`, fill `rgba(255,255,255,0.1)` | pagination arrows, segmented-control active segment |
| Popover | ring + `0 4px 16px rgba(0,0,0,0.08)`, radius `12px`, padding `6px` | dropdown menus, row `⋮` action menus |
| Modal | ring + large soft shadow, radius `12px`, scrim `rgba(0,0,0,0.4)` | Create session dialog |

## 7. Do's and Don'ts

### Do

- Use the warm neutral canvas `#FCFCFB` with a slightly darker sidebar
  `#F9F9F7`; keep surfaces off-white, never pure `#FFFFFF`.
- Separate surfaces with 1px inset translucent-black rings, not drop shadows.
- Keep exactly one solid-black primary action per page header; everything else
  is ghost/secondary.
- Build list pages from real tables: mono IDs, then name, then status/type/meta
  columns, then a trailing `⋮` action button.
- Use `5px` tinted pills for status and neutral `rgba(11,11,11,0.05)` pills for
  types/tags.
- Keep controls compact (28-36px) and type small (12-14px).
- Render object IDs and model slugs in monospace.
- Provide search + filter dropdowns consistently on every list page.
- Use an en dash `–` for empty cells.

### Don't

- Don't use heavy drop shadows, large radii (>12px), or bright saturated brand
  fills in the app shell.
- Don't use serif anywhere except the "Claude Console" wordmark.
- Don't add multiple competing primary buttons in one header.
- Don't uppercase table headers or use all-caps labels.
- Don't turn list pages into card grids; cards are for dashboard summaries and
  repeated tiles only.
- Don't rely on color alone for status — always pair tint + colored text label.

## 8. Responsive Behavior

Observed at desktop (~1800px). Mobile behavior is Inferred from the layout:

- Breakpoint ~`768px`: sidebar collapses behind the sidebar-toggle icon already
  present in the header; main region goes full width.
- Card grids collapse: 3-up and 4-up → 2-up at tablet, 1-up at phone.
- Tables become horizontally scrollable or collapse secondary columns
  (Tokens/Created) first, keeping ID + Name + Status.
- Page header stacks: title/subtitle above, primary action becomes full-width or
  icon-only.
- Control heights and type sizes stay the same (already compact); touch targets
  rely on the 32-36px control heights.
- Content max width caps at `1600px`; on wide screens it stays centered with
  `24px` gutters.

## 9. Agent Prompt Guide

- **Primary colors**: canvas `#FCFCFB`, sidebar `#F9F9F7`, ink `#0B0B0B`,
  secondary text `#52514E`, muted `#898781`, hairline `rgba(11,11,11,0.1)`,
  primary button `#0B0B0B`/white. Status: Active `#006300` on `#CAEAC7`, Paused
  `#734500` on `#F9DCA4`, info `#184F95`, danger `#8E2626`.
- **Key type rules**: `anthropicSans` (system-ui fallback) everywhere; serif only
  for the "Claude Console" wordmark; `anthropicMono` for IDs and model slugs.
  h1 22px/550, section 15px/580, body 14px/400, table header 13px/550, pills
  12px/550.
- **Core component rules**: border-first depth via `box-shadow: 0 0 0 1px inset
  rgba(11,11,11,0.1)`; cards radius 12px/20px padding on canvas fill; buttons
  radius 8px height 32px; one solid-black primary per header; ghost secondary
  with ring; pills radius 5px, `0 8px`; nav items 36px radius 8px, active fill
  `rgba(11,11,11,0.05)`.
- **Page structure**: ~245px left sidebar (wordmark, workspace switcher pill,
  collapsible nav groups, footer chips) + canvas main; list pages = title +
  subtitle + right primary action, filter bar (search + dropdowns), full-width
  table (mono ID, name, status/type/meta, `⋮`), pagination; dashboard = greeting
  + metric cards + model tiles + resource cards.
- **Short prompt**: "Build a quiet, information-dense light-mode ops console.
  Warm off-white canvas `#FCFCFB`, slightly darker `#F9F9F7` sidebar (~245px)
  with a serif 'Claude Console' wordmark, a workspace switcher pill, and
  compact 36px nav rows (active = `rgba(11,11,11,0.05)`). Near-black `#0B0B0B`
  text in `anthropicSans`/system-ui, monospace IDs. Separate every surface with
  1px inset `rgba(11,11,11,0.1)` rings, no drop shadows. Cards radius 12px /
  20px padding on the canvas fill. One solid-black primary button per page
  header; other controls are ghost with a hairline ring, 32px tall, radius 8px.
  List pages are real tables (mono ID, name, status pill, type pill, meta,
  trailing `⋮`) with a search + filter-dropdown bar and pagination arrows.
  Status pills radius 5px: Active green `#006300`/`#CAEAC7`, Paused amber
  `#734500`/`#F9DCA4`, neutral tags `#52514E` on `rgba(11,11,11,0.05)`."
