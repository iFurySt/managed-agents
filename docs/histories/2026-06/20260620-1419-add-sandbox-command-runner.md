## [2026-06-20 14:19] | Task: Add sandbox command runner

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Keep pushing the orchestrator-to-runtime path until it can actually execute on
> the N2 Firecracker host, fixing real transport issues found during validation.

### Changes Overview

- Area: `sandboxd`, `orchestrator`, Firecracker runtime.
- Key actions:
  - Added sandboxd `POST /runs` for one-shot guest command execution.
  - Injected a systemd command unit into the guest rootfs before boot.
  - Captured guest stdout, stderr, and exit code from the rootfs after poweroff.
  - Added orchestrator `sandbox-command` runtime that consumes normal queued
    work through this Firecracker command path.
  - Documented the fallback runtime command in the README.
  - Follow-up: moved guest command decoding and result writing out of the
    systemd `ExecStart=` line into an injected runner script plus `command.b64`,
    avoiding systemd `%` specifier expansion and fragile nested shell quoting.

### Design Intent

The N2 validation proved Firecracker boots, but the CI guest image did not expose
a reliable process-api transport over TCP or VSOCK. The one-shot command runner
keeps the runtime boundary honest by executing inside the Firecracker guest
without pretending process-api is ready. It is a fallback path until the guest
image ships a reliable host-to-guest control channel.

### Verification

- `go test ./...`
- N2 runs identified the process-api transport failure mode that this fallback
  is designed to bypass.
- Follow-up unit coverage verifies the command service now executes a fixed
  runner and that the runner decodes the command, captures stdout/stderr, writes
  `result.json`, and powers off the guest.

### Files Modified

- `apps/orchestrator/main.go`
- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `README.md`
- `docs/histories/2026-06/20260620-1419-add-sandbox-command-runner.md`
