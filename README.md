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

Run the host-plane Firecracker smoke test on a Linux host with KVM:

```sh
go run ./apps/sandboxd doctor
go run ./apps/sandboxd pull --work-dir /opt/managed-agents/firecracker --sudo
go run ./apps/sandboxd sandbox start sbx-dev --work-dir /opt/managed-agents/firecracker --sudo
go run ./apps/sandboxd sandbox status sbx-dev --work-dir /opt/managed-agents/firecracker
go run ./apps/sandboxd sandbox stop sbx-dev --work-dir /opt/managed-agents/firecracker
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
