import {
  Bot,
  Box,
  Boxes,
  Braces,
  ChevronDown,
  Clock,
  Copy,
  CircleDollarSign,
  Database,
  Download,
  FileText,
  Gauge,
  Home,
  Info,
  KeyRound,
  MessageSquare,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  Terminal,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import {
  cancelSession,
  createAgent,
  createDeployment,
  createSession,
  getAgent,
  getDeployment,
  getSession,
  listAgents,
  listCollection,
  listDeployments,
  listSessions,
  runDeployment
} from "./api";
import { Badge, Button, CdsTabs, ConsoleDialog, DataTable, FieldSelect, SidebarItem, TextInput } from "./components/cds";
import type { Agent, CollectionName, Deployment, Resource, Session } from "./types";

const managedRoutes: { path: CollectionName; title: string; description: string; action: string }[] = [
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
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:id" element={<SessionDetailPage />} />
              <Route path="/deployments" element={<DeploymentsPage />} />
              <Route path="/deployments/:id" element={<DeploymentDetailPage />} />
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

function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [created, setCreated] = useState("All time");
  const [agent, setAgent] = useState("All");
  const [deployment, setDeployment] = useState("All");
  const [status, setStatus] = useState("Active");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Sessions"
        description="Trace and debug Claude Managed Agents sessions."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create session
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[276px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <TextInput className="pl-9" aria-label="Search by session ID" placeholder="Search by session ID" />
        </div>
        <FieldSelect label="Created" value={created} options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]} onValueChange={setCreated} />
        <FieldSelect label="Agent" value={agent} options={["All", "Managed SSH Reverse Tunnel Bootstrapper", "World Cup Daily Digest"]} onValueChange={setAgent} />
        <FieldSelect label="Deployment" value={deployment} options={["All", "World Cup digest preview"]} onValueChange={setDeployment} />
        <FieldSelect label="Status" value={status} options={["Active", "Idle", "Cancelled", "All"]} onValueChange={setStatus} />
      </div>
      <DataTable
        rows={sessions}
        getKey={(session) => session.id}
        columns={[
          {
            key: "id",
            header: "ID",
            width: "210px",
            render: (session) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{shortId(session.id)}</span>
                <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${session.id}`}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          },
          {
            key: "name",
            header: "Name",
            width: "360px",
            render: (session) => (
              <Link className="font-medium hover:underline" to={`/sessions/${session.id}`}>
                {session.name}
              </Link>
            )
          },
          { key: "status", header: "Status", width: "140px", render: (session) => <Badge tone={sessionTone(session.status)}>{session.status}</Badge> },
          {
            key: "agent",
            header: "Agent",
            width: "320px",
            render: (session) => (
              <Button variant="ghost" className="h-[25px] justify-start px-2">
                <Braces className="h-4 w-4 text-muted" />
                {session.agentName}
              </Button>
            )
          },
          { key: "created", header: "Created", width: "160px", render: (session) => <span className="text-muted">{session.createdLabel}</span> }
        ]}
      />
      <div className="flex gap-2">
        <Button variant="secondary" className="h-8 w-8 px-0" disabled>
          ‹
        </Button>
        <Button variant="secondary" className="h-8 w-8 px-0" disabled>
          ›
        </Button>
      </div>
      <CreateSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(session) => setSessions((items) => [session, ...items])}
      />
    </section>
  );
}

function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [eventFilter, setEventFilter] = useState("All events");
  const [detailEvent, setDetailEvent] = useState<string | null>(null);

  useEffect(() => {
    if (id) getSession(id).then(setSession).catch(() => setSession(null));
  }, [id]);

  async function cancelCurrentSession() {
    if (!session) return;
    const updated = await cancelSession(session.id);
    setSession({ ...session, ...updated });
  }

  if (!session) return <EmptyState title="Session not found" description="The selected session could not be loaded." />;

  const selectedEvent = session.events?.find((event) => event.id === detailEvent) ?? session.events?.[0];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex h-[52px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/sessions">
            Sessions
          </Link>
          <span>/</span>
          <span className="font-mono text-ink">{shortId(session.id)}</span>
        </nav>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={cancelCurrentSession}>
            Actions
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4" />
            Ask Claude
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-[-0.01em]">{session.name}</h1>
          <Badge tone={sessionTone(session.status)}>{session.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Button variant="ghost" className="h-[25px] px-2">
            <Braces className="h-4 w-4" />
            {session.agentName}
          </Button>
          <span>·</span>
          <Button variant="ghost" className="h-[25px] px-2">
            <Database className="h-4 w-4" />
            {session.environmentName}
          </Button>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {session.duration}
          </span>
          <span>·</span>
          <span>{session.tokens}</span>
          <span>·</span>
          <span>{session.cost}</span>
          <span>·</span>
          <span>{session.createdLabel}</span>
        </div>
      </div>

      <CdsTabs.Root defaultValue="transcript" className="flex min-h-[620px] flex-col">
        <div className="flex h-[52px] items-center justify-between border-b border-line">
          <div className="flex items-center gap-6">
            <CdsTabs.List className="flex h-7 rounded-control bg-fill p-0.5" data-cds="SegmentedControl">
              {["Transcript", "Debug"].map((tab) => (
                <CdsTabs.Trigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="h-6 rounded-[6px] px-3 text-sm font-medium text-muted data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  {tab}
                </CdsTabs.Trigger>
              ))}
            </CdsTabs.List>
            <FieldSelect label="" value={eventFilter} options={["All events", "User", "Agent", "Tool", "System"]} onValueChange={setEventFilter} />
            <Button variant="icon" aria-label="Open search filter">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="icon" aria-label="Keyboard shortcuts">
              <Terminal className="h-4 w-4" />
            </Button>
            <Button variant="icon" aria-label="Copy all">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="icon" aria-label="Download">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CdsTabs.Content value="transcript" className="grid flex-1 grid-cols-[minmax(0,1fr)_320px]">
          <div className="py-4">
            <div className="mb-3 text-xs font-semibold text-muted">30m 9s</div>
            <div className="flex flex-col">
              {(session.events ?? []).map((event) => (
                <button
                  key={event.id}
                  className="grid h-9 grid-cols-[64px_minmax(0,1fr)_280px] items-center rounded-control px-8 text-left text-sm hover:bg-fill"
                  onClick={() => setDetailEvent(event.id)}
                >
                  <span className="font-semibold text-muted">{event.role}</span>
                  <span className="truncate">
                    <span className="font-medium">{event.kind}</span>
                    <span className="ml-2 text-muted">{event.summary}</span>
                  </span>
                  <span className="flex items-center justify-end gap-4 text-xs text-muted">
                    {event.status ? <Badge tone={event.status === "Error" ? "red" : sessionTone(event.status)}>{event.status}</Badge> : null}
                    {event.tokens ? <span>{event.tokens}</span> : null}
                    {event.cost ? <span>{event.cost}</span> : null}
                    <span>{event.offset}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <aside className="border-l border-line bg-white px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Event detail</h2>
              <Button variant="ghost" className="h-7 w-7 px-0" aria-label="Close detail panel" onClick={() => setDetailEvent(null)}>
                ×
              </Button>
            </div>
            {selectedEvent ? (
              <div className="grid gap-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-muted">ID</div>
                  <div className="mt-1 font-mono">{shortId(selectedEvent.id)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted">Type</div>
                  <div className="mt-1">{selectedEvent.role} · {selectedEvent.kind}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted">Summary</div>
                  <p className="mt-1 leading-6 text-[#3f3a35]">{selectedEvent.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-muted">Tokens</div>
                    <div className="mt-1">{selectedEvent.tokens || "–"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted">Cost</div>
                    <div className="mt-1">{selectedEvent.cost || "–"}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </CdsTabs.Content>
        <CdsTabs.Content value="debug" className="py-8">
          <DetailSection title="Mounted resources">
            <pre className="whitespace-pre-wrap rounded-cds border border-line bg-white p-4 font-mono text-sm text-[#3f3a35]">{session.resources || "No resources mounted."}</pre>
          </DetailSection>
        </CdsTabs.Content>
      </CdsTabs.Root>
    </section>
  );
}

function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [agent, setAgent] = useState("All");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listDeployments().then(setDeployments).catch(() => setDeployments([]));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Deployment"
        description="A deployment binds an agent to credentials, an environment, and a schedule so it can run on its own."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create deployment
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[272px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <TextInput className="pl-9" aria-label="Search by name or exact ID" placeholder="Search by name or exact ID" />
        </div>
        <FieldSelect label="Agent" value={agent} options={["All", "World Cup Daily Digest", "Managed SSH Reverse Tunnel Bootstrapper"]} onValueChange={setAgent} />
        <FieldSelect label="Status" value={status} options={["All", "Paused", "Active", "Failed"]} onValueChange={setStatus} />
      </div>
      <DataTable
        rows={deployments}
        getKey={(deployment) => deployment.id}
        columns={[
          {
            key: "id",
            header: "ID",
            width: "190px",
            render: (deployment) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{shortId(deployment.id)}</span>
                <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${deployment.id}`}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          },
          {
            key: "name",
            header: "Name",
            width: "240px",
            render: (deployment) => (
              <Link className="font-medium hover:underline" to={`/deployments/${deployment.id}`}>
                {deployment.name}
              </Link>
            )
          },
          { key: "status", header: "Status", width: "120px", render: (deployment) => <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge> },
          {
            key: "agent",
            header: "Agent",
            width: "240px",
            render: (deployment) => (
              <Button variant="ghost" className="h-[25px] justify-start px-2">
                <Braces className="h-4 w-4 text-muted" />
                <span>{deployment.agentName}</span>
                <span className="text-muted">{deployment.agentVersion}</span>
              </Button>
            )
          },
          { key: "trigger", header: "Trigger", width: "220px", render: (deployment) => <span>{deployment.trigger === "Schedule" ? "Daily at 1:00 AM GMT+8" : deployment.trigger}</span> },
          { key: "created", header: "Created", width: "140px", render: (deployment) => <span className="text-muted">{deployment.createdLabel}</span> }
        ]}
      />
      <div className="flex gap-2">
        <Button variant="secondary" className="h-8 w-8 px-0" disabled>
          ‹
        </Button>
        <Button variant="secondary" className="h-8 w-8 px-0" disabled>
          ›
        </Button>
      </div>
      <CreateDeploymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(deployment) => setDeployments((items) => [deployment, ...items])}
      />
    </section>
  );
}

