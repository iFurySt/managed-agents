import {
  Bot,
  Box,
  Boxes,
  Braces,
  ChevronDown,
  CircleDollarSign,
  Database,
  FileText,
  Gauge,
  Home,
  Info,
  KeyRound,
  Plus,
  Search,
  Settings,
  Shield,
  Terminal,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { createAgent, getAgent, listAgents, listCollection } from "./api";
import { Badge, Button, CdsTabs, ConsoleDialog, DataTable, FieldSelect, SidebarItem, TextInput } from "./components/cds";
import type { Agent, CollectionName, Resource } from "./types";

const managedRoutes: { path: CollectionName; title: string; description: string; action: string }[] = [
  { path: "sessions", title: "Sessions", description: "View and inspect managed agent sessions.", action: "Create session" },
  { path: "deployments", title: "Deployments", description: "Manage previews and promoted artifacts.", action: "Create deployment" },
  { path: "environments", title: "Environments", description: "Configure sandbox runtimes and policies.", action: "Create environment" },
  { path: "vaults", title: "Credential vaults", description: "Manage scoped credentials and secret bindings.", action: "Create vault" },
  { path: "memory-stores", title: "Memory stores", description: "Manage reusable agent knowledge stores.", action: "Create memory store" },
  { path: "files", title: "Files", description: "Browse uploads, outputs, artifacts, and snapshots.", action: "Upload file" },
  { path: "skills", title: "Skills", description: "Package and mount reusable agent capabilities.", action: "Create skill" }
];

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-6 pb-8 pt-4">
            <Banner />
            <Routes>
              <Route path="/" element={<Navigate to="/agents" replace />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:id" element={<AgentDetailPage />} />
              {managedRoutes.map((route) => (
                <Route key={route.path} path={`/${route.path}`} element={<CollectionPage route={route} />} />
              ))}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-line bg-canvas px-3">
      <div className="flex h-16 items-center justify-between">
        <div className="text-xl font-semibold tracking-[-0.01em]">Claude Console</div>
        <Button variant="ghost" className="h-7 w-7 px-0" aria-label="Collapse sidebar">
          <span className="h-5 w-5 rounded border border-muted" />
        </Button>
      </div>
      <button className="mb-5 flex h-9 items-center justify-between rounded-cds border border-line bg-white px-3 text-sm shadow-sm">
        <span className="flex items-center gap-2">
          <Box className="h-4 w-4 text-[#8b6fff]" />
          Default
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-3">
        <IconItem icon={<Home />} label="Dashboard" />
        <IconItem icon={<KeyRound />} label="API keys" />
        <Group icon={<Wrench />} label="Build" items={["Workbench", "Files", "Skills", "Batches"]} />
        <Group
          icon={<Braces />}
          label="Managed Agents"
          items={["Quickstart", "Agents", "Sessions", "Deployments", "Environments", "Credential vaults", "Memory stores"]}
          managed
        />
        <Group icon={<Gauge />} label="Analytics" items={["Usage", "Caching", "Rate limits", "Cost", "Logs"]} />
        <Group icon={<Terminal />} label="Claude Code" items={["Usage", "Settings"]} />
        <Group icon={<Settings />} label="Manage" items={["Limits", "Service accounts", "Privacy controls", "Security", "Webhooks", "Tags"]} />
      </nav>
      <div className="-mx-3 border-t border-line px-3 py-3">
        <IconItem icon={<FileText />} label="Documentation" />
        <IconItem icon={<CircleDollarSign />} label="Credits" right="USD 3.10" />
        <div className="mt-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-md border border-line bg-fill">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Leo</div>
            <div className="truncate text-xs text-muted">Admin · Leo's Individual Org</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </div>
      </div>
    </aside>
  );
}

function IconItem({ icon, label, right }: { icon: React.ReactNode; label: string; right?: string }) {
  return (
    <div className="flex h-9 items-center gap-3 rounded-lg px-2 text-sm font-medium text-[#4e4a45]">
      <span className="text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {right ? <span className="text-muted">{right}</span> : null}
    </div>
  );
}

