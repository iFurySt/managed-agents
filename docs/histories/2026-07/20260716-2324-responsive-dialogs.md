# Responsive Dialogs

## Summary

- Fixed create/edit dialogs that could overflow narrow split-screen viewports.
- Applied the same viewport-safe dialog rules across shared and direct Radix dialog implementations.

## User Request

The Create Session dialog was too wide and too tall on a narrow split-screen window. Check all pages with dialogs and fix the same class of issue in one pass.

## Changes

- Added viewport-safe dialog width tokens using `min(target-width, calc(100dvw - 32px))`.
- Updated `ConsoleDialog` defaults to enforce viewport max width and height.
- Reworked Create Session, Create Agent, Edit Agent, Create Deployment, Environment, Vault, Credential, Memory, and Skill dialog shells to use the shared responsive width caps.
- Changed fixed-width modal internals to full-width/min-width-safe controls, including Create Session select popovers, Deployment pickers, Credential select triggers, and direct Radix confirmation dialogs.
- Documented the modal responsive rule in `docs/references/claude-console/DESIGN.md`.

## Verification

- `npm --workspace apps/console run lint`
- OBU checked Create Session, Create Deployment, and Create Agent at a 560px viewport with no document-level horizontal overflow and dialogs contained inside the viewport.
