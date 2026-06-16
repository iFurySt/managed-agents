## [2026-06-16 23:14] | Task: Remove unused CI/CD scaffolding

### Execution Context

- Agent ID: `Codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Delete unused CI/CD.

### Changes Overview

- Area: Repository workflow documentation and pull request templates.
- Key actions: Removed the standalone CI/CD placeholder guide and stale `make ci` checklist item, then updated references that pointed contributors to nonexistent CI/CD automation.

### Design Intent

The template intentionally does not ship placeholder CI/CD. Keeping a dedicated CI/CD guide and a `make ci` checkbox implied automation that does not exist, so the guidance now lives only in the general collaboration and supply-chain posture docs until a real stack needs real pipelines.

### Files Modified

- `AGENTS.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `docs/REPO_COLLAB_GUIDE.md`
- `docs/RELIABILITY.md`
- `docs/CICD.md`
- `docs/histories/2026-06/20260616-2314-remove-unused-cicd.md`
