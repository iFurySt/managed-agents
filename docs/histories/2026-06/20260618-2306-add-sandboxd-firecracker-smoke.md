## [2026-06-18 23:06] | Task: Add sandboxd Firecracker path

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Switch this forked workstream to sandboxd and Firecracker, document the existing firecracker-harness environment in a redacted way, and start proving the single-node sandbox path with real validation. Continue by making sandboxd handle sandbox lifecycle and pulling the corresponding microVM image; defer environment management and rclone until the API server side is ready.

### Changes Overview

- Area: Host plane, Firecracker harness, sandbox lifecycle smoke validation.
- Key actions:
  - Added `apps/sandboxd`, a Cobra CLI with `doctor`, `prepare`, and `smoke` commands.
  - Implemented Firecracker asset preparation for a kernel, Ubuntu rootfs, and Firecracker binary.
  - Implemented a real Firecracker API boot path over the Unix socket.
  - Added `pull` and `sandbox start/status/list/stop` commands backed by per-sandbox state files.
  - Added per-sandbox rootfs copies so running sandboxes do not share a writable base image.
  - Added sandboxd unit coverage for image aliases, sandbox id validation, and state file round trips.
  - Updated the GCP Firecracker harness reference with the reusable project, VM shape, IAP SSH/SCP, and binary sync workflow.
  - Added README and reference entries for the sandboxd lifecycle path.

### Design Intent

This milestone keeps `sandboxd` independent from `apiserver` and `orchestrator` while proving the host-local boundary that will later receive scheduled work. The first useful slice was a real microVM boot on a nested-virtualization host, not a mock runner. The follow-up slice turns that boot path into a small local lifecycle surface: pull an image, start a named sandbox, inspect its host process and state, and stop it cleanly.

### Verification

- Local:
  - `go test ./...`
  - `GOOS=linux GOARCH=amd64 go build -o /tmp/managed-agents-sandboxd ./apps/sandboxd`
- Remote GCP harness:
  - Started the reusable `firecracker-harness` VM.
  - Ran `sandboxd doctor`; verified VMX, `/dev/kvm`, and `kvm_intel`/`kvm` modules.
  - Ran `sandboxd smoke`; Firecracker booted an Ubuntu microVM and the serial console reached a Linux boot signal.
  - Confirmed no Firecracker process was left running after the smoke test.
  - Ran `sandboxd pull` for `firecracker-ci-ubuntu-22.04`.
  - Ran `sandboxd sandbox start`, `status`, and `stop`; verified booted state, sandbox-local rootfs, console log, live PID during status, and no remaining Firecracker process after stop.

### Files Modified

- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `docs/references/gcp-firecracker-kvm.md`
- `README.md`
- `docs/histories/2026-06/20260618-2306-add-sandboxd-firecracker-smoke.md`
