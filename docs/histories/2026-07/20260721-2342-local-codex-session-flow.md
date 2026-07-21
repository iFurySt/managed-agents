# Local Codex Session Flow

## Request

Confirm the recent pushed state, then make local development able to create an
agent, environment, and session, send a message into the session, run Codex as
the agent through the Docker-backed local runtime, and render the resulting chat
event in the session detail page.

## Changes

- Added a generic session message composer to the session detail page. It posts
  user turns through the existing session message API, polls while work is
  queued/running, and keeps the removed Ask Claude control absent.
- Aligned the session detail page with the Claude Console reference at the
  checked desktop viewport by removing the page-level negative margin and
  narrowing the transcript/detail split so transcript rows land at the same
  `x=48` start and approximately the same width as the reference.
- Changed session message creation to mark the user event and session as
  `Queued`, so the console can detect that a worker turn is pending.
- Switched Create Session agent and environment pickers from static-only
  fixtures to API-backed options, with nested create actions selecting newly
  created local records immediately.
- Made `sandbox-codex` choose the Codex Linux tarball for the sandbox guest
  architecture (`x86_64` or `aarch64`) and use resumable retry downloads for the
  Codex release.
- Parameterized the local Docker compose orchestrator runtime, Codex model,
  Codex tarball, runtime timeout, and host Codex home mount.
- Documented the local Docker + Codex run path in the README and updated the
  Claude Console design reference for dynamic session pickers and the session
  message composer.

## Validation

- `npm run build --workspace @managed-agents/console`
- `npm run lint --workspace @managed-agents/console`
- `go test ./apps/apiserver ./apps/orchestrator`
- `docker compose -f infra/docker-compose.local.yml up -d postgres docker-template sandboxd`
- API smoke on an isolated `:18080` apiserver created a local agent,
  environment, session, and queued `session_turn` work.
- `sandbox-command` smoke consumed queued work and wrote an agent message event.
- `sandbox-codex` smoke completed successfully through Docker-backed
  `sandboxd`, using host Codex auth and writing a Codex response containing the
  expected marker back to the session transcript.
- Browser smoke on `http://127.0.0.1:5174` confirmed the Codex response renders,
  the composer is present, Ask Claude is absent, and there is no horizontal
  scroll at the checked desktop viewport.
- OBU smoke on `http://localhost:5173` created a local agent, environment, and
  session, posted a session message through the page composer, ran the queued
  turn with `sandbox-codex`, and verified the Codex response rendered in the
  session transcript.
- OBU layout comparison against the Claude Console reference URL verified the
  local session detail page now starts at `x=80`, transcript rows start at
  `x=48`, row width is within 2px of the reference sample, and there is no
  horizontal scroll.

## Files

- `apps/apiserver/main.go`
- `apps/orchestrator/main.go`
- `apps/orchestrator/main_test.go`
- `apps/console/src/App.tsx`
- `apps/console/src/types.ts`
- `infra/docker-compose.local.yml`
- `README.md`
- `docs/references/claude-console/DESIGN.md`
- `docs/exec-plans/active/local-codex-session-flow.md`
