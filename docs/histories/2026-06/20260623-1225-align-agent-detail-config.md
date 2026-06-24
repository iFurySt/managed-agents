## [2026-06-23 12:25] | Task: Align agent detail configuration panels

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local macOS with Docker`

### User Query

> Compare the Claude Platform and local agent detail pages with Open Browser
> Use, then align the detail-page controls, configuration sections, empty
> states, and related styling in small verified steps.

### Changes Overview

- Area: Console frontend.
- Key actions:
  - Aligned the agent detail version select with the shared inset-bordered
    filter shell.
  - Reworked the Agent tab configuration layout with consistent section
    headings, top dividers, and body text styling.
  - Styled the model value as lighter body text, matching the reference
    hierarchy.
  - Wrapped the system prompt in a light code-block surface with rounded
    corners and inline copy action.
  - Moved MCP tool permission badges to a second line under the built-in tools
    row and added a collapsed-row affordance.
  - Replaced the framed Skills empty state with the reference-style
    `No skills configured.` text.
  - Restored inset borders on agent-session tab filters and added the empty
    sessions message.
  - Gave the agent-deployments empty-state create button a framed treatment.
  - Follow-up: matched the agent detail actions menu width to the reference
    menu and shortened the detail-page archive action copy.
  - Follow-up: added the deployments empty-state pictogram while keeping the
    framed create button requested for the local console.
  - Follow-up: restored the Agent tab section heading hierarchy to the
    reference color and weight, and changed the detail actions menu Archive item
    to the reference danger styling.
  - Follow-up: widened the agent detail route to the reference 1252px content
    region, restored the System Prompt single-line code block at that width, and
    converted the MCPs/tools area to the reference bordered two-row layout.
  - Follow-up: made the Tool permissions row expandable and populated the core
    built-in toolset with the eight reference permission rows.
  - Follow-up: matched the detail Version selector menu to the reference
    two-line option treatment and added the requested rounded border treatment
    to the Edit action.
  - Follow-up: removed the centered max-width shell from standard console list
    routes so body content aligns closer to the sidebar like the reference.
  - Follow-up: aligned the Create session dialog shell, overlay, session
    pickers, default selections, credential-vault acknowledgement warning, and
    create-button validation with the reference.
  - Follow-up: fixed Create session Agent and Environment picker search inputs
    so they show neutral placeholders, auto-focus on open, accept direct
    keyboard input, reset search on close, and keep only one picker menu open at
    a time.
  - Follow-up: converted the Create session credential-vault picker to
    searchable checkbox-style multi-select with outside-click dismissal while
    preserving the vault authorization warning behavior.
  - Follow-up: gave the Create session Resource trigger a bordered rounded
    button treatment and widened the resource menu so each resource type stays
    on one row.
  - Follow-up: brought the credential-vault picker into the same controlled
    open state as the Agent and Environment pickers so opening another picker
    reliably dismisses the previous dropdown.
  - Follow-up: changed the Create session dialog to use a fixed header with an
    internal scrollable body so expanded resource forms can be scrolled through
    without losing the sticky submit action.
  - Follow-up: aligned the Create session credential-vault picker rows with
    the reference ordering, search placeholder, checkbox treatment, dates, and
    right-side credential metadata.
  - Follow-up: aligned Create deployment picker metadata and optional field
    labels with the reference while keeping deployment-specific vault ordering
    separate from the Create session vault picker.
  - Follow-up: widened the deployment detail page to the reference content
    width and replaced configuration resource buttons with reference-style
    detail tokens.
  - Follow-up: matched the deployment runs table width and column distribution
    to the reference layout.
  - Follow-up: removed the Credential vaults page update banner and matched the
    vault list table width and column distribution to the reference layout.
  - Follow-up: matched the Memory stores table width, column distribution, and
    first-row created label to the reference layout and data.
  - Follow-up: matched the Environments table width and column distribution to
    the reference layout.
  - Follow-up: matched the Deployments list table vertical position, fixed
    width, and column distribution to the reference layout.
  - Follow-up: matched the Agents list fixed width and column distribution to
    the reference layout.
  - Follow-up: restored the Sessions list `Tokens in / out` column and matched
    the table width and column distribution to the reference layout.
  - Follow-up: matched the Credential vault detail credentials table width,
    column distribution, and empty-state row to the reference layout.
  - Follow-up: added an optional DataTable empty-state slot used by the vault
    credentials table.
  - Follow-up: matched the Memory store detail empty tree state to the
    reference by hiding the expand control when no folders exist and rendering
    the `Empty` row in the left pane.
  - Follow-up: matched Environment detail header metadata to the reference by
    rendering the description without shifting the detail sections and using
    the reference short environment id format.
  - Follow-up: aligned the Environment detail type badge and top-right action
    group with the reference header spacing, neutral badge styling, and action
    coordinates.
  - Follow-up: gave Create deployment picker controls reference-style 472px
    inset-ring shells while keeping the internal 464px combobox buttons.
  - Follow-up: aligned the deployment detail header with the reference by
    matching the title/status positioning and converting `Run now` from a
    primary button to the reference transparent glyph button.
  - Follow-up: aligned the Create deployment Trigger picker popover with the
    reference direction, glyph icons, row spacing, and panel ring.
  - Follow-up: let the Create deployment dialog expand to the reference
    content height when the Schedule trigger is selected while preserving the
    default 718px create-dialog height.
  - Follow-up: updated Create deployment schedule preview dates so the default
    Weekdays `Next 5 runs` list starts with the same upcoming dates as the
    reference instead of stale past runs.
  - Follow-up: replaced the Create deployment schedule preview help and run
    icons with the reference Anthropic glyphs, and matched the `Next 5 runs`
    title row typography and spacing.
  - Follow-up: matched the Create deployment optional-field label treatment by
    using the reference 6px optional-label offset and 430 weight.
  - Follow-up: aligned the Create deployment picker trigger layering so the
    inner buttons are transparent and square while the outer shell owns the
    rounded inset border.
  - Follow-up: tightened the Create session credential-vault dropdown to the
    reference compact two-row list, including 46px option rows, the 92px list
    viewport, adjusted option typography, and the reference credential chip
    count.
  - Follow-up: aligned the deployment detail configuration sections and
    schedule block with the reference, including section spacing, schedule
    copy/help glyphs, compact timezone typography, next-run labels, last-run
    copy, and the reference initial-message sample.
  - Follow-up: changed deployment seeding to upsert known sample deployments so
    local persisted databases receive reference-data corrections on restart.
  - Follow-up: aligned the deployment detail Runs table row content with the
    reference, including run/session short-id format, run-id copy glyphs,
    two-line started-at cells, 44px rows, and reference relative run labels.
  - Follow-up: changed deployment-run seeding to upsert known sample runs so
    local persisted databases receive reference-data corrections on restart.
  - Follow-up: aligned the Environments list ID cell with the reference short
    format while preserving the longer environment short ID used on detail
    headers.
  - Follow-up: aligned the Environment detail read-only section layout by
    making section shells full-width, keeping section content at the reference
    800px measure, restoring the reference top spacing for later sections, and
    tightening the Packages value block typography, border, and background.
  - Follow-up: aligned the Environment detail edit layout with the reference
    full-width section shells, fixed the environment-name editor width, and
    normalized edit section title/description/control spacing.

### Design Intent

The detail page should move closer to the Claude Platform reference without
changing data contracts or shared table behavior. The first pass focuses on
well-scoped visual discrepancies that can be verified directly in the running
console.

### Verification

- `npm run build:console`
- Rebuilt the local compose `console` service.
- Used Open Browser Use to compare the official and local agent detail pages.
- Verified the local Agent tab now has an inset-bordered version selector,
  light system-prompt code block, lighter model body text, section dividers,
  second-line MCP permission badges, and frameless Skills empty copy.
- Verified the local Sessions tab filters use inset-bordered shells and the
  empty state reads `No sessions yet, run this agent to create a session`.
- Verified the local Deployments tab empty state shows a framed
  `Create deployment` button.
- Compared the official actions menu with Open Browser Use; matched the local
  detail actions menu width and archive label in source after measuring the
  reference popup.
- Follow-up Open Browser Use check confirmed the local Deployments empty state
  includes an icon and keeps the title, description, and button vertical
  positions aligned with the reference.
- Follow-up browser checks confirmed Agent tab section headings compute to
  14px/20px, weight 550, and `#52514e`; the detail actions menu still measures
  184px wide with 32px rows, and Archive now uses the reference red danger color.
