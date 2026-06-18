## [2026-06-18 20:45] | Task: open managed agents planning

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `local coding agent`

### User Query

> Review the prior Anthropic Managed Agents analysis corpus and plan the
> architecture for this repository's open-source managed agents platform,
> including Codex/OpenCode agents, orchestrator, sandbox/Firecracker, storage,
> and management surfaces for agents, sessions, deployments, credential vaults,
> environments, memory stores, skills, and files.

### Changes Overview

- Area: documentation and architecture planning.
- Key actions:
  - Added a focused open managed agents architecture design document.
  - Updated the top-level architecture, product sense, security, reliability,
    frontend, design, and quality-score docs with managed-agents-specific
    direction.
  - Added initial product workflow guidance and managed runtime supply-chain
    requirements after adversarial review.
  - Added a curated local evidence summary so future work does not depend only
    on external reference paths.
  - Converged MVP service naming on `apiserver`, `orchestrator`, and `sandboxd`,
    with filestore, vault, events, skills, memory, and deployment records kept
    inside `apiserver` for the first cut.
  - Indexed the new design document.

### Design Intent

The documentation now treats managed agent sessions as inspectable product
objects backed by explicit control-plane, host-plane, and guest-plane
boundaries. The plan prioritizes one complete isolated session loop before
adding broad management features.

### Files Modified

- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/FRONTEND.md`
- `docs/PRODUCT_SENSE.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`
- `docs/SUPPLY_CHAIN_SECURITY.md`
- `docs/design-docs/index.md`
- `docs/design-docs/open-managed-agents-architecture.md`
- `docs/product-specs/index.md`
- `docs/references/README.md`
- `docs/references/anthropic-managed-agents-evidence.md`
