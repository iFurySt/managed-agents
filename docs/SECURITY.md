# Security

Use this document to make secure defaults explicit and legible to agents.

Dependency, SBOM, and provenance integration guidance lives in
`docs/SUPPLY_CHAIN_SECURITY.md`.

## Managed Agents Security Defaults

- Treat every guest session as untrusted code execution.
- Use Firecracker isolation as the production target; local non-VM runners are
  development conveniences only.
- Keep durable provider secrets in the control plane vault. Guests should
  receive session-scoped proxy credentials, short-lived tokens, or file
  descriptors with explicit lifetime and audit records.
- Enforce egress policy at the host/network gateway. Private networks,
  metadata-service addresses, and loopback-to-host paths require explicit
  allow rules.
- Mount session files with the least privilege needed: uploads and skills are
  read-only by default; outputs are read-write; memory write access must be
  separately granted.
- Validate archive imports, snapshots, and skill packages for path traversal,
  symlink escape, file size, manifest integrity, and allowed file types.
- Register MCP tools per session with explicit permission policy and bearer
  tokens. Do not let arbitrary MCP config silently inherit broad credentials.
- Audit every mutating action on agents, sessions, vault entries, files, skills,
  deployments, environments, and hosts.

## Data Handling

- Session prompts, logs, files, memory documents, and diagnostic bundles are
  user data.
- Credential values must not be written to logs, histories, session events,
  diagnostics, or workspace files.
- Filestore objects should carry TTL, checksum, media type, and quarantine
  metadata once the storage service exists.
- Memory stores need namespace-level access policy and retention rules before
  automatic memory writes are enabled.

## External Integrations

- Git providers, deployment providers, package registries, and model providers
  should be mediated by scoped adapters or proxies.
- Webhooks and tunnel actions need request ids, actor identity, authorization
  checks, replay protection, and structured audit events.
- Deploy actions must prevent leaking internal infrastructure files or secrets
  into published artifacts.
