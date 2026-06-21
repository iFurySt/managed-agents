# Align session created labels

## Request

Continue converging the Claude Console clone against the source platform without expanding scope.

## Changes

- Updated the seeded sessions list so the first two source-matched rows display `Jun 18`, matching the current Claude Platform sessions table.
- Added a focused apiserver seed test to lock those source-matched session labels.
- Kept the change limited to fixture labels after OBU comparison showed the sidebar title and collapse button styles already aligned in the current bundle.

## Files

- `apps/apiserver/main.go`
- `apps/apiserver/main_test.go`
