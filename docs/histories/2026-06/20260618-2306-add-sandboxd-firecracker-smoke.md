## [2026-06-18 23:06] | Task: Add sandboxd Firecracker path

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Switch this forked workstream to sandboxd and Firecracker, document the existing firecracker-harness environment in a redacted way, and start proving the single-node sandbox path with real validation. Continue by making sandboxd handle sandbox lifecycle, cleanup, pulling the corresponding microVM image, and adding the minimum process-api path, including guest command execution and process lifecycle control; defer environment management and rclone until the API server side is ready.

### Changes Overview

- Area: Host plane, Firecracker harness, sandbox lifecycle smoke validation.
- Key actions:
  - Added `apps/sandboxd`, a Cobra CLI with `doctor`, `prepare`, and `smoke` commands.
  - Implemented Firecracker asset preparation for a kernel, Ubuntu rootfs, and Firecracker binary.
  - Implemented a real Firecracker API boot path over the Unix socket.
  - Added `pull` and `sandbox start/status/list/stop` commands backed by per-sandbox state files.
  - Added per-sandbox rootfs copies so running sandboxes do not share a writable base image.
  - Added sandboxd unit coverage for image aliases, sandbox id validation, and state file round trips.
  - Added `apps/process-api`, a minimal guest process API exposing `/healthz` and `/shutdown`.
  - Added process-api rootfs injection, systemd service setup, Firecracker tap networking, and `sandbox ping`.
  - Added `POST /exec` to process-api plus `sandboxd sandbox exec` for host-to-guest command execution.
  - Added process-api `POST /processes`, `GET /processes/{id}`, and `POST /processes/{id}/signal` plus `sandboxd sandbox process start/status/signal`.
  - Added `sandboxd sandbox rm` to remove stopped sandbox directories and per-sandbox rootfs files, with `--force` for running sandboxes.
  - Added `sandboxd verify`, a single full lifecycle verifier that runs start, process-api health, exec, long-running process lifecycle, signal, stop, and remove.
  - Kept vsock support in code, but used TCP/tap for the CI Ubuntu rootfs because that image does not ship guest vsock kernel modules.
  - Updated the GCP Firecracker harness reference with the reusable project, VM shape, IAP SSH/SCP, and binary sync workflow.
  - Added README and reference entries for the sandboxd lifecycle and process-api paths.

### Design Intent

This milestone keeps `sandboxd` independent from `apiserver` and `orchestrator` while proving the host-local boundary that will later receive scheduled work. The first useful slice was a real microVM boot on a nested-virtualization host, not a mock runner. The follow-up slices turn that boot path into a small local lifecycle surface and prove that a guest process-api can be injected into the microVM, started by systemd, reached from the host, execute commands, manage long-running processes, return stdout/stderr/exit status, and be cleaned up with the sandbox directory removed afterward.

### Verification

- Local:
  - `go test ./...`
  - `GOOS=linux GOARCH=amd64 go build -o /tmp/managed-agents-sandboxd ./apps/sandboxd`
  - `GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /tmp/managed-agents-process-api ./apps/process-api`
- Remote GCP harness:
  - Started the reusable `firecracker-harness` VM.
  - Ran `sandboxd doctor`; verified VMX, `/dev/kvm`, and `kvm_intel`/`kvm` modules.
  - Ran `sandboxd smoke`; Firecracker booted an Ubuntu microVM and the serial console reached a Linux boot signal.
  - Confirmed no Firecracker process was left running after the smoke test.
  - Ran `sandboxd pull` for `firecracker-ci-ubuntu-22.04`.
  - Ran `sandboxd sandbox start`, `status`, and `stop`; verified booted state, sandbox-local rootfs, console log, live PID during status, and no remaining Firecracker process after stop.
  - Ran `sandboxd sandbox start --process-api`, `sandboxd sandbox ping`, and `sandboxd sandbox stop`; verified guest `/healthz`, `process_api_ready` in the console, Firecracker running during ping, and no Firecracker or tap device remaining after stop.
  - Ran `sandboxd sandbox exec`; verified `uname -m`, guest cwd/env propagation, non-zero guest exit status, stderr capture, and cleanup after stop.
  - Ran `sandboxd sandbox process start/status/signal`; verified running and exited states, stdout capture for a long-running shell command, TERM signaling for a sleep process, and no Firecracker or tap device remaining after stop.
  - Ran `sandboxd sandbox rm`; verified the stopped sandbox directory and rootfs were removed.
  - Ran `sandboxd verify`; verified the full lifecycle returns `verify=passed` and removes its temporary sandbox.

### Files Modified

- `apps/process-api/main.go`
- `apps/process-api/vsock_linux.go`
- `apps/process-api/vsock_unsupported.go`
- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `go.mod`
- `docs/references/gcp-firecracker-kvm.md`
- `README.md`
- `docs/histories/2026-06/20260618-2306-add-sandboxd-firecracker-smoke.md`
