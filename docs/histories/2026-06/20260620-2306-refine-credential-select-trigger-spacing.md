## [2026-06-20 23:06] | Task: Refine credential select trigger spacing

### Execution Context

- Agent ID: `codex`
- Base Model: `gpt-5`
- Runtime: `Codex CLI`

### User Query

> Continue the Claude Console clone with OBU comparison and tighten nested vault dialog fidelity.

### Changes Overview

- Area: Credential vault detail, Add credential dialog.
- Key actions:
  - Compared source and local Type/MCP server combobox trigger internals with Open Browser Use.
  - Matched the credential select trigger spacing to the source `8px` left padding, `0px` right padding, and `6px` gap.
  - Added the source-style right margin to the shared `FieldSelect` chevron glyph.

### Design Intent

The credential dialog trigger boxes already matched the source outer geometry, but the local text and chevron were visibly shifted because the shared select `px-3` spacing survived inside the credential-specific trigger. This change keeps the adjustment scoped to the credential dialog trigger classes while using the shared chevron margin expected by Claude Console comboboxes.

### Verification

- Open Browser Use source check:
  - Credential Type trigger: padding `0px 0px 0px 8px`, gap `6px`, chevron x `841.8`.
  - MCP server trigger: padding `0px 0px 0px 8px`, gap `6px`, chevron x `841.8`.
- Open Browser Use local check after the change:
  - Credential Type trigger: padding `0px 0px 0px 8px`, gap `6px`, chevron x `841`.
  - MCP server trigger: padding `0px 0px 0px 8px`, gap `6px`, chevron x `841`.
- `npm run build --workspace apps/console`
- `go test ./...`

### Files Modified

- `apps/console/src/App.tsx`
- `apps/console/src/components/cds.tsx`
