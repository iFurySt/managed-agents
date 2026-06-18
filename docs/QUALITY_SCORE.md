# Quality Score

Track quality by product area and architectural layer so agents can prioritize the weakest parts of the system.

## Suggested Scale

- `A`: strong coverage, stable behavior, clear docs, low operational risk.
- `B`: acceptable but still has known gaps.
- `C`: works but needs targeted hardening.
- `D`: fragile or underspecified.

## Initial Template

| Area | Score | Why | Next Step |
| --- | --- | --- | --- |
| Product surface | C | Managed agents objects, lifecycle states, and first UI areas are defined, but user journeys and acceptance criteria are not yet executable. | Specify the first session creation and diagnosis workflow. |
| Architecture docs | B | Top-level architecture and a focused design doc now define control, host, guest, object, and runtime boundaries. | Convert the MVP cut into an execution plan once implementation starts. |
| Testing | C | Host-plane smoke coverage now includes Go tests plus real Firecracker harness validation for sandbox lifecycle, the loopback sandboxd API, and a minimal guest process-api. | Add repeatable CI or scripted harness checks once the runtime stabilizes. |
| Observability | C | Session event and runtime telemetry expectations are documented, but no implementation exists. | Add a local event/log schema and smoke verifier with the first runtime. |
| Security | C | Managed agents security defaults are documented, implementation is pending. | Add real auth, vault, sandbox, secret, and dependency rules as code lands. |
