# managed-agents

中文版本：[`managed-agents-cn`](https://github.com/iFurySt/managed-agents-cn)

## Intro

An agent-first base repo template for building any product you want. For a closer look at how this approach works in daily practice, see [Daily Harness](https://www.ifuryst.com/en/blog/2026/daily-harness/).

## Quick Start

Run the managed agents console locally:

```sh
docker compose -f infra/docker-compose.postgres.yml up -d postgres
go run ./apps/apiserver
npm install
npm run dev:console
```

Then open `http://localhost:5173`.

The API server uses Postgres by default:

```text
DATABASE_URL=postgres://managed_agents:managed_agents@localhost:5432/managed_agents?sslmode=disable
APISERVER_ADDR=:8080
```

Run one queued session or deployment work item through the orchestrator:

```sh
# Uses local Codex CLI auth and writes results back to Postgres.
go run ./apps/orchestrator run-once

# Deterministic local verifier that avoids model calls.
ORCHESTRATOR_SHELL_COMMAND='printf orchestrator-ok' \
  go run ./apps/orchestrator --runtime shell --runtime-timeout 30s run-once
```

Run the host-plane Firecracker smoke test on a Linux host with KVM:

```sh
GOOS=linux GOARCH=amd64 go build -o /opt/managed-agents/bin/process-api ./apps/process-api
GOOS=linux GOARCH=amd64 go build -o /opt/managed-agents/bin/sandboxd ./apps/sandboxd

go run ./apps/sandboxd doctor
go run ./apps/sandboxd pull --work-dir /opt/managed-agents/firecracker --sudo
go run ./apps/sandboxd sandbox start sbx-dev --work-dir /opt/managed-agents/firecracker --sudo --process-api
go run ./apps/sandboxd sandbox ping sbx-dev --work-dir /opt/managed-agents/firecracker
go run ./apps/sandboxd sandbox exec sbx-dev --work-dir /opt/managed-agents/firecracker -- /bin/uname -m
go run ./apps/sandboxd sandbox process start sbx-dev --work-dir /opt/managed-agents/firecracker -- /bin/sleep 30
go run ./apps/sandboxd sandbox status sbx-dev --work-dir /opt/managed-agents/firecracker
go run ./apps/sandboxd sandbox stop sbx-dev --work-dir /opt/managed-agents/firecracker
go run ./apps/sandboxd sandbox rm sbx-dev --work-dir /opt/managed-agents/firecracker

# Or run the full lifecycle verifier:
go run ./apps/sandboxd verify --work-dir /opt/managed-agents/firecracker --sudo

# Or run the host-local sandboxd daemon API:
go run ./apps/sandboxd serve --work-dir /opt/managed-agents/firecracker --sudo --listen 127.0.0.1:8787
```

With `sandboxd serve` running on a KVM host, the orchestrator can execute a
queued work item inside a Firecracker guest through `process-api`:

```sh
ORCHESTRATOR_SHELL_COMMAND='printf sandbox-orchestrator-ok' \
  go run ./apps/orchestrator \
    --runtime sandbox-shell \
    --sandboxd-url http://127.0.0.1:8787 \
    --process-api-bin /opt/managed-agents/bin/process-api \
    --runtime-timeout 2m \
    run-once
```

If the CI guest image does not expose a usable host-to-guest process-api
transport, use the one-shot command runner. It injects a systemd unit into the
guest rootfs, runs the command inside Firecracker, powers off, and reads the
result back from the guest disk:

```sh
ORCHESTRATOR_SHELL_COMMAND='printf sandbox-orchestrator-ok' \
  go run ./apps/orchestrator \
    --runtime sandbox-command \
    --sandboxd-url http://127.0.0.1:8787 \
    --runtime-timeout 3m \
    run-once
```

For the reusable GCP N2 nested-virtualization harness and sync commands, see
[`docs/references/gcp-firecracker-kvm.md`](docs/references/gcp-firecracker-kvm.md).

## Template Usage

Use GitHub's template flow from the top right of this repository:

1. Select **Use this template**.
2. Select [**Create a new repository**](https://github.com/new?template_name=managed-agents&template_owner=iFurySt).

Or initialize a new or existing repository with [`harness-cli`](https://github.com/iFurySt/harness-cli).
Install it from npm first:

```sh
npm install -g @ifuryst/harness-cli
```

Then run:

```sh
harness-cli init --language en
```

`harness-cli` requires Node.js 18+ and Go on your `PATH`.

## License

[MIT](LICENSE)

## Note

This approach comes from our own exploration, while also drawing on some ideas from OpenAI's [harness engineering write-up](https://openai.com/index/harness-engineering/).
