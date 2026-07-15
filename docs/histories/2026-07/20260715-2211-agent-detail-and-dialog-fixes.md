## [2026-07-15 22:11] | Task: Agent create/edit/detail interaction fixes, shared copy/toast components, DESIGN.md backfill

### Execution Context

- Agent ID: Claude Code CLI session
- Base Model: claude-fable-5
- Runtime: local dev (console via Vite, apiserver via `go run`)

### User Query

> Follow-up round covering two surfaces:
> `/agents` Create Agent dialog — Starting point chevron doesn't track
> open/closed state; the Generate button under the describe-textarea has no
> visible ring/fill in either the disabled or enabled state; YAML/JSON panels
> need a line-number gutter; after creating an agent the app should navigate
> to its detail page instead of staying on the list.
> `/agents/:id` detail page — the header ID should be click-to-copy text with
> no separate icon; the "Version: v1" label/value are cramped and the
> dropdown must select via checkmark (not a permanent background) and
> support multiple versions; the System Prompt copy icon should be
> hover-revealed and give check+"Copied" feedback like everywhere else;
> page content is capped narrower than other detail pages; the Tool
> permissions header/row "Always allow" labels aren't right-aligned on the
> same line; the Sessions filter-overflow fix needs confirming elsewhere too;
> the header Edit button's hover/active states don't visibly react; Edit
> Agent dialog needs the same copy feedback + line numbers, and its
> save-related copy was reported as wrong (not located — see below); the
> Archive confirmation dialog has the wrong copy and a black instead of red
> button; a top-right "Agent archived." toast should appear after archiving.
> Requested explicitly: extract shared components (copy button, toast,
> filter select) instead of fixing each page individually, and backfill
> DESIGN.md for anything undocumented (checked against the live
> platform.claude.com console via Open Browser Use, following the
> design-md-creator skill's conventions).

### Changes Overview

- Area: `apps/console` (cds.tsx primitives, App.tsx pages/dialogs),
  `docs/references/claude-console/DESIGN.md`.
- Key actions:
  - `cds.tsx`: added `useCopyFeedback` hook, `CopyIconButton` (generic
    icon-only copy button), `CopyableIdText` (click-to-copy plain text, used
    for every detail-page header ID), and a module-level `showToast` /
    `ToastViewport` pair (fire-and-forget top-right toast, 4s auto-dismiss).
    Refactored the existing `CopyIdButton` (list-row fade-in icon) onto the
    same hook so all three copy affordances share one feedback
    implementation and timing.
  - Swept **every** `copyText(...)` call site in `App.tsx` (~30 locations:
    list ID columns, detail-page header IDs, session transcript copy
    buttons, deployment schedule/initial-message/run-id copies, environment
    package copy, memory record/author copy, skill version-history copy,
    code-block copy headers, dropdown "Copy ID" menu items) onto the shared
    components/hook, and fixed several that were missing the hover-fade
    `group/cid` wrapper entirely (Files list ID column, the Sessions/
    Deployments panels nested inside the Agent detail page).
  - Found and fixed a real bug surfaced by that sweep: `Button`'s base
    classes always include a plain `opacity-100`; any hover-revealed copy
    button that set `opacity-0`/`group-hover:opacity-100` without `!`
    (important) lost to that base class due to Tailwind's generation-order
    tie-break, making the button permanently visible instead of
    hover-revealed. Fixed with `!opacity-0` / `group-hover:!opacity-100` on
    all hover-revealed instances (System Prompt copy, deployment schedule/
    initial-message copy, environment packages copy) and documented the
    guardrail in DESIGN.md.
  - Create Agent dialog: Starting-point chevron now rotates 90° with
    `aria-expanded`; "Generate" switched from a bare `ghost` button (no
    visible boundary in either state) to `secondary` with an explicit
    border/white fill so both disabled (dimmed pill) and enabled (ring +
    hover fill) states are visibly buttons; `submit()` now `navigate()`s to
    `/agents/:id` after creation instead of just closing the dialog.
    `HighlightedConfigTextarea` and a new `CodeBlockWithLineNumbers`/
    `CodeGutter` pair add a scroll-synced 40px line-number gutter to both
    the YAML editor and the read-only JSON preview, reused in both the
    Create and Edit dialogs.
  - Agent detail page: header ID converted to `CopyableIdText` (no separate
    icon); version `Select` — label/value gap tightened to `gap-1` with the
    value in mono 13px so it visually separates from the chevron, removed
    the unconditional `bg-fill` on the item (selection now shows via the
    checkmark only, background is hover-only), and the item list now maps
    over `agent.versions` (new optional field on the `Agent` type, falling
    back to a single entry built from `version`/`createdAt`) so multiple
    versions render correctly once the backend exposes real history — no
    backend version-history persistence exists yet, this only fixes the
    frontend's ability to render it (see Design Intent/limitations below);
    outer `<section>` and the Agent tab's `CdsTabs.Content` changed from a
    hardcoded `max-w-[1252px]` to `w-full max-w-none` / `max-w-3xl`, and the
    App-level route shell's `agentDetailRoute` special case (which dropped
    `max-w-none` only for this route) was removed so the page matches the
    other full-width detail pages; Tool-permissions header button's padding
    changed from `px-4` to `pl-4 pr-10` so its "Always allow" label lines up
    with the `px-10` row rendering below it; the Edit button's hover/active
    states were fixed (see Button bug below).
  - Archive confirmation dialog: takes an `agentName` prop and now reads
    `Are you sure you want to archive "{name}"? Archived agents can't be
    used to create new sessions.`; confirm button changed from black
    (`#0B0B0B`) to the new danger-button fill `#D03B3B` (hover `#B83232`);
    both archive call sites (list row, detail page) call `showToast("Agent
    archived.")` after the archive call resolves.
  - Fixed a second `Button` styling bug on the header **Edit** button: its
    idle background was a `!important` `!bg-white/50` with no matching
    `!important` hover/active override, so the plain `hover:bg-fill` class
    from the `secondary` variant never won. Added `hover:!bg-[...]
    active:!bg-[...] active:scale-[0.975]` at the same specificity.
  - Removed the last two stray fixed filter-trigger widths (session detail
    toolbar's "All events" select, `w-[97px]` → `min-w-[97px]`) found while
    re-checking the earlier "Sessions filter overflow" fix across other
    pages; confirmed no other `topFilterShellClassName` site still carries a
    fixed width.
  - DESIGN.md backfilled after inspecting platform.claude.com with Open
    Browser Use, following the design-md-creator skill's section-order
    conventions: danger button fill, small-secondary-button spec + the
    idle/hover `!important` guardrail, detail-header click-to-copy-text rule
    (generalized to every detail page, not just the one reported), a new
    "Version / value-picker dropdown" subsection distinguishing it from the
    filter dropdown (checkmark-only selection, content-driven no-fixed-width
    label/value spacing), a new "Code editor / config panel" subsection
    (line-number gutter, always-visible vs. hover-revealed copy button
    rule), a new Toast component subsection + elevation table row, and two
    new Do/Don't bullets about full-width detail shells and building shared
    components instead of per-page fixes.

### Design Intent

Treat every "this one button/row is wrong" report as a signal to check the
same component pattern everywhere it's used, and fix the shared primitive
once rather than patching call sites — this is why the copy-feedback sweep
touched ~30 sites instead of the handful the user pointed at directly, and
why DESIGN.md's new rules are written as general component contracts
(danger button, toast, gutter, value-picker dropdown) rather than
page-specific notes. The Tailwind `opacity-100`-vs-`opacity-0` collision
was an unplanned but important find from that sweep: it means any future
hover-revealed control built on top of the shared `Button` must use `!`
overrides or it will silently render as always-visible, so this is now
called out explicitly in DESIGN.md rather than left to be rediscovered.

**Known limitation**: the agent version dropdown can now correctly render
multiple versions, but the backend (`apps/apiserver`) still only persists a
single `version` string per agent (no version-history table, unlike
Skills' `SkillVersion` model) — saving a new version currently just
overwrites the current one rather than appending to history. Making the
dropdown actually show more than one entry needs a backend model change
that was out of scope for this UI-focused pass.

**Unresolved**: the reported "Edit agent 里的 start new session 应该保存的
文案写错了" wording bug could not be located — grepped the whole console
source and inspected the live Edit Agent dialog end-to-end; no "start new
session"-adjacent text exists there today (the dialog only has the format
tabs, the editor, and a "Save new version" button, which reads correctly).
Left as-is rather than guessing at a fix; needs a screenshot or more precise
pointer from the user to proceed.

### Files Modified

- `apps/console/src/components/cds.tsx`
- `apps/console/src/App.tsx`
- `apps/console/src/types.ts`
- `docs/references/claude-console/DESIGN.md`
