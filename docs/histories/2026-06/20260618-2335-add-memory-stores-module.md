# Add Memory Stores Module

## Request

Continue cloning the Claude Platform Managed Agents console one module at a
time, using browser evidence for the Memory Stores page, detail view, menus,
and dialogs.

## Changes

- Promoted memory stores from generic resource rows to first-class apiserver
  models with memory records.
- Added Memory Stores API endpoints for list, detail, create, archive, delete,
  add memory, and delete memory.
- Seeded the Memory Stores view with the observed Claude Console rows and a
  `world cup` detail tree containing memory files.
- Added console routes for `/memory-stores` and `/memory-stores/:id`.
- Added Memory Stores list, Create memory store dialog, detail tree, selected
  memory preview/source tabs, Add memory dialog, store actions, and memory
  record actions.

## Design Notes

Memory Stores now match the repository direction of keeping product CRUD modules
inside `apiserver` for the MVP. Files and Skills remain on the generic resource
surface until those modules are cloned.

## Validation

- `npm run build:console`
- `go test ./...`
- API smoke for list/detail/create/add/archive/delete.
- Browser verification of the local list, detail, Create memory store dialog,
  Add memory dialog, store action menu, and memory record action menu.