function DeploymentDetailPage() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [trigger, setTrigger] = useState("All");
  const [result, setResult] = useState("All");

  useEffect(() => {
    if (id) getDeployment(id).then(setDeployment).catch(() => setDeployment(null));
  }, [id]);

  async function runNow() {
    if (!deployment) return;
    const run = await runDeployment(deployment.id);
    setDeployment({ ...deployment, lastRunLabel: "just now", runs: [run, ...(deployment.runs ?? [])] });
  }

  if (!deployment) return <EmptyState title="Deployment not found" description="The selected deployment could not be loaded." />;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex h-[52px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/deployments">
            Deployment
          </Link>
          <span>/</span>
          <span className="text-ink">{deployment.name}</span>
        </nav>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-[-0.01em]">{deployment.name}</h1>
            <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono">{shortId(deployment.id)}</span>
            <span>·</span>
            <span>Created {deployment.createdLabel === "Jun 16" ? "Jun 16, 2026" : deployment.createdLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={runNow}>
            <Play className="h-4 w-4" />
            Run now
          </Button>
          <Button variant="icon" aria-label="More actions">
            ⋯
          </Button>
        </div>
      </div>

      <CdsTabs.Root defaultValue="configuration" className="flex flex-col gap-4">
        <CdsTabs.List data-cds="NavigationTabs" className="flex border-b border-line">
          {["Configuration", "Runs"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="h-9 border-b-2 border-transparent px-3 text-sm font-medium text-muted data-[state=active]:border-ink data-[state=active]:text-ink"
            >
              {tab}
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="configuration" className="grid max-w-[800px] gap-8">
          <div className="grid grid-cols-2 gap-4">
            <DetailSection title="Agent">
              <Button variant="ghost" className="h-[25px] px-2">
                <Braces className="h-4 w-4" />
                {deployment.agentName}
                <span className="text-muted">{deployment.agentVersion}</span>
              </Button>
            </DetailSection>
            <DetailSection title="Environment">
              <Button variant="ghost" className="h-[25px] px-2">
                <Database className="h-4 w-4" />
                {deployment.environmentName}
              </Button>
            </DetailSection>
          </div>
          <DetailSection title="Credential vault">
            <Button variant="ghost" className="h-[25px] px-2">
              <KeyRound className="h-4 w-4" />
              {deployment.vaults || "No credential vault"}
            </Button>
          </DetailSection>
          <DetailSection title="Memory store">
            <Button variant="ghost" className="h-[25px] px-2">
              <Database className="h-4 w-4" />
              {deployment.memoryStores || "No memory store"}
            </Button>
          </DetailSection>
          <DetailSection title="Schedule">
            <div className="rounded-cds border border-line bg-white p-3">
              <div className="flex items-center justify-between">
                <pre className="font-mono text-sm">{deployment.schedule}</pre>
                <Button variant="ghost" className="h-[22px] w-[22px] px-0" aria-label="Copy schedule">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted">Timezone: {deployment.timezone}</div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>Next (when resumed):</span>
              {deployment.nextRuns.split(", ").map((run) => (
                <Badge key={run}>{run}</Badge>
              ))}
              <span className="ml-4">Last scheduled run: {deployment.lastRunLabel}</span>
            </div>
          </DetailSection>
          <DetailSection title="Initial message">
            <div className="rounded-cds border border-line bg-white p-3">
              <div className="flex items-start justify-between gap-4">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-[#3f3a35]">{deployment.initialMessage}</pre>
                <Button variant="ghost" className="h-[22px] w-[22px] px-0" aria-label="Copy initial message">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DetailSection>
        </CdsTabs.Content>
        <CdsTabs.Content value="runs" className="flex flex-col gap-4">
          <div className="flex gap-2">
            <FieldSelect label="Trigger" value={trigger} options={["All", "Manual", "Schedule"]} onValueChange={setTrigger} />
            <FieldSelect label="Result" value={result} options={["All", "Success", "Failed"]} onValueChange={setResult} />
          </div>
          <DataTable
            rows={deployment.runs ?? []}
            getKey={(run) => run.id}
            columns={[
              { key: "id", header: "ID", width: "190px", render: (run) => <span className="font-mono font-semibold">{shortId(run.id)}</span> },
              {
                key: "started",
                header: "Started at (GMT+8)",
                width: "220px",
                render: (run) => (
                  <div>
                    <div>{run.startedAt}</div>
                    <div className="text-xs text-muted">{run.startedLabel}</div>
                  </div>
                )
              },
              { key: "trigger", header: "Trigger", width: "130px", render: (run) => <span>{run.trigger}</span> },
              { key: "status", header: "Status", width: "120px", render: (run) => <Badge tone="green">{run.result}</Badge> },
              { key: "version", header: "Agent version", width: "150px", render: (run) => <span>{run.agentVersion}</span> },
              { key: "session", header: "Session", width: "210px", render: (run) => <Link className="font-mono hover:underline" to={`/sessions/${run.sessionId}`}>{shortId(run.sessionId)}</Link> },
              { key: "sessionStatus", header: "Session status", width: "150px", render: (run) => <Badge tone={sessionTone(run.sessionStatus)}>{run.sessionStatus}</Badge> }
            ]}
          />
        </CdsTabs.Content>
      </CdsTabs.Root>
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

function CreateSessionDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (session: Session) => void;
}) {
  const [title, setTitle] = useState("");
  const [agentId, setAgentId] = useState("agent_013mi1SmR2hJ6Hk6wNTeJvF9");
  const [environmentId, setEnvironmentId] = useState("env_01ManagedDebug");
  const [vault, setVault] = useState("vault_01GitHub");
  const [resource, setResource] = useState("session-output.tar.gz");

  async function submit() {
    const session = await createSession({
      title,
      agentId,
      environmentId,
      vaults: vault ? [vault] : [],
      resources: resource ? [resource] : []
    });
    onCreated(session);
    onOpenChange(false);
    setTitle("");
  }

  return (
    <ConsoleDialog title="Create session" description="Set up an instance of your agent in its environment." open={open} onOpenChange={onOpenChange}>
      <div className="px-6 pb-0 pt-5">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Title
            <TextInput placeholder="Optional - name this run" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Agent</label>
              <Button variant="ghost" size="sm">Manage agents</Button>
            </div>
            <FieldSelect
              label=""
              value={agentId}
              options={["agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_01AVRPTGyYareCeoUasn66q5"]}
              onValueChange={setAgentId}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Environment</label>
              <Button variant="ghost" size="sm">Manage environments</Button>
            </div>
            <FieldSelect label="" value={environmentId} options={["env_01ManagedDebug", "env_01UbuntuNode", "env_01PythonBrowser"]} onValueChange={setEnvironmentId} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Credential vaults</label>
              <Button variant="ghost" size="sm">Manage credential vaults</Button>
            </div>
            <FieldSelect label="" value={vault} options={["vault_01GitHub", "No vaults"]} onValueChange={setVault} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Resource</label>
            <p className="text-sm text-muted">Mount files, GitHub repositories, or memory stores into the session.</p>
            <FieldSelect label="" value={resource} options={["session-output.tar.gz", "operations-memory", "No resources"]} onValueChange={setResource} />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end bg-white px-6 py-5">
          <Button onClick={submit}>Create session</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateDeploymentDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (deployment: Deployment) => void;
}) {
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [vault, setVault] = useState("");
  const [memoryStore, setMemoryStore] = useState("");
  const [trigger, setTrigger] = useState("");

  const canCreate = name && agentId && initialMessage && environmentId && trigger;

  async function submit() {
    if (!canCreate) return;
    const deployment = await createDeployment({
      name,
      agentId,
      initialMessage,
      environmentId,
      vaults: vault ? [vault] : [],
      memoryStores: memoryStore ? [memoryStore] : [],
      trigger,
      schedule: trigger === "Schedule" ? "0 1 * * *" : "Manual",
      timezone: "Asia/Shanghai"
    });
    onCreated(deployment);
    onOpenChange(false);
    setName("");
    setInitialMessage("");
  }

  return (
    <ConsoleDialog title="Create deployment" description="Deploy an agent with a trigger, environment, and credentials." open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[calc(86vh-92px)] overflow-y-auto px-6 pb-0 pt-5">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Name
            <TextInput placeholder="Nightly inbox triage" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Agent</label>
              <Button variant="ghost" size="sm">Manage agents</Button>
            </div>
            <FieldSelect
              label=""
              value={agentId || "Select an agent"}
              options={["Select an agent", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_01AVRPTGyYareCeoUasn66q5"]}
              onValueChange={(value) => setAgentId(value === "Select an agent" ? "" : value)}
            />
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Initial message
            <span className="text-sm font-normal text-muted">Sent to the agent at the start of every run.</span>
            <textarea
              className="cds-focus min-h-14 resize-none rounded-control border border-line bg-white px-3 py-2 text-sm"
              placeholder="Summarize today's support tickets and post to #digest"
              value={initialMessage}
              onChange={(event) => setInitialMessage(event.target.value)}
            />
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Environment</label>
              <Button variant="ghost" size="sm">Manage environments</Button>
            </div>
            <FieldSelect
              label=""
              value={environmentId || "Select an environment"}
              options={["Select an environment", "env_01WorldCupDigest", "env_01ManagedDebug", "env_01PythonBrowser"]}
              onValueChange={(value) => setEnvironmentId(value === "Select an environment" ? "" : value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Credential vault (optional)</label>
              <Button variant="ghost" size="sm">Manage credential vault</Button>
            </div>
            <FieldSelect label="" value={vault || "Add vault"} options={["Add vault", "test_secret", "vault_01GitHub"]} onValueChange={(value) => setVault(value === "Add vault" ? "" : value)} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Memory store (optional)</label>
              <Button variant="ghost" size="sm">Manage memory store</Button>
            </div>
            <FieldSelect label="" value={memoryStore || "Add memory store"} options={["Add memory store", "world cup", "Operations memory"]} onValueChange={(value) => setMemoryStore(value === "Add memory store" ? "" : value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Trigger</label>
            <FieldSelect label="" value={trigger || "Select a trigger"} options={["Select a trigger", "Manual", "Schedule"]} onValueChange={(value) => setTrigger(value === "Select a trigger" ? "" : value)} />
            <div className="rounded-cds border border-line bg-fill p-3 text-sm text-muted">
              <div className="font-semibold text-ink">Manual</div>
              <div>Run on demand from the dashboard or API</div>
              <div className="mt-2 font-semibold text-ink">Schedule</div>
              <div>Run automatically on a cron schedule</div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end bg-white px-6 py-5">
          <Button onClick={submit} disabled={!canCreate}>Create</Button>
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

function sessionTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Failed" || status === "Error" || status === "Cancelled") return "red";
  if (status === "Running" || status === "Active") return "green";
  if (status === "Queued" || status === "Created") return "blue";
  return "neutral";
}

function deploymentTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Failed") return "red";
  if (status === "Active" || status === "Running") return "green";
  if (status === "Queued" || status === "Ready") return "blue";
  return "neutral";
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