- Follow-up Open Browser Use checks confirmed the local agent detail page now
  measures x=288/w=1252, the top-right Edit and actions buttons sit at the
  reference x positions, and the MCPs/tools card, tool id, and permissions row
  match the reference geometry and typography.
- Follow-up Open Browser Use check confirmed clicking Tool permissions expands
  the core toolset into eight 50px permission rows with per-row `Always allow`
  status.
- Follow-up Open Browser Use check confirmed the Version shell measures
  105x32, the open option measures 247x46 with a created-date subtitle, and the
  Edit button has an 8px radius with a 0.5px border.
- Follow-up Open Browser Use checks confirmed Agents and Sessions now start at
  x=280 with a 24px gap after the 256px sidebar, and their tables leave a 24px
  right gutter.
- Follow-up Open Browser Use check confirmed Create session now opens with a
  720x619 dialog, 672x32 field shells, a black 40% overlay, selected agent,
  environment, and vault defaults, a vault authorization warning, and disabled
  submit until the acknowledgement is checked.
- Follow-up Open Browser Use checks confirmed the Agent picker search
  auto-focuses with `Search agents`, uses neutral text/caret color, accepts
  direct keyboard input, and filters `ssh` to the SSH bootstrapper agent.
- Follow-up Open Browser Use checks confirmed opening the Environment picker
  closes the Agent picker, shows only environment options, auto-focuses with
  `Search environments`, and filters `my` to `myenv`.
