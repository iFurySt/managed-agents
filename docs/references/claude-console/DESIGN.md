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
- **Danger button fill** (`#D03B3B`, text white, hover `#B83232`): the solid
  confirm button in destructive confirmation dialogs ("Archive agent", delete
  dialogs). Distinct from the darker inline danger-link red above — this is a
  saturated solid button fill, not a text/tint pairing.

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
- **Small secondary button** (e.g. "Generate" under a describe-agent textarea):
  same ring + fill language as Secondary/ghost, scaled down — radius `7px`,
  height `~28px`, padding `0 10px`, font 14px/550. Disabled state dims the
  whole pill to `opacity: 0.5` — it still shows the ring, it does not disappear
  into plain text. **Don't** render this as a bare `ghost` (text-only, no ring)
  button; both idle and disabled states need the visible ring/fill or the
  control reads as broken/invisible.
- **Guardrail — idle fill must not out-rank hover/active**: when a button's
  idle background is set with an `!important`-style override (e.g. a
  one-off `!bg-white/50`), any `hover:`/`active:` background must be given the
  **same** override weight, or the idle fill permanently wins and the button
  never visibly reacts to hover or press. If you need a one-off idle fill,
  add matching one-off hover/active fills alongside it.
- **Guardrail — one-off fills always need `!important`, even without an
  explicit `variant`**: the shared `Button` component defaults to
  `variant="primary"` (`bg-ink hover:bg-black`) whenever no `variant` prop is
  passed. A call site that adds a custom `bg-[#hex]`/`hover:bg-[#hex]` on top
  of that default — e.g. a danger-confirm button — is not guaranteed to win
  the cascade against the default's plain `bg-ink`/`hover:bg-black`; Tailwind
  orders same-specificity utilities by generation order, not by position in
  the class string, so which one renders is arbitrary and has regressed to
  plain black more than once. Any one-off `bg-[...]`/`hover:bg-[...]` on a
  `Button` (danger confirms, the session-message send button, etc.) must use
  `!bg-[...]`/`hover:!bg-[...]`, the same rule as the idle/hover pairing
  above — don't assume an unstyled default variant is "safe" to override
  without `!`.
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
  description, radius `12px`. Form controls inside resource cards use the same
  modal field treatment as the rest of Create Session: `35-36px` height,
  `8px` radius, hairline border, white fill, and the Claude-blue focus ring.
  Select-like controls such as Checkout, Access, and Memory store include the
  muted chevron, open a real option menu, and update their displayed value when
  an option is selected. They must not use the warm amber/orange warning color
  as focus affordance. Required markers inside these resource forms are a small
  red asterisk immediately after the label text, not the same muted label color.

### Inputs & Forms

- Search field: wrapper height `32px`, radius `8px`, hairline ring, fill
  transparent/`rgba(255,255,255,0.5)`, padding `0 12px`, `gap: 8px` between
  prefix and input. Placeholder text muted (`#898781`), input text `#0B0B0B`,
  font 14px.
- **Search clear button**: when the input has a value, a small clear button
  (`aria-label="Clear search"`) appears inside the field on the right — a
  ~22px square ghost icon button with an ink `×` glyph. Clicking it empties
  the input and the button disappears.
- **Search prefix varies by page**: Agents/Deployments/Environments use a
  16px magnifier glyph in `#89857F` (rendered as an icon-font glyph ``,
  not an SVG). **Sessions uniquely uses a plain "ID" text prefix** (14px,
  `#898781`, weight 400) because it searches by session ID.
- The `<input>` itself is borderless; the ring lives on the wrapper.
- Modal form fields (text input / select): height `36px`, radius `8px`,
  hairline ring, fill `rgba(255,255,255,0.5)`, padding `0 12px`; selects show
  the value + a muted 14px chevron; removable values swap the chevron for a
  muted `×`.
