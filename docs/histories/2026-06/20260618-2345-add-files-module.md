# Add Files Module

## Request

Continue cloning the Claude Platform Managed Agents console one module at a
time, using browser evidence for the Files page and its empty-state
interactions.

## Changes

- Promoted workspace files from the generic resource surface to a first-class
  `apiserver` model and API.
- Added Files API endpoints for list, detail, local create, and delete.
- Added real SHA-256 checksums for locally created file records.
- Added console routes for `/files` and `/files/:id`.
- Matched the observed Claude Files empty state with the Default workspace copy,
  Python/cURL language selector, docs link, copy button, and upload code
  templates.
- Added a local file list and detail view for future non-empty filestore data.

## Design Notes

The observed Claude workspace had no uploaded files and did not expose an upload
button in the UI. The default console surface therefore renders the same empty
state while still giving the backend a real filestore model for later session
artifact work.

## Validation

- `npm run build:console`
- `go test ./...`
- API smoke for empty list, create, detail, delete, and empty list again.
- Browser verification of the local Files empty state, Python template, cURL
  template, language selector, docs link, and copy-code control.