- Follow-up Open Browser Use checks confirmed the credential-vault picker
  auto-focuses with `Search credential vaults`, filters `temp` to
  `Temporary vault`, toggles vaults with checkbox rows without closing the menu,
  updates the trigger to `2 vaults selected`, keeps the authorization warning
  visible, and closes when clicking elsewhere in the dialog.
- Follow-up Open Browser Use checks confirmed the Resource trigger measures
  121x31 with an 8px radius and inset border, and the opened resource menu is
  190px wide with three 32px, `nowrap` rows for `GitHub Repository`, `File`, and
  `Memory Store`.
- Final Open Browser Use audit confirmed opening Credential vaults after
  Environment closes the environment popover, leaves only vault options in the
  list, keeps the vault search focused with neutral text color, and preserves
  the prior Agent, Environment, Credential, and Resource behavior on the current
  rebuilt console.
- Follow-up Open Browser Use check confirmed a GitHub Repository resource makes
  the Create session body scrollable (`scrollHeight` greater than
  `clientHeight`), and scrolling the internal body to the bottom reveals the
  Authorization Token and Mount Path fields while the submit action remains
  reachable.
- Follow-up Open Browser Use check confirmed the credential-vault picker shows
  `Search vaults by name or exact ID`, keeps selected `test_secret` first with
  a blue checkbox, `Jun 16`, and four credential chips, and shows
  `Temporary vault` second with an empty checkbox and `No credentials`.
- Follow-up Open Browser Use checks confirmed Create deployment keeps the
  520x718 reference dialog geometry, auto-focuses the name field, shows
  separated `(optional)` labels, displays the Agent picker placeholder
  `Search agents by name or exact ID` with `4 days ago`/`Jun 16` metadata,
  displays the Environment picker placeholder `Search environments by name or
  exact ID` with `Jun 16` and host metadata, and keeps the deployment Vault
  picker ordered as `Temporary vault` then `test_secret` with three credential
  chips.
- Follow-up Open Browser Use check confirmed deployment detail now renders at
  the full available content width (`1293px` in the test viewport), moves
  `Run now` and the actions menu to the reference right edge, and shows
  configuration values as 25px reference-style tokens with the agent version
  displayed separately.
- Follow-up Open Browser Use check confirmed the deployment Runs tab table is
  `1309px` wide and uses the reference column widths: `160`, `309.5`, `120`,
  `110`, `160`, `309.5`, and `140px`.
