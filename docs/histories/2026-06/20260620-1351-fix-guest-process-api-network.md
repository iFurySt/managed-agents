## [2026-06-20 13:51] | Task: Fix guest process-api network

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue the real orchestrator-to-sandbox runtime validation on an N2
> Firecracker host, fixing issues found by actual execution.

### Changes Overview

- Area: `sandboxd`, Firecracker guest process-api networking.
- Key actions:
  - Moved TCP guest network calculation before rootfs injection.
  - Injected a `managed-agents-network.service` into the guest rootfs.
  - Made `process-api.service` depend on the managed guest network service.
  - Added tests for the generated network service and process-api service
    dependency.

### Design Intent

The first N2 run booted Firecracker and started process-api inside the guest,
but the host could not route to the guest TCP address. Relying on the base image
network service was too implicit, so `sandboxd` now injects a deterministic
guest `eth0` static IP service matching the tap network selected for the
sandbox.

### Verification

- `go test ./...`
- N2 Firecracker run reached guest boot and exposed the missing host-to-guest
  route as the failure being fixed by this change.

### Files Modified

- `apps/sandboxd/main.go`
- `apps/sandboxd/main_test.go`
- `docs/histories/2026-06/20260620-1351-fix-guest-process-api-network.md`