- Focus: no browser outline; border darkens to about `rgba(11,11,11,0.2)`
  and a Claude-blue focus treatment appears as
  `0 0 0 1px inset #fcfcfb, 0 0 0 1px #2a78d6, 0 0 6px 1px #cde2fb`.

### Tables (list pages)

- **Responsive overflow contract**: the page shell and `body` do not carry a
  fixed desktop `min-width`. The table wrapper is `min-width: 0; width: 100%;
  overflow-x: auto; overflow-y: hidden`; the `<table>` can keep a content
  floor with `min-width` (for example Environments is roughly `913px`) plus
  `width: 100%`. This makes split-screen/narrow layouts scroll inside the
  table area instead of widening the whole page.
- **Full-row navigation**: every list row with a detail page navigates to that
  object's detail route when a non-interactive part of the row is clicked.
  Implement this in the shared table primitive, not per-cell, so ID text,
  whitespace, status/type/meta cells, and name cells all share the behavior.
  Interactive elements inside the row — selection checkbox, ID copy button,
  row `⋮` menu, filter/input controls, and explicit links/buttons — keep
  their own behavior and must not trigger row navigation.
- **ID cell**: `anthropicMono` **12px / weight 550**, ink — slightly bolder
  than body text (use the `--fw-emphasis` fallback mapping below). The ID is a
  link; a small copy button (20px, muted `#898781` icon) fades in on row hover.
- **ID copy button feedback**: hovering the copy button shows a tooltip
  labeled "Copy" (see Tooltip below). On click, the copy glyph swaps to a
  check glyph and the tooltip text changes to "Copied"; after **~2s** the
  icon reverts to the copy glyph and the tooltip (if still hovered) reads
  "Copy" again. No toast/snackbar is used — feedback is local to the button.
  This same check+tooltip feedback rule applies to **every** copy affordance
  in the app (code-block copy buttons, dropdown-menu "Copy ID" items, etc.),
  not just table ID cells — a single shared component/hook should back all of
  them so the timing and wording never drift.
