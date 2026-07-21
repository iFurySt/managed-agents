# Local Codex Session Flow

## Goal

Make local development able to create an agent, create an environment, create a
session, send a user message into that session, let the orchestrator run a
Codex-backed turn through the local Docker sandbox path, and render the returned
chat content in the session detail page.

## Scope

- In scope:
  - Console session creation should use API-backed agent and environment
    options, including newly created local records.
  - Session detail should expose a normal message composer that posts to the
    existing session message API.
  - Local run documentation should explain the Docker + Codex runtime path and
    required host Codex auth.
  - Validation should exercise API creation, work queueing, orchestrator
    execution, and UI rendering where feasible.
- Out of scope:
  - Reintroducing the removed Ask Claude control.
  - Production-grade credential brokering for Codex auth.
  - Firecracker parity work beyond documenting that Docker is local-only.

## Context

- Relevant docs:
  - `docs/ARCHITECTURE.md`
  - `docs/FRONTEND.md`
  - `docs/RELIABILITY.md`
  - `docs/SECURITY.md`
- Relevant code paths:
  - `apps/apiserver/main.go`
  - `apps/orchestrator/main.go`
  - `apps/console/src/App.tsx`
  - `infra/docker-compose.local.yml`

## Progress Log

- [x] Confirm current pushed history and inspect the existing Docker runtime
  path.
- [x] Confirm `POST /api/sessions/:id/messages` queues `environment_work`.
- [x] Wire Create Session pickers to live agents/environments.
- [x] Add a session detail message composer that posts user turns.
- [x] Document and validate the local Docker Codex path.
- [x] Record history, commit, and push.

## Validation Notes

- API smoke created a local agent, environment, session, and queued
  `session_turn` work from a session message.
- `sandbox-command` Docker smoke consumed queued work and returned the session to
  `Idle` with an agent message event.
- `sandbox-codex` initially failed while downloading the Codex release because
  the default one-shot download timed out on the local network. The command now
  chooses the guest architecture and retries with resumable curl downloads.
- A verified `sandbox-codex` run completed successfully and wrote the Codex
  response back into the session transcript.
- Browser smoke on `http://127.0.0.1:5174` confirmed the Codex response renders
  on the session detail page, the message composer is present, the removed Ask
  Claude control stays absent, and the page has no horizontal scroll at the
  checked desktop viewport.
