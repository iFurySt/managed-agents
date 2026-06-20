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
  - Follow-up: taught `sandboxd` to treat the injected command's console
    completion marker or guest halt as a completed run, then terminate the
    Firecracker process and read the already-synced result from the rootfs.
  - Follow-up: gave the orchestrator sandbox-command HTTP call a response
    window slightly longer than the guest runtime timeout so sandboxd can return
    the final result instead of racing the caller context.
  - Follow-up: added `network: true` support to sandboxd `POST /runs`, including
    guest network service injection, host tap forwarding/NAT, DNS setup, and CA
    bundle injection for HTTPS clients.
  - Follow-up: added orchestrator `sandbox-codex`, which reads host-side Codex
    auth, starts a networked Firecracker one-shot guest, downloads the Linux
    Codex release in the guest, runs `codex exec --json`, and records the final
    Codex message as the agent session event.

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
- Follow-up unit coverage verifies the guest command console completion signals.
- N2 host validation:
  - Direct sandboxd `POST /runs` completed in a real Firecracker guest with
    stdout `n2-direct-command-ok-2`, exit code `0`, and no residual sandbox
    directory or Firecracker process.
  - Full apiserver-to-orchestrator-to-sandboxd flow completed on the same N2
    host: session `sesn_local_20260620064644146788605`, work
    `ewrk_msg_20260620064644180480194`, output
    `n2-orchestrator-command-ok`, session status `Idle`, and work state
    `stopped`.
  - Networked `POST /runs` completed on the same N2 host with guest `eth0`
    `LOWER_UP`, IPv4 `172.16.69.2/30`, default route via the host tap, DNS
    resolvers, and HTTPS reachability to the OpenAI API returning HTTP `401`
    without TLS errors.
  - Full apiserver-to-orchestrator-to-guest-Codex flow completed on the same N2
    host: session `sesn_local_20260620072004905844325`, work
    `ewrk_msg_20260620072004938393086`, runtime `sandbox-codex`, guest
    `codex-cli 0.141.0`, output `n2-orchestrator-codex-ok`, session status
    `Idle`, and work state `stopped`.

### Files Modified

- `apps/orchestrator/main.go`
- `apps/orchestrator/main_test.go`
- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `README.md`
- `docs/design-docs/orchestrator-agent-runtime-plan.md`
- `docs/histories/2026-06/20260620-1419-add-sandbox-command-runner.md`