- Follow-up Open Browser Use check confirmed Credential vaults starts without
  the local-only update banner, uses a `1309px` table at `x=280`, and matches
  the reference column widths: `216`, `645`, `200`, `200`, and `48px`.
- Follow-up Open Browser Use check confirmed the Create vault dialog keeps the
  reference `510x306` shell, centered placement, field sizes, disabled
  Continue button, and page overlay behavior.
- Follow-up Open Browser Use check confirmed Memory stores uses a `1309px`
  table at `x=280`, matches the reference column widths: `40`, `200`, `693`,
  `120`, `200`, and `56px`, and shows the first row Created value as
  `5 days ago`.
- Follow-up Open Browser Use check confirmed the Create memory store dialog
  keeps the reference `510x337` shell, centered placement, field sizes, helper
  copy, and disabled Create button.
- Follow-up Open Browser Use check confirmed Environments uses a `1309px`
  table at `x=280` and matches the reference column widths: `40`, `216`,
  `637`, `100`, `120`, `140`, and `56px`.
- Follow-up Open Browser Use check confirmed the Create environment dialog
  keeps the reference `510x429` shell, centered placement, field sizes,
  hosting-type selector, and Cancel/Create actions.
- Follow-up Open Browser Use check confirmed Deployments uses a `1309px` table
  at `x=280`, starts at `y=148`, and matches the reference column widths:
  `160`, `403`, `110`, `220`, `200`, `160`, and `56px`.
- Follow-up Open Browser Use check confirmed Create deployment still keeps the
  reference `520x718` shell, `464px` picker controls, `472px` text fields, and
  the expected create action after the list-table changes.
- Follow-up Open Browser Use check confirmed Agents uses a `1309px` table at
  `x=280`, starts at `y=148`, and matches the reference column widths: `40`,
  `180`, `443`, `170`, `120`, `150`, `150`, and `56px`.
- Follow-up Open Browser Use check confirmed Sessions uses a `1309px` table at
  `x=280`, starts at `y=148`, includes the `Tokens in / out` column, and
  matches the reference column widths: `40`, `160`, `292`, `130`, `291`,
  `140`, `200`, and `56px`.
- Follow-up Open Browser Use check confirmed Create session still keeps the
  reference `720x619` shell, `672px` field controls, selected defaults, vault
  acknowledgement warning, and `121x31` Resource trigger after the list-table
  changes.
- Follow-up Open Browser Use check confirmed the Credential vault detail
  credentials table uses a `1293px` table at `x=288`, starts at `y=174`,
  includes the empty-state row, and matches the reference column widths: `200`,
  `180`, `405`, `100`, `180`, `180`, and `48px`.
- Follow-up Open Browser Use check confirmed Add credential still keeps the
  reference `510x349` shell, `463px` name field, `455px` select controls, and
  Connect action after the table empty-state changes.
- Follow-up Open Browser Use check confirmed Memory store detail now renders
  the empty left tree row at `x=297`, `y=157`, `w=272`, `h=24`, hides the
  expand-all button when there are no folders, and keeps the Select a memory
  empty preview in the right pane.
- Follow-up Open Browser Use check confirmed Add memory still keeps the
  reference `510x496` shell, `462px` path/content fields, and disabled Create
  action after the empty-tree change.
- Follow-up Open Browser Use check confirmed Environment detail renders the
  description at `y=134`, keeps Networking/Packages/Metadata at
  `y=178`/`325`/`462`, and displays the short id as
  `env_01UTaK...ZjUARMh`.
- Follow-up Open Browser Use check confirmed entering Environment edit mode
  still shows the name field, description textarea, Networking section, and
  Save/Cancel actions after the header change.
- Follow-up Open Browser Use check confirmed Environment detail now keeps the
  `Cloud` badge at `x=563`, `w=50`, `h=22` with neutral reference colors,
  places `Edit` at `x=1490` and the actions trigger at `x=1549`, keeps the
  description at `y=134`, and preserves Networking/Packages/Metadata at
  `y=178`/`325`/`462`.
