## [2026-07-15 23:45] | Task: Agent version-history backend + full re-audit of prior agents-surface follow-up round

### Execution Context

- Agent ID: Claude Code CLI session
- Base Model: claude-sonnet-5
- Runtime: local dev (console via Vite, apiserver via `go run`, Postgres via `deps-postgres`)

### User Query

> On `/agents/:id`: the agent is now at v2 (saved via Edit) but the Version
> dropdown only shows one entry. Need it to show 2 versions. Also confirm
> selection reads via checkmark, not a permanent background fill (background
> should only change on hover).
>
> This was reported before, in a previous round, but wasn't actually done. Fix
> it, then re-verify every item from that previous round's report to make sure
> nothing was missed:
> `/agents` Create Agent dialog — Starting point chevron open/closed tracking;
> Generate button visible ring/fill in disabled+enabled states; YAML/JSON
> line-number gutters; navigate to detail page after create.
> `/agents/:id` detail page — click-to-copy header ID (no icon); version
> label/value spacing + checkmark-only multi-version dropdown; hover-revealed
> System Prompt copy with check+"Copied" feedback; full-width detail page;
> Tool permissions header/row "Always allow" right-aligned; Sessions
> filter-overflow fix holds elsewhere; header Edit button hover/active
> reacts visibly; Edit Agent dialog copy feedback + line numbers; Archive
> confirmation dialog correct copy + red (not black) button; "Agent
> archived." toast top-right.
> Also confirm shared components (copy button, toast, filter select) are
> real extracted components, and backfill DESIGN.md for anything
> undocumented (cross-checked against platform.claude.com via Open Browser
> Use).

### Changes Overview

- Area: `apps/apiserver` (new version-history persistence), `apps/console`
  (agent detail page version switching, danger-button color/override bugs),
  `docs/references/claude-console/DESIGN.md`.
- Key actions:
  - **Backend**: added `AgentVersion` GORM model (mirrors the existing
    `SkillVersion` pattern) with `Version`/`Name`/`Description`/`Model`/
    `SystemPrompt`/`ConfigYAML`/`CreatedAt`, `AutoMigrate`d it, and wired it
    into `createAgent` (writes the initial `v1` snapshot in the same insert)
    and `updateAgent` (writes a new snapshot inside the same transaction as
    the version bump, then reloads with `Preload("Versions", ... "created_at
    desc")` before responding). `getAgent` now preloads the same way. This
    closes the previously-documented "known limitation" — the version
    dropdown can now show real multi-version history instead of only ever
    synthesizing one entry from the agent's current fields.
  - **Frontend**: `Agent.versions` entries now carry the full editable-field
    snapshot (new `AgentVersionEntry` type in `types.ts`), not just
    `{version, createdAt}`. `AgentDetailPage` tracks a local `viewedVersion`
    state; the version `Select`'s `onValueChange` (previously a no-op) now
    switches which snapshot's Model/System-prompt render, matching the live
    platform's behavior of a version select actually changing displayed
    content (the live product does a network refetch with a loading
    skeleton; the local console instead swaps instantly from data already
    present in the initial response — documented as an accepted
    implementation difference). `viewedVersion` resets on navigation and
    after a successful edit save so the view snaps back to the newest
    version.
  - **Re-verified every item from the prior round** by driving the running
    app end-to-end with Open Browser Use (both the local console and, for
    the version-history interaction specifically, a live agent on
    platform.claude.com with real v1/v2 history, to confirm the intended
    interaction): Create Agent dialog chevron/Generate button/gutters/
    post-create navigation all confirmed working; detail-page click-to-copy
    ID, tool-permissions alignment, full-width shell, and Edit-button
    hover/active all confirmed working; Edit Agent dialog's "Copy code"
    button (hover-revealed on the detail page's System Prompt block,
    always-visible in the editor toolbar per the documented distinction)
    confirmed giving check+"Copied" feedback.
  - **Found a real regression while re-verifying the Archive dialog**: the
    "Archive agent" confirm button rendered **black**, not the red
    `#D03B3B` danger fill the prior round's history claimed to have shipped.
    Root cause: the button didn't pass `variant` to the shared `Button`
    component, so it fell back to `variant="primary"` (`bg-ink
    hover:bg-black`); the call site's own `bg-[#d03b3b] hover:bg-[#b83232]`
    was the same specificity as that default and lost the Tailwind
    generation-order tie-break — the same class of bug the previous round
    documented for hover-reveal opacity, just on a different property.
    Grepped for every `<Button` with an inline `bg-[#...]` and no `!`:
    found and fixed **five** call sites total — Agent archive (`#d03b3b`,
    already the right color, just missing `!`), Session archive,
    Deployment archive, and a generic `EnvironmentConfirmationDialog` /
    `VaultConfirmationDialog` / `MemoryStoreConfirmationDialog` (all three
    were using a different, non-canonical red `#b33f31`/`#a5362a` — wrong
    color *and* missing `!`, now unified on the documented `#D03B3B`/
    `#B83232`), and the session-message send button (`#c6613f`, missing
    `!`, unrelated to danger styling but same root cause). Confirmed the
    fixed Agent archive button renders red end-to-end, including the
    post-archive "Agent archived." toast.
  - Confirmed `CopyIconButton`, `CopyableIdText`, `useCopyFeedback`,
    `showToast`/`ToastViewport`, and `FieldSelect` all already exist as
    real shared exports in `cds.tsx` from the prior round — no further
    extraction needed.
  - DESIGN.md: added a new guardrail bullet generalizing the existing
    idle/hover `!important` rule to cover *any* one-off `bg-[...]` on a
    `Button` regardless of whether `variant` is set (since the default
    `variant="primary"` fill is itself a collision risk, not just explicit
    idle overrides); documented that selecting a past entry in the version
    dropdown now actually switches the rendered Model/System-prompt content,
    and noted the accepted instant-swap-vs-loading-skeleton implementation
    difference from the live product.

### Design Intent

The user's specific complaint (dropdown shows 1 version, not 2) traced back to
a real backend gap, not a frontend rendering bug — the frontend was already
correctly built in the prior round to render `agent.versions`, but nothing
ever populated that field with more than a synthesized single entry. Fixing
it required the backend model, not just UI polish, since "does the version
history persist and does selecting one change what's shown" is a data
question, not a styling one. While using Open Browser Use to confirm the
intended interaction against a real agent on platform.claude.com, the
version select turned out to actually swap page content on selection (a
network fetch with a loading skeleton) rather than being purely a label —
so the fix also had to make selection functional, not just multi-entry.

For the re-audit: rather than trust the prior round's history file at face
value, every claim was re-driven in the running app. This surfaced a real
regression (black instead of red Archive button) that the history said was
fixed. Treated it the same way the prior round's own guidance says to: found
via one report, then grepped for the same `Button`+`bg-[...]`-without-`!`
pattern everywhere in the file rather than patching only the one call site
that was clicked on, which is why the fix touched five call sites (including
two, `#b33f31`/`#a5362a` on Session/Deployment/Environment/Vault/
MemoryStore dialogs, that were never reported and used the wrong color on
top of the missing-`!` bug).

**Note**: another Claude Code session was running concurrently against this
same working tree during this task (confirmed via `ps aux`); a `docs/
references/claude-console/DESIGN.md` edit picked up unrelated content
(table header/body divider hairline, a new "Searchable filter dropdown"
section) that this task's session did not write. Re-read the file before
each subsequent edit to avoid clobbering; no attempt was made to review or
validate that other session's content beyond confirming it merged without
conflict.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/types.ts`
- `docs/references/claude-console/DESIGN.md`
