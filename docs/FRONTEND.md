# Frontend Guide

Read this file for frontend-heavy tasks once the repository includes a UI
surface.

## Visual Design System

The visual source of truth for the console web (`apps/console`) is
[`docs/references/claude-console/DESIGN.md`](references/claude-console/DESIGN.md)
— a design system extracted from the live Claude Console (colors, typography,
components, layout, depth, responsive rules), validated by standalone previews
in the same folder (`preview.html`, `preview-dropdown.html`,
`preview-create-session.html`, `preview-session-detail.html`).

When building or restyling any console page:

- Match tokens and component specs from that DESIGN.md (border-first depth,
  warm neutral canvas, compact 28-36px controls, mono IDs, status pills).
- Compare against the corresponding preview page before and after the change.
- Mind the variable-font caveat: emphasis weights 550/580 must map to a
  `--fw-emphasis: 500` fallback, never 600/700.
- If a spec turns out wrong or missing, fix DESIGN.md (and its preview) in the
  same task rather than diverging silently.

## Product Surface

The first UI is an operational console for managed agents. It should open on
session operations rather than marketing content.

Primary areas:

- Sessions: queue, live runs, failures, logs, files, previews, run attempts,
  cancellation, and diagnostics.
- Agents: adapter type, model/provider config, prompt policy, tools, skills,
  and default environment.
- Environments: image, resources, init scripts, egress policy, sandbox policy,
  and recent health.
- Vault: secret metadata, scopes, release policy, rotation state, last access,
  and audit events.
- Files: uploads, outputs, snapshots, skills, memory files, TTL, quarantine,
  import, and export.
- Skills: package versions, manifests, compatibility, trust state, and mount
  paths.
- Memory: namespaces, documents, indexes, retention, and access policy.
- Deployments: source session, provider, status, URL, logs, artifact, and
  rollback pointer.
- Hosts: capacity, health, active VMs, image cache, and failures.

## Interaction Principles

- Optimize for diagnosis and repeated operations.
- Prefer dense, scannable tables and split panes over marketing-style cards.
- Make failure class, current step, lease age, heartbeat age, and last event
  visible without opening raw logs.
- Keep destructive actions explicit: cancel session, revoke credential, delete
  file, remove skill, and stop host.
- Use status filters, search, and object links consistently across all pages.
- After creating a top-level object that has a detail route, navigate to the
  new object's detail page instead of leaving the user on the list page.

## Verification Expectations

Once a frontend stack exists, browser checks should cover:

- creating a session;
- viewing live session progress;
- opening logs and files;
- cancelling a run;
- inspecting credential release/audit metadata;
- viewing a failed run's terminal reason and diagnostics.
