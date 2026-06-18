## [2026-06-18 23:16] | Task: Add managed agents vaults module

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `Codex CLI`

### User Query

> Continue cloning Claude Platform Managed Agents pages with OBU evidence, landing each module as a verified milestone.

### Changes Overview

- Area: Managed Agents control plane and console UI.
- Key actions:
  - Captured Claude Platform Credential Vaults list, create flow, detail page, add credential dialog, and action menu with Open Browser Use.
  - Added first-class `Vault` and `VaultCredential` storage and API routes in `apiserver`.
  - Replaced the generic vaults collection page with dedicated React list, create-vault flow, detail page, add-credential dialog, and archive/delete menus.
  - Seeded representative vault credential metadata with redacted/example targets instead of copying real credential identifiers.
  - Verified Go tests, console production build, API smoke paths, and OBU-rendered local UI pages.

### Design Intent

Credential vaults stay inside `apiserver` for the MVP, matching the repository boundary that keeps CRUD, vault metadata, and release-policy surfaces in the control plane. The implementation models vaults and credentials separately so later runtime release APIs can audit credential access without reshaping the console surface.

### Files Modified

- `apps/apiserver/main.go`
- `apps/console/src/App.tsx`
- `apps/console/src/api.ts`
- `apps/console/src/components/cds.tsx`
- `apps/console/src/types.ts`