- **Detail-page header ID (breadcrumb-adjacent)**: unlike the list ID cell,
  the object ID shown under a detail page's `h1` is **not** paired with a
  separate copy icon. The ID text itself is the control: `role="button"`,
  hover fill `rgba(11,11,11,0.05)` on the text (small `-mx-1 -my-0.5` inset
  so the hover fill doesn't touch neighboring text), click copies and shows
  the same Copy/Copied tooltip feedback. Use this pattern for every detail
  page (agent, session, deployment, environment, vault, memory store, file),
  not only the ones a bug report happens to mention.
- **Reference chip** (Agent column, also env/agent chips on detail pages): a
  hoverable chip — `border: 0.5px solid rgba(11,11,11,0.1)`, radius `5.5px`,
  padding `2px 6px`, `gap: 6px`, 14px icon + 14px text both `#52514E`,
  transparent fill. Hover: fill `rgba(11,11,11,0.05)` and text darkens to ink.
- **Time/Created column**: text secondary `#52514E` (visibly lighter than the
  ink Name column).
- **Row menu `⋮`**: the dots are **ink/near-black `#0B0B0B`** (not muted), in a
  28px icon button; hover fill `rgba(11,11,11,0.05)`.
- Row hover: `rgba(11,11,11,0.05)` across the row. Selected/active rows use
  the stronger `rgba(11,11,11,0.10)`.
- **Header/body divider is a single hairline, not two.** The header row's own
  `border-bottom` (`rgba(11,11,11,0.10)`) is the only rule between the header
  and the first body row — the first body row must not also carry a
  `border-top`. With `border-collapse: separate` (used so row corners can be
  rounded on hover/select), two adjacent 1px borders stack instead of merging,
  which visibly doubles the line thickness right under the header. Every
  other row boundary already gets a single line from that row's own
  `border-bottom`; keep it that way instead of adding a matching `border-top`
  on the row below.

### Tooltip

- Small ink-on-dark tooltip used on icon buttons (e.g. the ID copy button):
  fill `#0B0B0B`, text `#FFFFFF`, radius `6px`, padding `3px 8px` (~24px
  tall), font 13px / line-height 18px / weight 400, opens on the `bottom`
  side with a `4px` offset, subtle scale/opacity enter transition.

### Filter dropdown trigger (Created / Status / Agent …)

- The trigger is a 32px pill (hairline ring, `rgba(255,255,255,0.5)` fill)
  containing a muted label ("Created"), the selected value in ink, and a
  muted chevron. **Width is content-driven — do not fix it.** The pill grows
  and shrinks to fit the selected value (e.g. "All time" → "Last 24 hours"),
  so long options never overflow the ring.

### Dropdown menu (filter, open state)

- Popover: white `#FFFFFF`, radius `12px`, padding `6px`, hairline ring + soft
  drop shadow (`0 0 0 1px rgba(11,11,11,0.1), 0 4px 16px rgba(0,0,0,0.08)`),
  min-width ~`192px`, opens `4px` below the trigger.
- Items: height `32px`, padding `4px 12px`, radius `8px`, 14px ink text.
- **Selection reads via checkmark only — same rule as the version/value-picker
  below.** Item background changes **only on hover/highlight**
  (`rgba(11,11,11,0.05)`); do **not** give the currently-selected item a
  permanent background fill. A persistent fill on the selected row (as opposed
  to only-on-hover) collapses "which one is hovered" vs "which one is
  selected" into one color and does not match the live product. The
  right-aligned **blue check `#184F95`** (16px) is the only marker for "this
  is the current value."
- Filter popovers are mutually exclusive within a filter bar. Opening one
  filter closes the previously-open filter, and clicking outside the active
  filter or pressing Escape closes it. Do not allow two filter popovers, such
  as Deployment and Status, to remain open at the same time.

### Searchable filter dropdown (Agent / Deployment / Environment / Vault filters)

- Same trigger and popover chrome as the plain filter dropdown above, but used
  when the option list is a growable reference collection (agents,
  deployments, environments, vaults) rather than a small fixed enum
  (Created/Status). A search input replaces the popover's top padding: full
  width, `~37px` tall, bottom hairline border `rgba(11,11,11,0.1)` as the only
  separator from the list (no other borders), placeholder like "Search agents
  by name or exact ID", `14px` text, no icon.
- List items below the search input show the object's **name** (14px, ink)
  stacked above a muted **13px** "Jun 16"-style updated/created caption — not
  a single-line label. Hover: fill `rgba(11,11,11,0.05)` only — same
  checkmark-only selection rule as the other two dropdown variants above (no
  permanent background on the selected row). The reference screenshot only
  shows this filter with its default/fallback value active (no named item
  selected), so the checkmark's exact presence here isn't directly confirmed
  by a screenshot — apply the same rule as the rest of the app for
  consistency rather than a separate unverified pattern.
- This is the same popover pattern already used for the agent/environment/
  vault pickers inside the Create Session and Create Deployment dialogs
  (search input + name/date item) — reuse one shared component/markup for
  both instead of re-deriving it per page.

### Multi-select filter dropdown (Sessions Status)

- Same trigger and popover chrome as the plain filter dropdown above, but used
  when one filter value represents several underlying lifecycle states. The
  Sessions Status filter defaults to `Running`, `Idle`, and `Rescheduling`
  checked, while the trigger summary reads **"Status Active"**.
- Menu rows are `32px` high with a leading checkbox and label. Checked boxes
  are blue (`#2a78d6`) with a white check; unchecked boxes are white with a
  subtle black hairline border. Row hover uses the same
  `rgba(11,11,11,0.05)` fill as the other filter dropdowns.
- Toggling a checkbox does **not** close the menu. Keep at least one option
  selected so the trigger and API query never fall into an ambiguous empty
  state. If the selection no longer matches the named Active set, summarize
  as the single selected label or "`N selected`".

### Version / value-picker dropdown (single current value, e.g. "Version: v2")

- Distinct from the filter dropdown above: this picks **one current value**
  out of a history list (agent/skill versions), it does not toggle a filter.
  Trigger: same 32px pill, but render the value in `anthropicMono` at 13px so
  it visually separates from the "Version:" label instead of reading as one
  run-on word; keep the label↔value gap at `gap-1` (4px, baseline-aligned).
- **Selection reads via checkmark only.** Item background changes **only on
  hover/highlight** (`rgba(11,11,11,0.05)`); do **not** give the
  currently-selected item a permanent background fill — that collapses the
  "which one is hovered" vs "which one is selected" distinction into one
  color. The checkmark (`#184F95`, 20px, right-aligned) is the only marker
  for "this is the current value."
- Each item shows the version/value (mono, 14px, ink) stacked above a muted
  13px "Created …" caption. Popover width ~`256px`.
- The list must render every entry the object actually has (map over the full
  version history), not a single hard-coded current-value item — the whole
  point of the control is to browse past values once more than one exists.
- **Selecting a past entry re-renders the page's content with that entry's
  snapshot** (model, system prompt, etc.) — this is a real value-switch, not a
  label-only affordance. The live product shows a brief loading state while it
  refetches; the local console instead swaps instantly from data already
  fetched with the object (every version's editable-field snapshot comes back
  in the same response as the object itself), which is an acceptable
  implementation difference as long as the displayed fields visibly change.
  Editing/saving a new version always edits from the **current** value, not
  whichever historical entry happens to be selected in the dropdown.

### Code editor / config panel (Create agent, Edit agent)

- YAML/JSON config panels wrap long lines (no horizontal scrollbar) and
  render a **line number per source line**, `anthropicMono` 13px muted
  (`#898781`), right-aligned in a ~`28px` slot. The number sits directly on
  the panel's own canvas — **no background fill, no border/rule** separating
  it from the code (confirmed against the live product: there is no `#FAFAF8`
  gutter panel or hairline divider, the number just floats to the left of the
  text). A wrapped line's continuation row(s) get **no number** — only the
  line's first visual row shows one, and the row simply grows taller to fit
  the wrapped text; the next source line's number still lines up correctly
  underneath because it's the following line's own row, not a separately
  laid-out gutter cell.
- **Guardrail — don't build the gutter as an independent scrolling column.**
  A flat list of one `<div>` per source line (a classic "gutter" component,
  separate from the code content) can only stay aligned with the content if
  every line is exactly one visual row tall. The moment content wraps, that
  breaks — the gutter must either stop the content from wrapping (which
  contradicts the reference, which does wrap) or the gutter and content
  fatally desync. The correct construction is to render **one block per
  source line that contains both the number and that line's text together**
  (e.g. the number absolutely positioned via `right: 100%` inside a
  `position: relative` line wrapper, sitting in the block's own reserved
  left padding) so the browser's normal block flow grows the row to fit
  wrapped text automatically — no scroll-sync JS needed at all for the
  read-only case. For the editable case (a real `<textarea>` overlaid with a
  colorized read-only copy for syntax highlighting), give the invisible
  `<textarea>` the **same left padding** as the visible line blocks reserve
  for their numbers, so its wrap points and the overlay's wrap points match
  exactly and clicks/caret position land on the correct character; only
  vertical scroll needs syncing (via `scrollTop` → `translateY`), since
  wrapped content never overflows horizontally.
- Format toggle (YAML | JSON) is a small segmented control in the panel
  header, `rgba(11,11,11,0.05)` track, white active-segment pill, radius
  full/pill. A copy-code icon button sits at the header's trailing edge,
  **always visible** (not hover-revealed) since it's part of a persistent
  toolbar, not an overlay on read-only text.
- Editor toolbar controls share one interaction rule: hover fill
  `rgba(11,11,11,0.05)`, active/pressed fill the same, and press feedback uses
  `transform: scale(0.975)` with a short `~100ms` transition. Do not use
  one-off fills such as `#EEEEEB`, and do not suppress hover with transparent
  overrides on editor select triggers.
- Environment section add controls use a visible `32px` bordered icon button:
  white fill, `8px` radius, `1px rgba(11,11,11,0.1)` border, and a very soft
  `0 1px 2px rgba(0,0,0,0.02)` shadow. Row-level remove/trash icon buttons
  stay unboxed.
- Environment editor select fields use the boxed field treatment from the
  live console, not transparent inline triggers: `32px` height, `8px` radius,
  `rgba(255,255,255,0.5)` fill, and `inset 0 0 0 1px rgba(11,11,11,0.1)`.
  The select button inside remains transparent with `8px` left padding.
- Environment package rows start as one `36px` row: a fixed-width manager
  select, `8px` gap, a bordered package input wrapper (`min-height: 36px`,
  white fill, `8px` radius, `1px rgba(11,11,11,0.1)` border, `4px 8px`
  padding), another `8px` gap, then a `32px` icon delete button. Package
  chips live inside the bordered wrapper before the text input and wrap onto
  additional lines as values accumulate. The section-level `+` button appends
  another package row with no manager selected; the manager select shows a
  muted placeholder until the user chooses a package manager. The draft input's
  placeholder is only shown while that row has no package chips. Package chips
  use the reference's compact code-token treatment: `0.5px` neutral border,
  `#F6F6F4` at roughly 50% opacity, `6px` radius, `2px 8px` padding, `4px`
  internal gap, and mono `13px`/`19.5px` text. The chip close control is a bare
  `12px` muted icon with text-only hover; do not add a circular hover fill.
- Environment read-only package values render one bordered row per package
  manager row, not one flattened paragraph. Each row is a `37px` minimum
  rounded box with `0.5px rgba(11,11,11,0.1)` border, warm-gray `#F9F9F7`
  fill, `12px 8px` internal padding, and mono `13px/20px` secondary text formatted as
  `manager: package package`. Persist row grouping as package rows and serialize
  the legacy `packages` text as newline-separated display rows for older
  consumers.
- Environment metadata rows use two equal-width `36px` inputs plus an aligned
  `32px` delete button with `8px` gaps. Save/Cancel sit in a right-aligned
  footer: Cancel is the white/ring secondary button and Save changes is the
  solid black primary button. Read-only metadata uses the same row structure as
  the reference: a single rounded bordered table, one `37px` row per key/value
  pair, horizontal `0.5px` separators, two equal columns, muted key text and ink
  value text in mono `14px/20px`.
- Read-only code surfaces embedded in prose (e.g. the agent detail page's
  "System prompt" block) are the opposite case: the copy button there is
  **hover-revealed** (`opacity-0` → `opacity-100` on hovering the block),
  because the block itself isn't a persistent toolbar surface.

### Modal dialog (Create session)

- Scrim `rgba(0,0,0,0.4)`; modal target width `720px`, white, radius `12px`,
  ring + soft shadow. Height is content-adaptive until it reaches the viewport
  cap.
- Modal width is a target, not a minimum: cap every dialog with
  `min(target-width, calc(100dvw - 32px))` and cap height with
  `calc(100dvh - 32px)`. Dialog bodies that can exceed the cap must be the
  scrolling region; headers and footers remain visible inside the modal.
- The modal layer must visually own the whole viewport: scrim and content sit
  above both expanded/collapsed sidebars and collapsed-sidebar flyouts. Do not
  raise sidebar chrome above Radix dialog content; otherwise narrow centered
  dialogs appear clipped by the rail even when their width cap is correct.
- Controls inside modal bodies must be `w-full`/`min-w-0` and responsive grid
  tracks (`minmax(0, 1fr)`) rather than fixed pixel tracks that can force the
  dialog wider than its viewport cap.
- Title 22px/580 ink + close icon button top-right; subtitle 14px `#52514E`.
- Field blocks stack with `20px` gaps: label row (label 14px/550 ink, optional
  right-aligned **blue link `#184F95`** "Manage agents ↗" with a 12px external
  arrow) above a 36px field.
- The dialog opens with empty Agent, Environment, and Credential vaults fields
  showing placeholders. The primary button remains enabled in that empty state;
  the local API applies default agent/environment values when omitted.
- Environment picker options show name above metadata. Metadata is a
  concrete date label (`Jun 16` for same-year dates; include the year for older
  years, e.g. `Jun 16, 2025`), a muted dot separator, and a neutral tag pill
  for `Cloud` / `Self-hosted`.
- Authorization warning box (credential vaults): amber fill `#F9DCA4`,
  border `#D3942D`, radius `8px`, padding `12px`, leading checkbox, 14px
  warning text `#734500`.
- The `+ Resource` control is the boxed secondary button variant: about
  `31px` tall, `8px` radius, hairline border, white/50 fill, subtle shadow,
  plus icon and chevron. Its dropdown menu is a fixed-position portal rather
  than a child of the dialog body's scroll region, so it can visually extend
  outside the dialog bounds without disabling the dialog content's rounded-corner
  clipping. Because Radix modal dialogs suppress pointer events on the document
  body, the portal must explicitly set `pointer-events: auto`; choosing an item
  must not close the parent Create Session dialog before the resource is added.
  The menu opens after the trigger click completes, not on trigger
  pointer-down, so releasing the same mouse press cannot accidentally select
  the first resource item. Once the menu is already open, menu items may select
  on pointer-down as well as click so portal/modal hit-testing does not depend
  on a synthesized click event. Prefer opening below the trigger; flip above
  only when the browser viewport bottom would clip the menu. Opening the menu must
  not reset the dialog scroll position; otherwise the trigger and menu can be
  laid out outside the visible modal body. Adding a resource should keep the
  resource list end and `+ Resource` control reachable in the modal viewport so
  users can add multiple resources without manual scroll repair. When a
  resource card is present, leave roughly a normal field gap between the card
  and the next `+ Resource` control. Resource-specific management links are
  shown on the field label row when present, for example File ID exposes
  "Manage files ↗".
- Footer: full-width primary button with `24px` side/bottom inset;
  **disabled = `opacity: 0.5`** on the solid black button.

### Modal dialog (Credential vaults)

- Vault detail page header uses the black primary "Add credential" button:
  `32px` tall, about `170px` wide, `8px` radius, plus icon at `20px`, white
  text, and the same single-primary-action treatment as other detail headers.
  The empty-state "Add credential" action is the boxed secondary variant
  instead of a bare ghost/text button.
- The "Add credential" modal is the compact dialog variant used from both the
  vault creation flow and the vault detail page: `510px` wide, `349px` tall,
  max-width `calc(100vw - 32px)`, white fill, `12px` radius, no CSS border, and
  the standard ring + soft panel shadow
  (`0 0 0 1px rgba(11,11,11,0.1), 0 4px 8px rgba(11,11,11,0.08), 0 12px 28px -2px rgba(11,11,11,0.08)`).
- Header: `24px` left padding, `16px` top padding, title `22px/26px` ink with
  weight `580`, close icon button `31px` square at the top right.
- The vault-creation second step title is "Add a credential" and places the
  readiness sentence as body copy above the fields. The vault-detail action
  title is "Add credential" and uses a regular header description.
- Form fields are `31px` tall with `8px` radius, `rgba(255,255,255,0.5)` fill
  and inset `1px rgba(11,11,11,0.1)` ring. The MCP server field shows
  `https://mcp.example.com` as muted placeholder text while no target is
  selected; do not render it as an ink selected value.
- The MCP server picker should offer real MCP targets, not only the example
  URL. The local test set includes Gmail
  (`https://gmailmcp.googleapis.com/mcp/v1`) and Notion
  (`https://mcp.notion.com/mcp`) with two-line options: product name plus
  muted mono URL.
- `MCP OAuth` and `Bearer token` use the compact credential modal and the same
  MCP server combobox. `MCP OAuth` keeps the primary label `Connect`; `Bearer
  token` uses `Add credential`.
- `Environment variable` switches to the taller credential modal variant
  (`520px` wide, about `900px` tall, constrained to viewport height). Its form
  replaces the MCP server field with `Variable name`, `Value`, `Networking`
  segmented control (`Limited` default), `Allowed hosts` textarea while
  limited, `Injection location` checkboxes (`Request headers` default checked,
  `Request body` unchecked), the shared-credential amber warning, and an
  acknowledgement checkbox. The primary button remains disabled until the
  variable name, value, and acknowledgement are present.
- Credential modal select triggers do **not** use press-scale feedback. Keep
  the trigger itself transparent on hover and focus; hover/focus feedback
  belongs on the outer field shell as a darker rounded border/ring, matching
  the reference combobox field. Avoid `transform: scale(...)`; otherwise the
  portaled select popover recalculates around a moving trigger and visibly
  jitters. Dialog
  outside-interaction handling must also allow Radix Select popovers for pointer
  and focus outside events so choosing Type does not close the modal.
- When a Radix Select combobox inside a modal is already open, clicking its
  trigger again should only close that select popover. It must not propagate
  into dialog outside-interaction handling and close the parent modal. This
  applies to Create Session's Agent/Environment/Vault pickers and credential
  Type/MCP server pickers. In addition to stopping the trigger event when it is
  observable, the parent dialog should suppress close requests for a short
  debounce window immediately after one of its embedded select/picker popovers
  closes; Radix can emit the select close before the trigger receives the second
  pointer event.
- Footer buttons are right-aligned. `Skip for now` is a bordered secondary
  button, not a bare text/ghost button. `Connect` is the `81px` primary button
  and disabled at `opacity: 0.5` until the target is selected.

### Credential vault detail table

- Empty credential tables keep the same tall body as the reference vault detail
  surface so the empty state sits in the table area and pagination remains near
  the lower part of the panel instead of directly below the header.
- Empty credential state includes a large centered outline lock icon above the
  "No credentials yet" title.
- Table body row separators stop before the final body row; the last row does
  not draw an extra bottom divider under itself.

### Toast (success/status notification)

- Fires after a completed action (e.g. "Agent archived.") — not a dialog, no
  confirmation needed, self-dismissing.
- Position: fixed top-right, `16px` inset from top and right edges, stacked
  column with `12px` gap for multiple toasts, width `360px`
  (`max-width: calc(100vw - 2rem)` on narrow viewports).
- Card: white fill, radius `12px`, ring + soft shadow
  (`0 0 0 1px rgba(11,11,11,0.1), 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)`),
  padding `12px 16px`, 14px/20px ink text, single line of copy (no title, no
  icon in the simple success case).
- Lifecycle: enters with a translate+scale-in, auto-dismisses after **~4s**;
  do not require the user to close it manually. `role="status"` /
  `aria-live="polite"` so screen readers announce it without a focus steal.
- Use for the result of a destructive/state-changing action once its
  dialog has closed (archive, delete, etc.) — it is the confirmation that the
  action actually happened, distinct from the confirmation dialog that asked
  "are you sure."

### Session detail page (transcript viewer)

- **Breadcrumb row**: "Sessions" (14px muted, hover ink) `/` mono ID
  (13px, emphasis weight, ink). Right-aligned: "Actions ▾" secondary button +
  a black primary **"Ask Claude"** button with an orange starburst icon
  (`#D97757`).
- **Ask Claude panel**: right-docked panel target width `368px`, capped at
  `100dvw` so narrow viewports never place the panel outside the visible page.
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
- Collapsed sidebar: width ~`48px`, same `#F9F9F7` fill and right hairline.
  Top-level icons remain 36×36 rounded-`8px`. Hovering or keyboard-focusing a
  collapsed **group** icon opens a flyout to the right instead of expanding the
  whole sidebar. The flyout is a white `240px` panel, radius `12px`, `4px`
  padding, standard menu shadow/ring
  (`0 0 0 1px rgba(11,11,11,0.1), 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)`),
  with an 8px-ish offset from the icon rail. The collapsed rail and flyout must
  sit above main table rows and other transformed content; the flyout background
  is fully opaque white, never translucent. It starts with a muted 13px/550
  group label, then 36px child rows. Active child rows use
  `rgba(11,11,11,0.05)` fill and ink text; idle rows use `#52514E` and hover
  to the same faint fill.
- Global top banner (dismissible): full-width, hairline bottom, info icon +
  message on the left, small dark "Learn more" button + close "×" on the right.

### Badges / Tags

- **Status pill**: radius `5px`, padding `0 8px`, font 12px/550, colored text on
  a tinted fill (success/warning above). Height ~`18-20px`.
- **Neutral tag pill**: radius `5px`, padding `0 8px`, fill `rgba(11,11,11,0.05)`,
  text `#52514E`, 12px/550. Used for type ("Cloud", "Self-hosted") and model
  capability tags ("Most capable", "Coding"). Do not override these with a
  near-match solid gray like `#F6F6F4`; the slight fill and text contrast
  difference is visible next to the live Console.
- **Detail field value chip**: static field values inside detail sections
  (for example Environment → Networking → Type) use the same neutral tag
  treatment as the live console: `22px` tall, radius `5.5px`, horizontal
  padding `8px`, fill `rgba(11,11,11,0.05)`, text `#52514E`, 12px/550 with
  `15px` line-height.
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
| Toast | ring + `0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)`, radius `12px`, fixed top-right, auto-dismiss ~4s | post-action success notifications |

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
- Give every list-page detail route the same `max-w-none` full-width page
  shell; only cap the *reading width* of prose-like content inside a tab
  (e.g. `max-w-3xl` for a config/system-prompt column), never the page itself.
- Build one shared component for each repeated interaction pattern (copy
  feedback, search-clear button, filter dropdown, toast, full-row link) and
  reuse it everywhere that pattern appears, instead of re-implementing the
  same hover/feedback logic per page — divergence here is exactly how the
  same bug (missing copy feedback, filter overflow, wrong hover color) ends
  up needing to be fixed on every page individually.

### Don't

- Don't use heavy drop shadows, large radii (>12px), or bright saturated brand
  fills in the app shell.
- Don't use serif anywhere except the "Claude Console" wordmark.
- Don't add multiple competing primary buttons in one header.
- Don't uppercase table headers or use all-caps labels.
- Don't turn list pages into card grids; cards are for dashboard summaries and
  repeated tiles only.
- Don't rely on color alone for status — always pair tint + colored text label.
- Don't fix a filter-dropdown trigger's pixel width — it must size to its
  selected value's content, or long values (e.g. "Last 24 hours") overflow
  the ring.
- Don't give a value-picker dropdown item (version history, etc.) a permanent
  selected background — only the checkmark should mark "selected"; background
  is a hover/highlight-only affordance.

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
  + metric cards + model tiles + resource cards. Detail pages: full-width
  `max-w-none` page shell (never a page-level width cap); a config-style tab
  may cap its own reading column at `max-w-3xl`. Detail-page header ID is
  click-to-copy text (no separate icon); list-row ID keeps a hover-fade copy
  icon.
- **Feedback conventions**: every copy affordance (list icon, header ID text,
  code-block button, dropdown item) shows the same check-glyph + "Copy"/
  "Copied" tooltip for ~2s. Destructive confirms use a solid `#D03B3B` button
  (not the primary black) and, once the dialog closes, a top-right auto-
  dismissing toast reports what happened (e.g. "Agent archived.").
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
