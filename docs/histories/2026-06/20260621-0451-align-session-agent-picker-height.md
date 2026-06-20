## [2026-06-21 04:51] | Task: Align Session agent picker height

### Execution Context

- Agent ID: Codex
- Base Model: GPT-5
- Runtime: Codex CLI

### User Query

> Continue OBU-based Claude Console cloning, including dialogs and nested interactions inside each managed-agents module.

### Changes Overview

- Area: Console Sessions create dialog
- Key actions:
  - Compared the Claude Console and local `Create session` dialog Agent picker dropdown with OBU.
  - Increased the Agent picker popover maximum height to match the source dropdown frame.
  - Increased the option viewport height so the local picker exposes the same amount of option content.

### Design Intent

The local Agent picker dropdown in the Sessions create dialog was visibly shorter than the Claude Console source. Matching the source dropdown height keeps the dialog interaction closer to the original without changing the selection behavior or data model.

### Files Modified

- `apps/console/src/App.tsx`
