## [2026-06-17 20:05] | Task: Document GCP Firecracker harness

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Record the validated GCP N2 nested-virtualization Firecracker test workflow in the repo, with sensitive details redacted, so future development agents can reuse it.

### Changes Overview

- Area: Repository-local cloud testing references.
- Key actions: Added a reusable GCP Firecracker KVM harness guide, linked it from the references index, and kept account, billing, IP, and project identifiers out of the documented workflow.

### Design Intent

The repository should preserve repeatable infrastructure knowledge instead of relying on chat history. The guide documents the tested machine shape, nested virtualization flags, KVM verification signals, Firecracker smoke-test steps, and cleanup commands using parameterized values so the workflow remains useful without exposing personal or billing details.

### Files Modified

- `docs/references/gcp-firecracker-kvm.md`
- `docs/references/README.md`
- `docs/histories/2026-06/20260617-2005-document-gcp-firecracker-harness.md`