function Group({ icon, label, items, managed = false }: { icon: React.ReactNode; label: string; items: string[]; managed?: boolean }) {
  const toPath = (item: string) => {
    if (!managed) return "#";
    if (item === "Quickstart") return "#";
    return `/${item.toLowerCase().replaceAll(" ", "-").replace("credential-vaults", "vaults")}`;
  };
  return (
    <div className="flex flex-col">
      <div className="flex h-9 items-center gap-3 rounded-lg px-2 text-sm font-semibold text-[#4e4a45]">
        <span className="text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) =>
          managed && item !== "Quickstart" ? (
            <SidebarItem key={item} to={toPath(item)} inset badge={item === "Deployments" ? "New" : undefined}>
              {item}
            </SidebarItem>
          ) : (
            <div key={item} className="flex h-9 items-center rounded-lg pl-10 text-sm text-[#4e4a45]">
              {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Banner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div data-cds="Banner" className="mb-12 flex items-start gap-4 rounded-cds border border-line bg-white px-4 py-4">
      <Info className="mt-0.5 h-4 w-4 text-muted" />
      <div className="flex-1 text-sm">
        <span>Update June 12: We've suspended access to Claude Fable 5 and Claude Mythos 5. Please use Opus 4.8 or another model.</span>
        <div>
          <Button className="mt-3" size="md">
            Learn more here
          </Button>
        </div>
      </div>
      <Button variant="ghost" className="h-7 w-7 px-0" onClick={() => setVisible(false)} aria-label="Dismiss banner">
        ×
      </Button>
    </div>
  );
}

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [created, setCreated] = useState("All time");
  const [status, setStatus] = useState("Active");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Create and manage autonomous agents."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create agent
          </Button>
        }
      />
      <div className="flex items-center gap-2">
        <div className="relative w-[486px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <TextInput className="pl-9" placeholder="Search by name or exact ID" />
        </div>
        <FieldSelect label="Created" value={created} options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]} onValueChange={setCreated} />
        <FieldSelect label="Status" value={status} options={["Active", "Archived", "All"]} onValueChange={setStatus} />
      </div>
      <DataTable
        rows={agents}
        getKey={(agent) => agent.id}
        columns={[
          {
            key: "id",
            header: "ID",
            width: "190px",
            render: (agent) => (
              <div className="font-mono font-semibold">
                <span>{shortId(agent.id)}</span>
                <div className="hidden">{agent.id}</div>
              </div>
            )
          },
          {
            key: "name",
            header: "Name",
            width: "330px",
            render: (agent) => (
              <Link className="font-medium hover:underline" to={`/agents/${agent.id}`}>
                {agent.name}
              </Link>
            )
          },
          { key: "model", header: "Model", width: "210px", render: (agent) => <span className="font-mono text-muted">{agent.model}</span> },
          { key: "status", header: "Status", width: "150px", render: (agent) => <Badge tone="green">{agent.status}</Badge> },
          { key: "created", header: "Created", width: "150px", render: () => <span className="text-muted">2 days ago</span> },
          { key: "updated", header: "Last updated", width: "160px", render: () => <span className="text-muted">2 days ago</span> }
        ]}
      />
      <div className="flex gap-2">
        <Button variant="secondary" className="h-8 w-8 px-0">
          ‹
        </Button>
        <Button variant="secondary" className="h-8 w-8 px-0">
          ›
        </Button>
      </div>
      <CreateAgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(agent) => setAgents((items) => [agent, ...items])}
      />
    </section>
  );
}

function AgentDetailPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (id) getAgent(id).then(setAgent).catch(() => setAgent(null));
  }, [id]);

  if (!agent) return <EmptyState title="Agent not found" description="The selected agent could not be loaded." />;

  return (
    <section className="flex flex-col gap-6">
      <div className="text-sm text-muted">
        <Link className="hover:underline" to="/agents">
          Agents
        </Link>{" "}
        / {agent.name}
      </div>
      <PageHeader
        title={agent.name}
        description={
          <span>
            <Badge tone="green">{agent.status}</Badge>
            <span className="ml-3 font-mono">{agent.id}</span>
            <span className="mx-2">·</span>
            Last updated 2 days ago
          </span>
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary">Edit</Button>
            <Button variant="icon" aria-label="More actions">
              ⋯
            </Button>
          </div>
        }
      />
      <p className="max-w-3xl text-sm text-muted">{agent.description}</p>
      <CdsTabs.Root defaultValue="agent" className="flex flex-col gap-5">
        <CdsTabs.List className="flex gap-1 border-b border-line">
          {["Agent", "Sessions", "Deployments"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="h-9 border-b-2 border-transparent px-3 text-sm font-medium text-muted data-[state=active]:border-ink data-[state=active]:text-ink"
            >
              {tab}
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="agent" className="grid max-w-4xl gap-6">
          <DetailSection title="Model">
            <div className="font-mono text-sm">{agent.model}</div>
          </DetailSection>
          <DetailSection title="System prompt">
            <p className="max-w-4xl text-sm leading-6 text-[#3f3a35]">{agent.systemPrompt}</p>
          </DetailSection>
          <DetailSection title="MCPs and tools">
            <div className="flex items-center gap-3 rounded-cds border border-line bg-white p-4">
              <Bot className="h-5 w-5 text-muted" />
              <div>
                <div className="text-sm font-semibold">Built-in tools</div>
                <div className="font-mono text-sm text-muted">{agent.tools}</div>
              </div>
              <Badge>Tool permissions · 8</Badge>
              <Badge tone="green">Always allow</Badge>
            </div>
          </DetailSection>
          <DetailSection title="Skills">
            <EmptyState compact title="No skills configured." description="" />
          </DetailSection>
        </CdsTabs.Content>
        <CdsTabs.Content value="sessions">
          <EmptyState title="No sessions yet" description="Sessions launched by this agent will appear here." />
        </CdsTabs.Content>
        <CdsTabs.Content value="deployments">
          <EmptyState title="No deployments yet" description="Deployments created by this agent will appear here." />
        </CdsTabs.Content>
      </CdsTabs.Root>
    </section>
  );
}

function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (agent: Agent) => void;
}) {
  const [description, setDescription] = useState("Summarizes new GitHub PRs and posts a digest to Slack.");
  const yaml = useMemo(
    () => `name: Untitled agent
description: A blank starting point with the core toolset.
model: claude-sonnet-4-6
system: You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end.
mcp_servers: []
tools:
  - type: agent_toolset_20260401
skills: []`,
    []
  );

  async function submit() {
    const agent = await createAgent({
      name: "Untitled agent",
      description: "A blank starting point with the core toolset.",
      model: "claude-sonnet-4-6",
      systemPrompt: yaml
    });
    onCreated(agent);
    onOpenChange(false);
  }

  return (
    <ConsoleDialog title="Create agent" description="Start from a template or describe what you need." open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[calc(86vh-92px)] overflow-y-auto px-6 pb-0 pt-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ChevronDown className="h-4 w-4" />
          Starting point
          <span className="text-muted">·</span>
          <span className="font-normal text-muted">Blank agent</span>
        </div>
        <div className="rounded-cds border border-line bg-fill p-1">
          <div className="grid grid-cols-2 rounded-control bg-fill text-sm">
            <button className="h-9 rounded-control bg-white font-medium shadow-sm">Describe your agent</button>
            <button className="h-9 text-muted">Template</button>
          </div>
          <div className="mt-3 flex min-h-[116px] rounded-control border border-line bg-white p-3">
            <textarea
              className="min-h-[84px] flex-1 resize-none border-0 text-sm outline-none placeholder:text-muted"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Button variant="secondary" className="self-end">
              Generate
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <h2 className="mb-3 text-base font-semibold">Agent config</h2>
          <div className="rounded-cds border border-line bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded-full bg-fill p-1 text-sm">
                <button className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">YAML</button>
                <button className="rounded-full px-3 py-1 text-muted">JSON</button>
              </div>
              <Button variant="ghost" className="h-7 w-7 px-0" aria-label="Copy config">
                ⧉
              </Button>
            </div>
            <pre className="min-h-[190px] whitespace-pre-wrap font-mono text-sm leading-6">
              <CodeYaml source={yaml} />
            </pre>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-5 flex justify-end border-t border-transparent bg-white px-6 py-5">
          <Button onClick={submit}>Create agent</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CodeYaml({ source }: { source: string }) {
  return (
    <>
      {source.split("\n").map((line, index) => {
        const [key, rest] = line.includes(":") ? line.split(/:(.*)/s) : ["", line];
        return (
          <span key={`${line}-${index}`}>
            {key ? <span className="text-[#d04444]">{key}:</span> : null}
            <span className="text-[#348b34]">{key ? rest : line}</span>
            {"\n"}
          </span>
        );
      })}
    </>
  );
}

function CollectionPage({ route }: { route: { path: CollectionName; title: string; description: string; action: string } }) {
  const [items, setItems] = useState<Resource[]>([]);
  useEffect(() => {
    listCollection(route.path).then(setItems).catch(() => setItems([]));
  }, [route.path]);
  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title={route.title}
        description={route.description}
        action={
          <Button>
            <Plus className="h-4 w-4" />
            {route.action}
          </Button>
        }
      />
      {items.length ? (
        <DataTable
          rows={items}
          getKey={(item) => item.id}
          columns={[
            { key: "id", header: "ID", width: "210px", render: (item) => <span className="font-mono font-semibold">{item.id}</span> },
            { key: "name", header: "Name", width: "340px", render: (item) => <span className="font-medium">{item.name}</span> },
            { key: "primary", header: "Primary", width: "240px", render: (item) => <span className="text-muted">{item.primary}</span> },
            { key: "status", header: "Status", width: "150px", render: (item) => <Badge tone={item.status === "Failed" ? "red" : "green"}>{item.status}</Badge> },
            { key: "updated", header: "Last updated", width: "180px", render: (item) => <span className="text-muted">{item.secondary}</span> }
          ]}
        />
      ) : (
        <EmptyState title={`No ${route.title.toLowerCase()} yet`} description={`${route.title} will appear here as they are created.`} />
      )}
    </section>
  );
}

function PageHeader({ title, description, action }: { title: string; description: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-[-0.01em]">{title}</h1>
        <div className="text-sm text-muted">{description}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div className={`rounded-cds border border-dashed border-line bg-white text-center ${compact ? "p-4" : "p-10"}`}>
      <Shield className="mx-auto mb-3 h-5 w-5 text-muted" />
      <div className="text-sm font-medium">{title}</div>
      {description ? <div className="mt-1 text-sm text-muted">{description}</div> : null}
    </div>
  );
}

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 7)}…${id.slice(-6)}`;
}
