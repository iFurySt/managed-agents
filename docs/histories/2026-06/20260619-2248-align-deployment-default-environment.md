## [2026-06-19 22:48] | Task: Align deployment default environment

### Execution Context

- Agent ID: `codex`
- Base Model: `GPT-5`
- Runtime: `local CLI`

### User Query

> Continue cloning Claude Platform Managed Agents with OBU evidence, small verified milestones, and pushed commits.

### Changes Overview

- Area: Managed Agents console deployment creation flow.
- Key actions:
  - Captured source behavior showing that selecting `Managed SSH Reverse Tunnel Bootstrapper` auto-selects `managed-ssh-debug-env`.
  - Set the local deployment environment picker default option to the real seeded environment id.
  - Auto-filled the default environment when a deployment agent is selected and no environment is already chosen.

### Design Intent

Keep the create-deployment flow closer to Claude Platform's dependent field behavior while preserving user choice: the default environment is only filled when the field is empty, and users can still open the environment picker to change it.

### Files Modified

- `apps/console/src/App.tsx`
