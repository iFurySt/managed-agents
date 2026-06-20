# Refine Route Banner

- Compared Claude Console and local Agents pages with Open Browser Use and found the local global update banner pushed non-vault pages down.
- Made the update banner route-aware so it remains on credential vault list/detail pages while Agents and other non-vault pages return to the source top spacing.
- Reduced the non-banner page content top padding so Agents title and create action align with the source y=24 layout rhythm.
- Verified with Open Browser Use DOM geometry checks, `npm run build --workspace apps/console`, and `go test ./...`.