- Follow-up Open Browser Use check confirmed Create deployment Agent,
  Environment, Credential vaults, Memory stores, and Trigger picker shells now
  measure `472x32`, keep 8px radii, and render the reference `rgba(11,11,11,0.1)`
  inset ring around their 464px combobox buttons.
- Follow-up Open Browser Use check confirmed deployment detail header metrics
  now match the reference: title `x=284`, status `x=573`, header `x=280`
  / `w=1309`, and the right action group `x=1448` / `w=137`, with `Run now`
  as a transparent `101x32` button using the reference glyph and 8px radius.
- Follow-up Open Browser Use check confirmed the Create deployment Trigger
  picker now opens below the trigger with a `39px` offset, uses a `472x96`
  panel, renders two `464x44` options, and matches the reference Manual and
  Schedule glyph positions and spacing.
- Follow-up Open Browser Use check confirmed Create deployment still measures
  `520x718` in the default trigger state, and expands to `520x1134` after
  selecting Schedule, with the Frequency row, schedule card, and Create action
  visible at the reference relative positions.
- Follow-up Open Browser Use check confirmed the default Weekdays schedule
  preview now matches the reference sequence:
  `Wed, Jun 24, 2026`, `Thu, Jun 25, 2026`, `Fri, Jun 26, 2026`,
  `Mon, Jun 29, 2026`, and `Tue, Jun 30, 2026` at 9:00 AM.
- Follow-up Open Browser Use check confirmed the local schedule preview now
  uses the reference `` help glyph and `` run glyphs, with the title row
  measuring `89.39px` wide at `13px`/`16px`, a `6px` gap, and run glyphs
  aligned at the same x coordinate and size as the official dialog.
- Follow-up Open Browser Use check confirmed the Create deployment
  `Credential vaults(optional)` and `Memory stores(optional)` labels now match
  the reference widths (`186.49px` and `172.93px`) with optional spans using a
  `6px` left margin, `14px` font size, muted color, and `430` font weight.
- Follow-up Open Browser Use check confirmed the Create deployment Agent,
  Environment, Credential vaults, Memory stores, and Trigger picker inner
  buttons now compute to `borderRadius: 0px` with transparent backgrounds, while
  their outer shells remain `472x32` with `8px` radii and the reference inset
  ring.
- Follow-up build check confirmed the compact Create session credential-vault
  dropdown changes compile cleanly with the console bundle.
- Follow-up Open Browser Use check confirmed deployment detail section tops now
  match the reference at `180`, `247`, `314`, and `381px`; schedule copy/help
  glyphs render as `` and ``; next runs show the reference Wed/Thu/Fri/Sat
  sequence; last scheduled run shows `7 days ago`; and the initial-message
  block uses the reference sample text and copy glyph.
- Follow-up checks passed `npm run build:console`, `go test ./apps/apiserver`,
  and a local Docker rebuild of `apiserver`/`console`.
- Follow-up Open Browser Use check confirmed the deployment Runs table now has
  the reference four seed rows, `1309px` width, `208.5px` table height, 44px
  body rows, `drun_01…` and `sesn_01…` short IDs with hidden full IDs, ``
  run-id copy glyphs, and `7 days ago` / `last week` relative labels.
- Follow-up checks passed `npm run build:console`, `go test ./apps/apiserver`,
  a local Docker rebuild of `apiserver`/`console`, and cleanup of one local
  generated `drun_local_%` test row before visual comparison.
- Follow-up Open Browser Use check confirmed the Environments list first ID
  cell now renders `env_…ZjUARMh`, keeps the hidden full ID, preserves the
  `` copy glyph, and retains the reference `1309px` table width and column
  distribution.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed Environment detail read-only
  sections now render full-width shells with `1285px` width and `800px` inner
  content, with Packages at `x=292/y=300/w=1285/h=119` versus the reference
  `x=292/y=301/w=1285/h=120`; the package value block now measures `800x35`
  with `12px/16px` mono text, `#f9f9f7` background, and `0.5px` border.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed Environment edit mode now renders
  the name input at `256x36`, Networking at `x=292/y=238/w=1285/h=114`,
  Packages at `x=292/y=368/w=1285/h=129`, Metadata at
  `x=292/y=513/w=1285/h=129`, and the package edit row at `800x36`, matching
  the reference metrics.
- Follow-up read-mode regression check confirmed the Environment read-only
  section shells and `800x35` package value block remained aligned after the
  edit-mode changes.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed Credential vault detail now matches
  the reference table layout with a `1293x268` table, 32px header row, 48px
  first data row, 47px subsequent rows, pagination at `y=462`, inline Auth
  cells, and credential short IDs using the reference seven-character suffix.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `apiserver`/`console`.
- Follow-up Open Browser Use check confirmed the Create session dialog now uses
  the reference `706x606` shell, the Credential vaults clear control is `22x22`,
  and the vault dropdown renders a field-width `658x137` panel with the
  reference checkbox glyph and five overlapping credential badges for
  `test_secret`.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Create deployment Add vault
  dropdown now matches the reference `472x137` panel, two `46px` options, five
  overlapping credential badges for `test_secret`, and `No credentials` as
  `12px/16px` text at the reference position.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Create deployment Add memory
  store dropdown now opens downward as a `472x229` panel with a 37px search row,
  four `46px` options, and option text limited to the store name plus the
  `13px/16px` description without the extra access label.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Create deployment Trigger
  dropdown now aligns at `x=571/y=890/w=472/h=96`, keeps both `44px` options at
  the reference positions, and renders trigger descriptions as `13px/16px`
  text.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the deployment detail Schedule
  section now matches the current reference text with next runs
  `Thu 1:00 AM`, `Fri 1:00 AM`, `Sat 1:00 AM`, `Sun 1:00 AM`, `+1`, and
  `Last scheduled run: Jun 17`.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `apiserver`/`console`.
- Follow-up Open Browser Use check confirmed the deployment detail breadcrumb
  now matches the reference `Deployments` link at `x=268/y=16/w=112/h=28`,
  with transparent background, `0px` radius, and `4px 12px` padding.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed deployment detail tabs now match
  the reference geometry and weight model: `Configuration` at `x=280/w=117`,
  `Runs` at `x=399/w=58`, active visible text at weight `500`, inactive visible
  text at weight `400`, and hidden width-preserving text at weight `550`.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the deployment detail subtitle now
  matches the reference structure with `text-xs/16px`, a clickable short
  deployment ID, a transparent full ID overlay for copy/selection fidelity, no
  separate copy icon, and `Created Jun 16, 2026` aligned on the same row.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the deployment Runs tab now keeps
  tabs at `y=132`, places the Trigger and Result filters at `y=180`, places the
  table at `x=280/y=228/w=1309`, renders table headers at `13px/16px`, and
  restores the first scheduled run row subtitle to the reference `last week`.
- Follow-up checks passed `npm run build:console`, `go test ./apps/apiserver`,
  and a local Docker rebuild of `apiserver`/`console`.
- Follow-up Open Browser Use check confirmed the Environment detail breadcrumb
  now matches the reference `Environments` link at `x=268/y=16/w=116/h=28`,
  with transparent background, `0px` radius, and `4px 12px` padding.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Environment detail header now
  matches the reference subtitle structure with the title at `y=76`, a
  `text-xs/16px` clickable short environment ID, a transparent full ID overlay,
  no separate copy button, and `Last updated Jun 16` on the same row.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Credential vault detail
  breadcrumb now matches the reference `Credential vaults` link at
  `x=268/y=16/w=137/h=28`, with transparent background, `0px` radius, and
  `4px 12px` padding.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Credential vault detail header
  now matches the reference title and subtitle geometry: title at `x=292/y=60`,
  a clickable full vault ID at `x=288/y=90/w=210/h=20`, no separate copy button,
  and `Created`/`Updated` metadata rendered as `14px/20px` text on the same
  row.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.
- Follow-up Open Browser Use check confirmed the Create session Credential
  vaults area now uses the reference transparent vault authorization row instead
  of the yellow bordered warning block, and the Resource trigger now matches the
  reference transparent `121x27` button while the vault dropdown keeps two
  `46px` rows in the same order.
- Follow-up check passed `npm run build:console` and a local Docker rebuild of
  `console`.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `docs/histories/2026-06/20260623-1225-align-agent-detail-config.md`
