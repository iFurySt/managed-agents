import {
  Archive,
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
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Terminal,
  Trash2,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  cancelSession,
  archiveAgent,
  archiveDeployment,
  createAgent,
  createDeployment,
  createEnvironment,
  createFile,
  createMemory,
  createMemoryStore,
  createSession,
  createSessionMessage,
  createSkill,
  archiveEnvironment,
  archiveMemoryStore,
  archiveVault,
  archiveVaultCredential,
  deleteMemory,
  deleteMemoryStore,
  deleteFile,
  deleteSkill,
  createVault,
  createVaultCredential,
  deleteVault,
  deleteVaultCredential,
  getAgent,
  getDeployment,
  getEnvironment,
  getFile,
  getMemoryStore,
  getSkill,
  getSession,
  getVault,
  listAgents,
  listCollection,
  listDeployments,
  listEnvironments,
  listFiles,
  listMemoryStores,
  listSkills,
  listSessions,
  listVaults,
  pauseDeployment,
  resumeDeployment,
  runDeployment,
  updateAgent,
  updateEnvironment
} from "./api";
import { Badge, Button, CdsDropdownMenu, CdsTabs, ConsoleDialog, DataTable, FieldSelect, SidebarItem, TextInput } from "./components/cds";
import type { Agent, CollectionName, Deployment, Environment, MemoryRecord, MemoryStore, Resource, Session, SessionEvent, SkillPackage, SkillVersion, Vault, VaultCredential, WorkspaceFile } from "./types";

const managedRoutes: { path: CollectionName; title: string; description: string; action: string }[] = [];

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-3 pb-8 pt-3">
            <Banner />
            <div className="px-5">
              <Routes>
                <Route path="/" element={<Navigate to="/agents" replace />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agents/:id" element={<AgentDetailPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/:id" element={<SessionDetailPage />} />
                <Route path="/deployments" element={<DeploymentsPage />} />
                <Route path="/deployments/:id" element={<DeploymentDetailPage />} />
                <Route path="/environments" element={<EnvironmentsPage />} />
                <Route path="/environments/:id" element={<EnvironmentDetailPage />} />
                <Route path="/vaults" element={<VaultsPage />} />
                <Route path="/vaults/:id" element={<VaultDetailPage />} />
                <Route path="/memory-stores" element={<MemoryStoresPage />} />
                <Route path="/memory-stores/:id" element={<MemoryStoreDetailPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/files/:id" element={<FileDetailPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                {managedRoutes.map((route) => (
                  <Route key={route.path} path={`/${route.path}`} element={<CollectionPage route={route} />} />
                ))}
              </Routes>
            </div>
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
    <div data-cds="Banner" className="mb-10 flex min-h-[76px] items-start gap-4 rounded-cds border border-line bg-white px-6 py-[11px]">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div className="flex-1 text-sm leading-5">
        <span>Update June 12: We've suspended access to Claude Fable 5 and Claude Mythos 5. Please use Opus 4.8 or another model.</span>
        <div>
          <Button className="mt-1" size="sm">
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
  const [search, setSearch] = useState("");
  const [created, setCreated] = useState("All time");
  const [status, setStatus] = useState("Active");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listAgents({ q: search, status, created }).then(setAgents).catch(() => setAgents([]));
  }, [created, search, status]);

  async function archiveCurrent(agent: Agent) {
    const updated = await archiveAgent(agent.id);
    setAgents((items) => status === "Archived" ? items.map((item) => (item.id === updated.id ? updated : item)) : items.filter((item) => item.id !== updated.id));
  }

  return (
    <section className="-mx-2 flex flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Create and manage autonomous agents."
        action={
          <Button className="!w-[132px] !gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create agent
          </Button>
        }
      />
      <div className="flex items-center gap-2">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <TextInput
            className="pl-9"
            placeholder="Search by name or exact ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerClassName="w-[142px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Archived", "All"]}
          onValueChange={setStatus}
          triggerClassName="ml-2 w-[123px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mx-2 overflow-x-auto p-2">
        <DataTable
          rows={agents}
          getKey={(agent) => agent.id}
          columns={[
            {
              key: "id",
              header: "ID",
              width: "180px",
              render: (agent) => (
                <div className="flex items-center gap-2 font-mono font-semibold">
                  <span>{shortId(agent.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${agent.id}`} onClick={() => copyText(agent.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "240px",
              render: (agent) => (
                <Link className="block truncate font-medium hover:underline" to={`/agents/${agent.id}`}>
                  {agent.name}
                </Link>
              )
            },
            { key: "model", header: "Model", width: "170px", render: (agent) => <span className="font-mono text-muted">{agent.model}</span> },
            { key: "status", header: "Status", width: "120px", render: (agent) => <Badge tone={agent.status === "Archived" ? "neutral" : "green"}>{agent.status}</Badge> },
            { key: "created", header: "Created", width: "150px", render: (agent) => <span className="text-muted">{agent.createdLabel || "2 days ago"}</span> },
            { key: "updated", header: "Last updated", width: "150px", render: (agent) => <span className="text-muted">{agent.updatedLabel || "2 days ago"}</span> }
          ]}
          actionsWidth="56px"
          renderActions={(agent) => <AgentRowActions agent={agent} onArchive={() => archiveCurrent(agent)} />}
        />
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
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [search, setSearch] = useState("");
  const [created, setCreated] = useState("All time");
  const [agent, setAgent] = useState(searchParams.get("agentId") ?? "All");
  const [deployment, setDeployment] = useState(searchParams.get("deploymentId") ?? "All");
  const [status, setStatus] = useState(searchParams.get("status") ?? "Active");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listSessions({ q: search, status, agentId: agent, deploymentId: deployment, created }).then(setSessions).catch(() => setSessions([]));
  }, [agent, created, deployment, search, status]);

  async function cancelCurrent(session: Session) {
    const updated = await cancelSession(session.id);
    setSessions((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <section className="-mx-2 flex flex-col gap-4">
      <PageHeader
        title="Sessions"
        description="Trace and debug Claude Managed Agents sessions."
        action={
          <Button className="!w-[144px] !gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create session
          </Button>
        }
      />
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div className="flex h-8 items-center gap-2 rounded-[8px] bg-white/50 px-3">
            <span className="text-xs text-[#898781] [font-weight:580]">ID</span>
            <input
              data-cds="TextInput"
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by session ID"
              placeholder="Search by session ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerClassName="w-[142px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Agent"
          value={agent}
          options={["All", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_017k8CPYuCFRD9AmupUeXd2Z"]}
          onValueChange={setAgent}
          triggerClassName="ml-2 w-[112px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Deployment"
          value={deployment}
          options={["All", "depl_01ERmHnRJWQSLyxk7pVCMZXs"]}
          onValueChange={setDeployment}
          triggerClassName="ml-2 w-[136px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Idle", "Cancelled", "All"]}
          onValueChange={setStatus}
          triggerClassName="ml-2 w-[123px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="mt-2">
        <DataTable
          rows={sessions}
          getKey={(session) => session.id}
          columns={[
            {
              key: "id",
              header: "ID",
              width: "160px",
              render: (session) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{shortId(session.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${session.id}`} onClick={() => copyText(session.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "191px",
              render: (session) => (
                <Link className="block truncate font-medium hover:underline" to={`/sessions/${session.id}`}>
                  {session.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "130px", render: (session) => <Badge tone={sessionTone(session.status)}>{session.status}</Badge> },
            {
              key: "agent",
              header: "Agent",
              width: "191px",
              render: (session) => (
                <Button variant="ghost" className="h-[25px] max-w-[170px] justify-start px-2">
                  <Braces className="h-4 w-4 text-muted" />
                  <span className="truncate">{session.agentName}</span>
                </Button>
              )
            },
            { key: "created", header: "Created", width: "200px", render: (session) => <span className="text-muted">{session.createdLabel}</span> }
          ]}
          actionsWidth="56px"
          renderActions={(session) => <SessionRowActions session={session} onCancel={() => cancelCurrent(session)} />}
        />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [eventFilter, setEventFilter] = useState("All events");
  const [eventSearchOpen, setEventSearchOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [detailEvent, setDetailEvent] = useState<string | null>(null);
  const [detailClosed, setDetailClosed] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const eventParam = searchParams.get("event");

  useEffect(() => {
    if (id) getSession(id).then(setSession).catch(() => setSession(null));
  }, [id]);

  useEffect(() => {
    if (!session) {
      setDetailEvent(null);
      setDetailClosed(false);
      return;
    }
    const events = session.events ?? [];
    if (detailClosed) {
      return;
    }
    if (eventParam && events.some((event) => event.id === eventParam)) {
      setDetailEvent(eventParam);
      setDetailClosed(false);
      return;
    }
    if (!eventParam && !detailEvent && !detailClosed && events.length) {
      setDetailEvent(events[0].id);
    }
  }, [detailClosed, detailEvent, eventParam, session]);

  async function cancelCurrentSession() {
    if (!session) return;
    const updated = await cancelSession(session.id);
    setSession({ ...session, ...updated });
  }

  if (!session) return <EmptyState title="Session not found" description="The selected session could not be loaded." />;

  const filteredEvents = filterSessionEvents(session.events ?? [], eventFilter, eventSearch);
  const selectedEvent = detailEvent ? session.events?.find((event) => event.id === detailEvent) ?? null : null;
  const transcriptText = (session.events ?? []).map((event) => `${event.offset} ${event.role} ${event.kind}: ${event.summary}`).join("\n");

  function selectEvent(eventID: string) {
    setDetailEvent(eventID);
    setDetailClosed(false);
    setSearchParams({ event: eventID });
  }

  function closeEventDetail() {
    setDetailEvent(null);
    setDetailClosed(true);
    setSearchParams({});
  }

  return (
    <section className="flex max-w-[952px] flex-col">
      <div className="-ml-8 -mt-3 mb-4 flex h-9 w-[984px] items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/sessions">
            Sessions
          </Link>
          <span>/</span>
          <span className="font-mono text-ink">{shortId(session.id)}</span>
        </nav>
        <div className="flex gap-2">
          <SessionDetailActions
            session={session}
            transcriptText={transcriptText}
            onCancel={cancelCurrentSession}
          />
          <Button className="w-[116px]" onClick={() => setAskOpen(true)}>
            <MessageSquare className="h-4 w-4" />
            Ask Claude
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">{session.name}</h1>
          <span className={`inline-flex h-5 items-center rounded-md px-2 text-xs font-semibold ${session.status === "Idle" ? "bg-fill text-[#52514e]" : "bg-[#caeac7] text-[#006300]"}`}>
            {session.status}
          </span>
        </div>
        <div className="mt-2 flex h-[25px] flex-wrap items-center gap-2 text-sm text-muted">
          <Button variant="ghost" className="h-[25px] px-2 font-normal text-[#4e4a45]">
            <Braces className="h-4 w-4" />
            {session.agentName}
          </Button>
          <span>·</span>
          <Button variant="ghost" className="h-[25px] px-2 font-normal text-[#4e4a45]">
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
          <span>{session.createdLabel}</span>
        </div>
      </div>

      <CdsTabs.Root defaultValue="transcript" className="mt-5 flex min-h-[620px] flex-col">
        <div className="flex h-7 items-center justify-between">
          <div className="flex items-center gap-6">
            <CdsTabs.List className="flex h-7 w-[152px] rounded-control bg-fill p-0.5" data-cds="SegmentedControl">
              {["Transcript", "Debug"].map((tab) => (
                <CdsTabs.Trigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="h-6 flex-1 rounded-[6px] px-2 text-sm font-medium text-muted data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm"
                >
                  {tab}
                </CdsTabs.Trigger>
              ))}
            </CdsTabs.List>
            <FieldSelect label="" value={eventFilter} options={["All events", "User", "Agent", "Tool", "System"]} onValueChange={setEventFilter} triggerClassName="!h-7 w-[97px] px-2" />
            <Button variant="icon" aria-label="Open search filter" onClick={() => setEventSearchOpen((open) => !open)}>
              <Search className="h-4 w-4" />
            </Button>
            {eventSearchOpen ? (
              <TextInput className="w-[220px]" aria-label="Filter events" placeholder="Filter events" value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} />
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="icon" aria-label="Keyboard shortcuts">
              <Terminal className="h-4 w-4" />
            </Button>
            <Button variant="icon" aria-label="Copy all" onClick={() => copyText(transcriptText)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="icon" aria-label="Download" onClick={() => downloadText(`${session.id}-transcript.txt`, transcriptText)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CdsTabs.Content value="transcript" className={`-ml-8 grid w-[1016px] flex-1 ${selectedEvent ? "grid-cols-[496px_520px]" : "grid-cols-1"}`}>
          <div className="pt-[31px]">
            <div className="flex flex-col">
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  className={`grid h-9 grid-cols-[64px_minmax(0,1fr)_215px] items-center px-8 text-left text-sm leading-[21px] hover:bg-fill ${detailEvent === event.id ? "bg-fill" : ""}`}
                  onClick={() => selectEvent(event.id)}
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
              {filteredEvents.length === 0 ? <EmptyState compact title="No matching events" description="" /> : null}
            </div>
          </div>
          {selectedEvent ? (
            <aside className="relative mt-[53px] border-l border-line bg-canvas px-6 pt-3">
              <Button variant="ghost" className="absolute right-3 top-3 h-7 w-7 px-0" aria-label="Close detail panel" onClick={closeEventDetail}>
                ×
              </Button>
              <div className="text-sm">
                <div className="pr-10">
                  <h2 className="text-sm leading-6 text-ink">{selectedEvent.role} {selectedEvent.kind}</h2>
                  <div className="mt-1 flex h-5 items-center gap-2 text-xs text-muted">
                    <span className="font-mono">{shortId(selectedEvent.id)}</span>
                    <span className="hidden font-mono">{selectedEvent.id}</span>
                    <Button variant="ghost" size="sm" className="h-[20px] w-[20px] px-0" aria-label={`Copy ${selectedEvent.id}`} onClick={() => copyText(selectedEvent.id)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <span>·</span>
                    <span>{selectedEvent.offset}</span>
                  </div>
                </div>
                <div className="mt-[29px]">
                  <div className="mb-2 text-xs leading-4 text-muted">Content</div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-[22.75px] text-[#4e4a45]">{selectedEvent.summary}</pre>
                </div>
              </div>
            </aside>
          ) : null}
        </CdsTabs.Content>
        <CdsTabs.Content value="debug" className="py-8">
          <DetailSection title="Mounted resources">
            <pre className="whitespace-pre-wrap rounded-cds border border-line bg-white p-4 font-mono text-sm text-[#3f3a35]">{session.resources || "No resources mounted."}</pre>
          </DetailSection>
        </CdsTabs.Content>
      </CdsTabs.Root>
      <AskClaudeDialog
        session={session}
        open={askOpen}
        onOpenChange={setAskOpen}
        onUpdated={(updated) => {
          setSession(updated);
          setAskOpen(false);
        }}
      />
    </section>
  );
}

function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("All");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listDeployments({ q: search, status, agentId: agent }).then(setDeployments).catch(() => setDeployments([]));
  }, [agent, search, status]);

  async function applyStatus(deployment: Deployment, action: "pause" | "resume" | "archive") {
    const updated =
      action === "pause"
        ? await pauseDeployment(deployment.id)
        : action === "resume"
          ? await resumeDeployment(deployment.id)
          : await archiveDeployment(deployment.id);
    setDeployments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function runCurrent(deployment: Deployment) {
    const run = await runDeployment(deployment.id);
    setDeployments((items) => items.map((item) => (item.id === deployment.id ? { ...item, lastRunLabel: "just now", runs: [run, ...(item.runs ?? [])] } : item)));
  }

  return (
    <section className="-mx-2 flex flex-col">
      <PageHeader
        title="Deployments"
        description="A deployment binds an agent to credentials, an environment, and a schedule so it can run on its own."
        action={
          <Button className="!gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create deployment
          </Button>
        }
      />
      <div className="mt-2 flex flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              data-cds="TextInput"
              className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by name or exact ID"
              placeholder="Search by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Agent"
          value={agent}
          options={["All", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_013mi1SmR2hJ6Hk6wNTeJvF9"]}
          onValueChange={setAgent}
          triggerClassName="w-[112px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Paused", "Active", "Archived", "Failed"]}
          onValueChange={setStatus}
          triggerClassName="ml-2 w-[98px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mx-2 mt-6 overflow-x-auto p-2">
        <DataTable
          rows={deployments}
          getKey={(deployment) => deployment.id}
          showSelection={false}
          actionsWidth="56px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "160px",
              render: (deployment) => (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono font-semibold">{shortId(deployment.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${deployment.id}`} onClick={() => copyText(deployment.id)}>
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
                <Link className="block truncate font-medium hover:underline" to={`/deployments/${deployment.id}`}>
                  {deployment.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "110px", render: (deployment) => <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge> },
            {
              key: "agent",
              header: "Agent",
              width: "220px",
              render: (deployment) => (
                <Button variant="ghost" className="h-[25px] min-w-0 max-w-full justify-start px-2">
                  <Braces className="h-4 w-4 text-muted" />
                  <span className="min-w-0 truncate">{deployment.agentName}</span>
                  <span className="shrink-0 text-muted">{deployment.agentVersion}</span>
                </Button>
              )
            },
            { key: "trigger", header: "Trigger", width: "200px", render: (deployment) => <span>{deployment.trigger === "Schedule" ? "Daily at 1:00 AM GMT+8" : deployment.trigger}</span> },
            { key: "created", header: "Created", width: "160px", render: (deployment) => <span className="text-muted">{deployment.createdLabel}</span> }
          ]}
          actionsHeader="Actions"
          renderActions={(deployment) => (
            <DeploymentActions
              deployment={deployment}
              onRun={() => runCurrent(deployment)}
              onPause={() => applyStatus(deployment, "pause")}
              onResume={() => applyStatus(deployment, "resume")}
              onArchive={() => applyStatus(deployment, "archive")}
            />
          )}
        />
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
  const [searchParams, setSearchParams] = useSearchParams();
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

  async function applyStatus(action: "pause" | "resume" | "archive") {
    if (!deployment) return;
    const updated =
      action === "pause"
        ? await pauseDeployment(deployment.id)
        : action === "resume"
          ? await resumeDeployment(deployment.id)
          : await archiveDeployment(deployment.id);
    setDeployment(updated);
  }

  if (!deployment) return <EmptyState title="Deployment not found" description="The selected deployment could not be loaded." />;

  const activeTab = searchParams.get("tab") === "runs" ? "runs" : "configuration";
  const visibleRuns = (deployment.runs ?? []).filter((run) => {
    const triggerMatch = trigger === "All" || run.trigger === trigger;
    const resultMatch = result === "All" || run.result === result;
    return triggerMatch && resultMatch;
  });

  return (
    <section className="flex max-w-[952px] flex-col">
      <div className="-ml-8 -mt-3 mb-3 flex h-9 w-[984px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/deployments">
            Deployments
          </Link>
          <span>/</span>
          <span className="text-ink">{deployment.name}</span>
        </nav>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-[22px] font-medium leading-7">{deployment.name}</h1>
            <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono">{shortId(deployment.id)}</span>
            <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${deployment.id}`} onClick={() => copyText(deployment.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <span>·</span>
            <span>Created {deployment.createdLabel === "Jun 16" ? "Jun 16, 2026" : deployment.createdLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={runNow}>
            <Play className="h-4 w-4" />
            Run now
          </Button>
          <DeploymentActions
            deployment={deployment}
            onRun={runNow}
            onPause={() => applyStatus("pause")}
            onResume={() => applyStatus("resume")}
            onArchive={() => applyStatus("archive")}
          />
        </div>
      </div>

      <CdsTabs.Root
        value={activeTab}
        onValueChange={(value) => setSearchParams(value === "runs" ? { tab: "runs" } : {})}
        className="mt-[18px] flex flex-col gap-4"
      >
        <CdsTabs.List data-cds="NavigationTabs" className="-ml-2 flex border-b border-line">
          {["Configuration", "Runs"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="h-8 rounded-t-cds border-b-2 border-transparent px-3 text-sm font-medium text-muted data-[state=active]:border-ink data-[state=active]:text-ink"
            >
              {tab}
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="configuration" className="-ml-1 grid max-w-[792px] gap-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <DeploymentDetailSection title="Agent">
              <Button variant="ghost" className="h-[25px] px-2">
                <Braces className="h-4 w-4" />
                {deployment.agentName}
                <span className="text-muted">{deployment.agentVersion}</span>
              </Button>
            </DeploymentDetailSection>
            <DeploymentDetailSection title="Environment">
              <Button variant="ghost" className="h-[25px] px-2">
                <Database className="h-4 w-4" />
                {deployment.environmentName}
              </Button>
            </DeploymentDetailSection>
          </div>
          <DeploymentDetailSection title="Credential vaults">
            <Button variant="ghost" className="h-[25px] px-2">
              <KeyRound className="h-4 w-4" />
              {deployment.vaults || "No credential vault"}
            </Button>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Memory stores">
            <Button variant="ghost" className="h-[25px] px-2">
              <Database className="h-4 w-4" />
              {deployment.memoryStores || "No memory store"}
            </Button>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Schedule">
            <div className="flex items-center justify-between">
              <pre className="font-mono text-sm leading-[21px]">{deployment.schedule}</pre>
              <Button variant="ghost" className="h-[22px] w-[22px] px-0 text-muted" aria-label="Copy" onClick={() => copyText(deployment.schedule)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-2 text-sm leading-[21px] text-muted">Timezone: {deployment.timezone}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-4 text-muted">
              <span>Next (when resumed):</span>
              <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0 text-muted" aria-label="About scheduling jitter">
                <Info className="h-3.5 w-3.5" />
              </Button>
              {deployment.nextRuns.split(", ").map((run) => (
                <span
                  key={run}
                  className={run.startsWith("+") ? "px-2 py-0.5 text-muted" : "rounded-[8px] border border-line bg-[#fcfcfb] px-2.5 py-0.5 text-[#4e4a45]"}
                >
                  {run}
                </span>
              ))}
              <span className="ml-auto text-ink">
                <span className="text-[#4e4a45]">Last scheduled run:</span> {deployment.lastRunLabel}
              </span>
            </div>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Initial message">
            <div className="flex items-start justify-between gap-4">
              <pre className="whitespace-pre-wrap text-sm leading-[21px] text-[#3f3a35]">{deployment.initialMessage}</pre>
              <Button variant="ghost" className="h-[22px] w-[22px] px-0 text-muted" aria-label="Copy" onClick={() => copyText(deployment.initialMessage)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DeploymentDetailSection>
        </CdsTabs.Content>
        <CdsTabs.Content value="runs" className="-ml-2 -mt-[41px] flex flex-col gap-2">
          <div className="flex gap-4">
            <FieldSelect label="Trigger" value={trigger} options={["All", "Manual", "Schedule"]} onValueChange={setTrigger} triggerClassName="w-[101px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent" />
            <FieldSelect label="Result" value={result} options={["All", "Success", "Failed"]} onValueChange={setResult} triggerClassName="w-[98px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent" />
          </div>
          <DataTable
            rows={visibleRuns}
            getKey={(run) => run.id}
            showSelection={false}
            showActions={false}
            className="-ml-2 w-[984px]"
            tableClassName="ml-2 mt-2"
            columns={[
              {
                key: "id",
                header: "ID",
                width: "160px",
                render: (run) => (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono font-semibold">{shortId(run.id)}</span>
                    <span className="hidden font-mono">{run.id}</span>
                    <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0 text-muted" aria-label={`Copy ${run.id}`} onClick={() => copyText(run.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                )
              },
              {
                key: "started",
                header: "Started at (GMT+8)",
                width: "260px",
                render: (run) => (
                  <span>
                    {run.startedAt}
                    {" "}
                    <span className="ml-2 text-muted">{run.startedLabel}</span>
                  </span>
                )
              },
              { key: "trigger", header: "Trigger", width: "120px", render: (run) => <span>{run.trigger}</span> },
              { key: "status", header: "Status", width: "110px", render: (run) => <Badge tone="green">{run.result}</Badge> },
              { key: "version", header: "Agent version", width: "160px", render: (run) => <span>{run.agentVersion}</span> },
              { key: "session", header: "Session", width: "260px", render: (run) => <Link className="font-mono hover:underline" to={`/sessions/${run.sessionId}`}>{shortId(run.sessionId)}</Link> },
              { key: "sessionStatus", header: "Session status", width: "140px", render: (run) => <Badge tone={sessionTone(run.sessionStatus)}>{run.sessionStatus}</Badge> }
            ]}
          />
        </CdsTabs.Content>
      </CdsTabs.Root>
    </section>
  );
}

function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listEnvironments({ q: search, status }).then(setEnvironments).catch(() => setEnvironments([]));
  }, [search, status]);

  async function archiveCurrent(environment: Environment) {
    const updated = await archiveEnvironment(environment.id);
    setEnvironments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <section className="-mx-2 flex flex-col">
      <PageHeader
        title="Environments"
        description="Configuration template for containers, such as sessions or code execution."
        action={
          <Button className="!gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create environment
          </Button>
        }
      />
      <div className="mt-4 flex h-10 flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              data-cds="TextInput"
              className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by name or exact ID"
              placeholder="Search by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Archived"]}
          onValueChange={setStatus}
          triggerClassName="w-[98px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mx-2 -my-2 mt-2 overflow-x-auto p-2">
        <DataTable
          rows={environments}
          getKey={(environment) => environment.id}
          actionsWidth="56px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "216px",
              render: (environment) => (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono font-semibold">{shortEnvironmentId(environment.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${environment.id}`} onClick={() => copyText(environment.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "296px",
              render: (environment) => (
                <Link className="block truncate font-medium hover:underline" to={`/environments/${environment.id}`}>
                  {environment.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "100px", render: (environment) => <Badge tone={environmentTone(environment.status)}>{environment.status}</Badge> },
            { key: "type", header: "Type", width: "120px", render: (environment) => <span>{environment.type}</span> },
            { key: "updated", header: "Updated at", width: "140px", render: (environment) => <span className="text-muted">{environment.updatedLabel}</span> }
          ]}
          renderActions={(environment) => <EnvironmentActions environment={environment} onArchive={() => archiveCurrent(environment)} />}
        />
      </div>
      <CreateEnvironmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(environment) => setEnvironments((items) => [environment, ...items])}
      />
    </section>
  );
}

function EnvironmentDetailPage() {
  const { id } = useParams();
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [networkingType, setNetworkingType] = useState("Unrestricted");
  const [packageManager, setPackageManager] = useState("apt");
  const [packages, setPackages] = useState<string[]>([]);
  const [packageDraft, setPackageDraft] = useState("");
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>(emptyMetadataRows());

  useEffect(() => {
    if (id) getEnvironment(id).then(setEnvironment).catch(() => setEnvironment(null));
  }, [id]);

  function startEdit() {
    if (!environment) return;
    setName(environment.name);
    setDescription(environment.description);
    setNetworkingType(environment.networkingType || "Unrestricted");
    setPackageManager(environment.packageManager || "apt");
    setPackages(splitValues(environment.packages));
    setPackageDraft("");
    setMetadataRows(parseMetadataRows(environment.metadata));
    setEditing(true);
  }

  async function saveChanges() {
    if (!environment) return;
    const updated = await updateEnvironment(environment.id, {
      name,
      description,
      networkingType,
      packageManager,
      packages,
      metadata: serializeMetadataRows(metadataRows)
    });
    setEnvironment(updated);
    setEditing(false);
  }

  async function archiveCurrent() {
    if (!environment) return;
    const updated = await archiveEnvironment(environment.id);
    setEnvironment(updated);
  }

  function addPackage() {
    const next = packageDraft.trim();
    if (!next) return;
    setPackages((items) => [...items, next]);
    setPackageDraft("");
  }

  function updateMetadataRow(id: string, field: "key" | "value", value: string) {
    setMetadataRows((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addMetadataRow() {
    setMetadataRows((rows) => [...rows, { id: nextLocalId("metadata"), key: "", value: "" }]);
  }

  function removeMetadataRow(id: string) {
    setMetadataRows((rows) => {
      const next = rows.filter((row) => row.id !== id);
      return next.length ? next : emptyMetadataRows();
    });
  }

  if (!environment) return <EmptyState title="Environment not found" description="The selected environment could not be loaded." />;

  return (
    <section className="-mt-[18px] flex flex-col gap-5">
      <div className="-ml-5 flex h-[52px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/environments">
            Environments
          </Link>
          <span>/</span>
          <span className="text-ink">{environment.name}</span>
        </nav>
      </div>

      <div className="ml-1 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            {editing ? (
              <TextInput
                className="h-9 w-[256px] max-w-none rounded-[8px] !text-[22px] leading-[26px] [font-weight:580]"
                placeholder="Environment name"
                value={name}
                maxLength={50}
                onChange={(event) => setName(event.target.value)}
              />
            ) : (
              <h1 className="truncate text-[22px] leading-[26px] [font-weight:580]">{environment.name}</h1>
            )}
            {editing ? null : <Badge tone="blue">{environment.type}</Badge>}
          </div>
          {editing ? null : (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-mono">{shortId(environment.id)}</span>
              <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${environment.id}`} onClick={() => copyText(environment.id)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <span>·</span>
              <span>Last updated {environment.updatedLabel}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <EnvironmentActions environment={environment} onArchive={archiveCurrent} />
          ) : (
            <>
              <Button variant="ghost" className="h-8 bg-transparent px-3 [font-weight:550] hover:bg-fill" onClick={startEdit}>Edit</Button>
              <EnvironmentActions environment={environment} onArchive={archiveCurrent} />
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="ml-1 -mt-[18px] grid max-w-[800px] gap-4">
          <div>
            <label className="mb-1 block text-sm leading-5 [font-weight:550]">Description</label>
            <textarea
              className="cds-focus h-[66px] min-h-[66px] w-full resize-none rounded-[9px] border border-line bg-white px-3 py-2 text-sm leading-5"
              placeholder="Add a description for this environment (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <EnvironmentEditSection title="Networking">
            <p className="mb-4 text-sm leading-5 text-muted">Configure network access policies for this environment.</p>
            <label className="mb-2 block text-sm leading-[14px] [font-weight:550]">Type</label>
            <FieldSelect
              label="Type"
              showLabel={false}
              value={networkingType}
              options={["Unrestricted", "No internet", "Allowlist"]}
              onValueChange={setNetworkingType}
              triggerClassName="w-[792px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
            />
          </EnvironmentEditSection>
          <EnvironmentEditSection
            title="Packages"
            separated
            action={
              <Button variant="icon" className="h-8 w-8 rounded-[8px]" aria-label="Add package" onClick={addPackage}>
                <Plus className="h-4 w-4" />
              </Button>
            }
          >
            <p className="mb-4 text-sm leading-5 text-muted">Specify packages and their versions available in this environment. Separate multiple values with spaces.</p>
            <div className="flex min-h-8 items-center gap-2">
              <FieldSelect
                label="Manager"
                showLabel={false}
                value={packageManager}
                options={["apt", "pip", "npm"]}
                onValueChange={setPackageManager}
                triggerClassName="w-[142px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
              />
              {packages.map((item) => (
                <span key={item} className="inline-flex h-6 items-center gap-1.5 rounded-md border border-line bg-white px-2 font-mono text-[13px] leading-5">
                  {item}
                  <button className="text-muted hover:text-ink" aria-label={`Remove ${item}`} onClick={() => setPackages((values) => values.filter((value) => value !== item))}>
                    ×
                  </button>
                </span>
              ))}
              <input
                className="ml-auto h-5 w-[85px] bg-transparent font-mono text-[13px] leading-5 outline-none placeholder:text-muted"
                aria-label="package package==1.0.0"
                placeholder="package package==1.0.0"
                value={packageDraft}
                onChange={(event) => setPackageDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addPackage();
                  }
                }}
              />
              <Button
                variant="icon"
                className="h-8 w-8 rounded-[8px] text-sm leading-5 [font-weight:550]"
                aria-label="Remove package"
                onClick={() => setPackages((values) => values.slice(0, -1))}
                disabled={packages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </EnvironmentEditSection>
          <EnvironmentEditSection
            title="Metadata"
            separated
            className="!mt-[13px]"
            action={
              <Button variant="icon" className="h-8 w-8 rounded-[8px] text-sm leading-5 [font-weight:550]" aria-label="Add metadata entry" onClick={addMetadataRow}>
                <Plus className="h-4 w-4" />
              </Button>
            }
          >
            <p className="mb-4 text-sm leading-5 text-muted">Add custom key-value pairs to tag and organize this environment. Keys must be lowercase.</p>
            <div className="grid gap-2">
              {metadataRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[376px_376px_32px] items-center gap-2">
                  <TextInput
                    className="h-9 rounded-[8px] !text-base leading-[22.4px] [font-weight:430]"
                    aria-label={`Metadata key ${index + 1}`}
                    placeholder="client_key..."
                    value={row.key}
                    onChange={(event) => updateMetadataRow(row.id, "key", event.target.value)}
                  />
                  <TextInput
                    className="h-9 rounded-[8px] !text-base leading-[22.4px] [font-weight:430]"
                    aria-label={`Metadata value ${index + 1}`}
                    placeholder="Value"
                    value={row.value}
                    onChange={(event) => updateMetadataRow(row.id, "value", event.target.value)}
                  />
                  <Button variant="icon" className="h-8 w-8 rounded-[8px] text-sm leading-5 [font-weight:550]" aria-label={`Remove metadata row ${index + 1}`} onClick={() => removeMetadataRow(row.id)} disabled={metadataRows.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </EnvironmentEditSection>
          <div className="-mt-2 flex gap-2">
            <Button variant="ghost" className="h-8 rounded-[8px] px-3 [font-weight:550]" onClick={saveChanges}>Save changes</Button>
            <Button variant="ghost" className="h-8 rounded-[8px] px-3 [font-weight:550]" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="ml-1 mt-6 grid max-w-[800px] gap-4">
          <EnvironmentDetailSection title="Networking">
            <p className="mb-3 text-sm text-muted">Configure network access policies for this environment.</p>
            <div className="text-sm leading-[21px]">
              <span className="[font-weight:550]">Type</span>
              <div className="mt-1">{environment.networkingType || "Unrestricted"}</div>
            </div>
          </EnvironmentDetailSection>
          <EnvironmentDetailSection title="Packages" separated>
            <p className="mb-3 text-sm text-muted">Specify packages and their versions available in this environment. Separate multiple values with spaces.</p>
            <div className="flex min-h-[35px] items-center justify-between gap-4 rounded-md border border-line bg-fill px-3 py-[6px]">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-[21px]">{environment.packageManager || "apt"}: {environment.packages || "No packages"}</pre>
              <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0 text-muted" aria-label="Copy" onClick={() => copyText(`${environment.packageManager || "apt"}: ${environment.packages || ""}`.trim())}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </EnvironmentDetailSection>
          <EnvironmentDetailSection title="Metadata" separated>
            <p className="mb-3 text-sm text-muted">Add custom key-value pairs to tag and organize this environment. Keys must be lowercase.</p>
            {environment.metadata ? (
              <pre className="min-h-[37px] rounded-md border border-line bg-fill px-3 py-2 font-mono text-sm leading-5">{environment.metadata}</pre>
            ) : (
              <div className="min-h-[37px] rounded-md border border-line bg-canvas px-3 py-2 text-sm text-muted">No metadata</div>
            )}
          </EnvironmentDetailSection>
        </div>
      )}
    </section>
  );
}

function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listVaults({ q: search, status }).then(setVaults).catch(() => setVaults([]));
  }, [search, status]);

  async function archiveCurrent(vault: Vault) {
    const updated = await archiveVault(vault.id);
    setVaults((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function deleteCurrent(vault: Vault) {
    await deleteVault(vault.id);
    setVaults((items) => items.filter((item) => item.id !== vault.id));
  }

  return (
    <section className="-mx-2 flex flex-col">
      <PageHeader
        title="Credential vaults"
        description="Manage credential vaults that provide your agents with access to MCP servers and other tools."
        action={
          <Button className="!gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create vault
          </Button>
        }
      />
      <div className="mt-4 flex h-10 flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              data-cds="TextInput"
              className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by name or exact ID"
              placeholder="Search by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Archived"]}
          onValueChange={setStatus}
          triggerClassName="w-[98px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mx-2 -my-2 mt-2 overflow-x-auto p-2">
        <DataTable
          rows={vaults}
          getKey={(vault) => vault.id}
          showSelection={false}
          actionsWidth="48px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "216px",
              render: (vault) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{shortId(vault.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${vault.id}`} onClick={() => copyText(vault.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "304px",
              render: (vault) => (
                <Link className="font-medium hover:underline" to={`/vaults/${vault.id}`}>
                  {vault.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "200px", render: (vault) => <Badge tone={vaultTone(vault.status)}>{vault.status}</Badge> },
            { key: "created", header: "Created", width: "200px", render: (vault) => <span className="text-muted">{vault.createdLabel}</span> }
          ]}
          renderActions={(vault) => <VaultRowActions vault={vault} onArchive={() => archiveCurrent(vault)} onDelete={() => deleteCurrent(vault)} />}
        />
      </div>
      <CreateVaultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(vault) => setVaults((items) => [vault, ...items])}
      />
    </section>
  );
}

function VaultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vault, setVault] = useState<Vault | null>(null);
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) getVault(id).then(setVault).catch(() => setVault(null));
  }, [id]);

  async function archiveCurrentVault() {
    if (!vault) return;
    const updated = await archiveVault(vault.id);
    setVault({ ...vault, ...updated });
  }

  async function deleteCurrentVault() {
    if (!vault) return;
    await deleteVault(vault.id);
    navigate("/vaults");
  }

  async function archiveCredential(credential: VaultCredential) {
    if (!vault) return;
    const updated = await archiveVaultCredential(vault.id, credential.id);
    setVault({ ...vault, credentials: (vault.credentials ?? []).map((item) => item.id === credential.id ? updated : item) });
  }

  async function deleteCredential(credential: VaultCredential) {
    if (!vault) return;
    await deleteVaultCredential(vault.id, credential.id);
    setVault({ ...vault, credentials: (vault.credentials ?? []).filter((item) => item.id !== credential.id) });
  }

  if (!vault) return <EmptyState title="Credential vault not found" description="The selected vault could not be loaded." />;

  const visibleCredentials = status === "All" ? (vault.credentials ?? []) : (vault.credentials ?? []).filter((credential) => credential.status === status);

  return (
    <section className="-mt-4 flex flex-col">
      <div className="-ml-5 flex h-[52px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/vaults">
            Credential vaults
          </Link>
          <span>/</span>
          <span className="text-ink">{vault.name}</span>
        </nav>
      </div>

      <div className="ml-1 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="truncate text-[22px] leading-[26px] [font-weight:580]">{vault.name}</h1>
            <span className="text-sm leading-[21px] text-ink">{vault.status}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="rounded-md px-1 font-mono text-xs leading-5">{vault.id}</span>
            <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${vault.id}`} onClick={() => copyText(vault.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <span>·</span>
            <span>Created {vault.createdLabel}</span>
            <span>·</span>
            <span>Updated {vault.updatedLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 !gap-1.5 rounded-[8px] bg-transparent px-3 [font-weight:550] hover:bg-fill" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add credential
          </Button>
          <VaultRowActions vault={vault} onArchive={archiveCurrentVault} onDelete={deleteCurrentVault} />
        </div>
      </div>

      <div className="ml-1 mt-[18px] flex h-8 items-start gap-2">
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Archived"]}
          onValueChange={setStatus}
          triggerClassName="w-[98px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
        />
      </div>
      <div className="-mx-1 -my-2 mt-2 overflow-x-auto p-2">
        <DataTable
          rows={visibleCredentials}
          getKey={(credential) => credential.id}
          showSelection={false}
          actionsWidth="48px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "200px",
              render: (credential) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{shortId(credential.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${credential.id}`} onClick={() => copyText(credential.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            { key: "name", header: "Name", width: "180px", render: (credential) => <span className="font-medium">{credential.name}</span> },
            {
              key: "auth",
              header: "Auth",
              width: "220px",
              render: (credential) => (
                <div>
                  <div>{credential.authType}</div>
                  <div className="truncate font-mono text-xs text-muted">{credential.target}</div>
                </div>
              )
            },
            { key: "status", header: "Status", width: "100px", render: (credential) => <Badge tone={vaultTone(credential.status)}>{credential.status}</Badge> },
            { key: "lastUsed", header: "Last used", width: "180px", render: (credential) => <span className="text-muted">{credential.lastUsed}</span> },
            { key: "updated", header: "Updated", width: "180px", render: (credential) => <span className="text-muted">{credential.updatedLabel}</span> }
          ]}
          renderActions={(credential) => <CredentialActions credential={credential} onArchive={() => archiveCredential(credential)} onDelete={() => deleteCredential(credential)} />}
        />
      </div>
      <CreateCredentialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add credential"
        description="Add a credential to this vault for agents to use."
        onCreated={(credential) => setVault({ ...vault, credentials: [credential, ...(vault.credentials ?? [])] })}
        create={(input) => createVaultCredential(vault.id, input)}
      />
    </section>
  );
}

function MemoryStoresPage() {
  const [stores, setStores] = useState<MemoryStore[]>([]);
  const [query, setQuery] = useState("");
  const [created, setCreated] = useState("All time");
  const [status, setStatus] = useState("Active");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listMemoryStores({ q: query, status, created }).then(setStores).catch(() => setStores([]));
  }, [created, query, status]);

  async function archiveStore(store: MemoryStore) {
    const updated = await archiveMemoryStore(store.id);
    setStores((items) => items.map((item) => item.id === store.id ? updated : item));
  }

  async function deleteStore(store: MemoryStore) {
    await deleteMemoryStore(store.id);
    setStores((items) => items.filter((item) => item.id !== store.id));
  }

  return (
    <section className="-mx-2 flex flex-col">
      <PageHeader
        title="Memory stores"
        description="Browse and manage persistent memory for your agents."
        action={
          <Button className="!gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create memory store
          </Button>
        }
      />
      <div className="mt-4 flex h-10 items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              data-cds="TextInput"
              className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by name or exact ID"
              placeholder="Search by name or exact ID"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerClassName="w-[142px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Archived", "All"]}
          onValueChange={setStatus}
          triggerClassName="ml-2 w-[123px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mx-2 -my-2 mt-2 overflow-x-auto p-2">
        <DataTable
          rows={stores}
          getKey={(store) => store.id}
          actionsWidth="56px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "200px",
              render: (store) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{shortId(store.id)}</span>
                  <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${store.id}`} onClick={() => copyText(store.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "352px",
              render: (store) => (
                <Link className="font-medium hover:underline" to={`/memory-stores/${store.id}`}>
                  {store.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "120px", render: (store) => <Badge tone={memoryTone(store.status)}>{store.status}</Badge> },
            { key: "created", header: "Created", width: "200px", render: (store) => <span className="text-muted">{store.createdLabel}</span> }
          ]}
          renderActions={(store) => <MemoryStoreActions store={store} onArchive={() => archiveStore(store)} onDelete={() => deleteStore(store)} />}
        />
      </div>
      <CreateMemoryStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(store) => setStores((items) => [store, ...items])}
      />
    </section>
  );
}

function MemoryStoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [store, setStore] = useState<MemoryStore | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const memoryParam = searchParams.get("memory");

  useEffect(() => {
    if (id) getMemoryStore(id).then(setStore).catch(() => setStore(null));
  }, [id]);

  useEffect(() => {
    if (!store) {
      setSelectedMemoryId(null);
      return;
    }
    const records = store.memories ?? [];
    if (!records.length && selectedMemoryId) {
      setSelectedMemoryId(null);
      return;
    }
    if (memoryParam && records.some((record) => record.id === memoryParam) && selectedMemoryId !== memoryParam) {
      setSelectedMemoryId(memoryParam);
      return;
    }
    if (records.length && (!selectedMemoryId || !records.some((record) => record.id === selectedMemoryId))) {
      setSelectedMemoryId(records[0].id);
    }
  }, [memoryParam, selectedMemoryId, store]);

  async function archiveCurrentStore() {
    if (!store) return;
    const updated = await archiveMemoryStore(store.id);
    setStore({ ...store, ...updated });
  }

  async function deleteCurrentStore() {
    if (!store) return;
    await deleteMemoryStore(store.id);
    navigate("/memory-stores");
  }

  async function deleteRecord(record: MemoryRecord) {
    if (!store) return;
    await deleteMemory(store.id, record.id);
    setStore({ ...store, memories: (store.memories ?? []).filter((memory) => memory.id !== record.id) });
    if (selectedMemoryId === record.id) setSelectedMemoryId(null);
  }

  function selectMemory(memoryID: string) {
    setSelectedMemoryId(memoryID);
    setSearchParams({ memory: memoryID });
  }

  if (!store) return <EmptyState title="Memory store not found" description="The selected memory store could not be loaded." />;

  const memories = store.memories ?? [];
  const selectedMemory = memories.find((memory) => memory.id === selectedMemoryId) ?? null;
  const folders = memoryFolders(memories);

  return (
    <section className="-mt-2 flex h-[calc(100vh-88px)] flex-col overflow-hidden">
      <div className="flex h-9 items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/memory-stores">
            Memory stores
          </Link>
          <span>/</span>
          <span className="text-ink">{store.name}</span>
        </nav>
      </div>

      <div className="mt-4 flex h-14 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex h-7 min-w-0 items-center gap-2">
            <h1 className="truncate text-xl leading-7 [font-weight:550]">{store.name}</h1>
            <Badge className="h-5 rounded-[5px] [font-weight:550]" tone={memoryTone(store.status)}>{store.status}</Badge>
          </div>
          <div className="mt-3 flex h-4 flex-wrap items-center gap-2 text-xs text-muted">
            <button className="-mx-1 -my-0.5 rounded-md px-1 py-0.5 font-mono hover:bg-fill" onClick={() => copyText(store.id)}>
              <span>{shortId(store.id)}</span>
              <span className="hidden">{store.id}</span>
            </button>
            <span className="hidden font-mono">{store.id}</span>
            <span>·</span>
            <span>Created {store.createdLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 !gap-1.5 rounded-[8px] bg-transparent px-3 [font-weight:550] hover:bg-fill" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add memory
          </Button>
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line">
        <aside className="relative w-72 shrink-0 border-r border-line bg-[#f9f9f7]">
          <Button variant="ghost" size="sm" className="absolute right-2 top-4 h-6 w-6 rounded-[6px] px-0" aria-label="Collapse all">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <div className="flex flex-col gap-0.5 overflow-y-auto p-2">
            {folders.map((folder) => (
              <div key={folder} className="flex h-7 items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:bg-[#f6f6f0]">
                <ChevronDown className="h-3.5 w-3.5" />
                <Database className="h-3.5 w-3.5" />
                <span className="truncate">{folder}</span>
              </div>
            ))}
            {memories.map((memory) => (
              <button
                key={memory.id}
                className={`flex h-7 items-center gap-1.5 rounded-lg px-3 text-left text-sm hover:bg-[#f6f6f0] ${selectedMemoryId === memory.id ? "bg-[#f6f6f0] font-semibold text-ink" : "text-[#52514e]"}`}
                onClick={() => selectMemory(memory.id)}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate">{memoryName(memory.path)}</span>
                <span className="text-xs text-muted">{memory.size}</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fcfcfb]">
          {selectedMemory ? (
            <>
              <div className="flex h-[56px] items-center justify-between gap-4 border-b border-line px-3 py-2">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate font-mono text-sm text-ink">{selectedMemory.path}</h3>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                    <button className="-mx-1 -my-0.5 rounded-md px-1 py-0.5 font-mono hover:bg-fill" onClick={() => copyText(selectedMemory.id)}>
                      <span>{shortId(selectedMemory.id)}</span>
                      <span className="hidden">{selectedMemory.id}</span>
                    </button>
                    <span className="hidden font-mono">{selectedMemory.id}</span>
                    <span>·</span>
                    <span>Updated {selectedMemory.updatedLabel}</span>
                    <span>·</span>
                    <button className="-mx-1 -my-0.5 rounded-md px-1 py-0.5 font-mono hover:bg-fill" onClick={() => copyText(selectedMemory.authorId)}>
                      <span>{shortId(selectedMemory.authorId)}</span>
                      <span className="hidden">{selectedMemory.authorId}</span>
                    </button>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="inline-flex h-7 rounded-control bg-fill p-px">
                    <button className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-white" aria-label="Preview memory">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-muted" aria-label="View source">
                      <Braces className="h-4 w-4" />
                    </button>
                  </div>
                  <MemoryRecordActions record={selectedMemory} onDelete={() => deleteRecord(selectedMemory)} />
                  <Button variant="ghost" size="sm" className="h-7 rounded-[7px] px-2.5 text-sm [font-weight:550]">
                    <FileText className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-5 text-[#52514e]">
                  {selectedMemory.content || "No content"}
                </div>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center">
              <div className="text-center">
                <div className="text-base font-semibold">Select a memory</div>
                <div className="mt-1 text-sm text-muted">Choose a file from the tree to view its contents.</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddMemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(memory) => {
          setStore({ ...store, memories: [...(store.memories ?? []), memory] });
          setSelectedMemoryId(memory.id);
          setSearchParams({ memory: memory.id });
        }}
        create={(input) => createMemory(store.id, input)}
      />
    </section>
  );
}

function FilesPage() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [status, setStatus] = useState("All");
  const [language, setLanguage] = useState("Python");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listFiles({ q: query, kind, status }).then(setFiles).catch(() => setFiles([]));
  }, [kind, query, status]);

  async function deleteCurrent(file: WorkspaceFile) {
    await deleteFile(file.id);
    setFiles((items) => items.filter((item) => item.id !== file.id));
  }

  return (
    <section className="flex flex-col gap-2">
      <PageHeader
        title="Files"
        description="Only files from the Default workspace are shown. To see other workspace's files, select a workspace."
        action={
          files.length ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add local file
            </Button>
          ) : null
        }
      />
      {files.length ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[486px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <TextInput
                className="pl-9"
                aria-label="Search by name or exact ID"
                placeholder="Search by name or exact ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <FieldSelect label="Kind" value={kind} options={["All", "Document", "Image", "Text", "Archive", "File"]} onValueChange={setKind} />
            <FieldSelect label="Status" value={status} options={["All", "Available", "Quarantined", "Deleted"]} onValueChange={setStatus} />
          </div>
          <DataTable
            rows={files}
            getKey={(file) => file.id}
            columns={[
              {
                key: "id",
                header: "ID",
                width: "210px",
                render: (file) => (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{shortId(file.id)}</span>
                    <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${file.id}`} onClick={() => copyText(file.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              },
              {
                key: "name",
                header: "Name",
                width: "360px",
                render: (file) => (
                  <Link className="font-medium hover:underline" to={`/files/${file.id}`}>
                    {file.name}
                  </Link>
                )
              },
              { key: "kind", header: "Kind", width: "150px", render: (file) => <span>{file.kind}</span> },
              { key: "status", header: "Status", width: "150px", render: (file) => <Badge tone={fileTone(file.status)}>{file.status}</Badge> },
              { key: "size", header: "Size", width: "120px", render: (file) => <span className="text-muted">{file.size}</span> },
              { key: "created", header: "Created", width: "150px", render: (file) => <span className="text-muted">{file.createdLabel}</span> }
            ]}
            renderActions={(file) => <FileActions file={file} onDelete={() => deleteCurrent(file)} />}
          />
        </>
      ) : (
        <FilesEmptyState language={language} onLanguageChange={setLanguage} />
      )}
      <CreateFileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(file) => setFiles((items) => [file, ...items])}
      />
    </section>
  );
}

function FilesEmptyState({ language, onLanguageChange }: { language: string; onLanguageChange: (value: string) => void }) {
  const code = language === "Python" ? filesPythonTemplate : filesCurlTemplate;
  return (
    <div className="mt-4 max-w-[952px]">
      <p className="mb-3 text-sm text-ink">No files have been uploaded to the Default workspace. Copy the template below to upload your first file:</p>
      <div className="overflow-hidden rounded-cds bg-fill">
        <div className="flex h-9 items-center gap-2 px-3">
          <FieldSelect
            label=""
            value={language}
            options={["Python", "cURL"]}
            onValueChange={onLanguageChange}
            triggerClassName="!h-6 !w-[81px] !gap-1.5 !rounded-md !border-0 !bg-transparent !px-2 !text-[13px] !text-[#52514e] [font-weight:550] hover:!bg-[#eeeeeb] [&_svg]:!h-3.5 [&_svg]:!w-3.5"
            contentClassName="!min-w-[128px]"
            itemClassName="!rounded-[8px]"
          />
          <div className="ml-auto flex items-center gap-1">
            <a className="inline-flex h-6 w-[96px] items-center gap-1.5 rounded-md px-2 text-[13px] leading-5 [font-weight:550] hover:bg-[#eeeeeb]" href="https://docs.claude.com/en/docs/build-with-claude/files">
              View docs
              <span className="text-muted">↗</span>
            </a>
            <Button variant="ghost" size="sm" className="!-mr-1 !h-6 !w-6 !rounded-md !px-0 [font-weight:550]" aria-label="Copy code" onClick={() => copyText(code)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <pre className="overflow-x-auto px-3 pb-3 pt-3 font-mono text-[13px] leading-[21.125px] text-ink">
          {code.split("\n").map((line, index) => (
            <span key={`${line}-${index}`} className="relative block min-h-[21px] whitespace-pre-wrap pl-10">
              <span className="absolute left-0 w-10 select-none pr-4 text-right text-muted">{index + 1}</span>
              <span>{line || " "}</span>
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

function FileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<WorkspaceFile | null>(null);

  useEffect(() => {
    if (id) getFile(id).then(setFile).catch(() => setFile(null));
  }, [id]);

  async function deleteCurrent() {
    if (!file) return;
    await deleteFile(file.id);
    navigate("/files");
  }

  if (!file) return <EmptyState title="File not found" description="The selected file could not be loaded." />;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex h-[52px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="rounded-control px-3 py-1.5 hover:bg-fill" to="/files">
            Files
          </Link>
          <span>/</span>
          <span className="text-ink">{file.name}</span>
        </nav>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="truncate text-2xl font-medium tracking-[-0.01em]">{file.name}</h1>
            <Badge tone={fileTone(file.status)}>{file.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-mono">{shortId(file.id)}</span>
            <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${file.id}`} onClick={() => copyText(file.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <span>·</span>
            <span>{file.kind}</span>
            <span>·</span>
            <span>{file.size}</span>
            <span>·</span>
            <span>Created {file.createdLabel}</span>
          </div>
        </div>
        <FileActions file={file} onDelete={deleteCurrent} />
      </div>
      <div className="grid max-w-[820px] gap-8">
        <DetailSection title="File metadata">
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 rounded-cds border border-line bg-white p-4 text-sm">
            <span className="font-semibold">Media type</span>
            <span>{file.mediaType}</span>
            <span className="font-semibold">Checksum</span>
            <span className="font-mono text-muted">{file.checksum}</span>
            <span className="font-semibold">Updated</span>
            <span>{file.updatedLabel}</span>
          </div>
        </DetailSection>
        <DetailSection title="Preview">
          <pre className="min-h-[260px] whitespace-pre-wrap rounded-cds border border-line bg-white p-4 font-mono text-sm leading-6">
            {file.content || "No preview available."}
          </pre>
        </DetailSection>
      </div>
    </section>
  );
}

function SkillsPage() {
  const [skills, setSkills] = useState<SkillPackage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [versionSkillId, setVersionSkillId] = useState<string | null>(null);

  useEffect(() => {
    listSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  async function deleteCurrent(skill: SkillPackage) {
    await deleteSkill(skill.id);
    setSkills((items) => items.filter((item) => item.id !== skill.id));
  }

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Skills"
        description="Skills are repeatable and customizable instructions that Claude API can follow. Only skills from the Default workspace are shown. To see other workspace's skills, select a workspace."
        action={
          <Button variant="ghost" className="!h-8 !w-[120px] !gap-1.5 !rounded-[8px] bg-transparent [font-weight:550] hover:bg-fill" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create skill
          </Button>
        }
      />
      <div className="flex max-w-[952px] flex-col border-t border-line">
        {skills.map((skill) => (
          <article key={skill.id} className="grid min-h-[137px] grid-cols-[minmax(0,1fr)_28px] gap-4 border-b border-line px-3 py-3">
            <div className="min-w-0">
              <h2 className="mb-0 text-base font-semibold leading-6">{skill.name}</h2>
              <p className="cds-line-clamp-2 max-w-[720px] whitespace-pre-wrap text-sm leading-5 text-[#3f3a35]">{skill.description}</p>
              <div className="mt-[26px] flex h-[22px] flex-wrap items-center gap-2 text-xs leading-4 text-[#898781]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[22px] rounded-[5.5px] bg-fill px-2 font-mono text-xs text-[#52514e] [font-weight:550] hover:bg-fill"
                  aria-label={`Copy ${skill.slug}`}
                  onClick={() => copyText(skill.slug)}
                >
                  <span>{skill.slug}</span>
                </Button>
                <span>•</span>
                <span>{skill.owner}</span>
                <span>•</span>
                <span>{skill.updatedLabel}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="icon"
                className="!h-7 !w-7 !border-0 !bg-transparent !px-0 !text-ink"
                aria-label={`View version history for ${skill.name}`}
                onClick={() => setVersionSkillId(skill.id)}
              >
                <Clock className="h-4 w-4" />
              </Button>
              {skill.owner !== "Anthropic" ? <SkillActions onDelete={() => deleteCurrent(skill)} /> : null}
            </div>
          </article>
        ))}
      </div>
      <CreateSkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(skill) => setSkills((items) => [...items, skill])}
      />
      <SkillVersionDialog
        skillId={versionSkillId}
        onOpenChange={(open) => {
          if (!open) setVersionSkillId(null);
        }}
      />
    </section>
  );
}

function AgentDetailPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) getAgent(id).then(setAgent).catch(() => setAgent(null));
  }, [id]);

  if (!agent) return <EmptyState title="Agent not found" description="The selected agent could not be loaded." />;

  const currentAgent = agent;

  async function archiveCurrent() {
    const updated = await archiveAgent(currentAgent.id);
    setAgent(updated);
  }

  return (
    <section className="flex max-w-[952px] flex-col">
      <div className="-ml-5 -mt-2 mb-4 flex h-7 items-center text-sm text-muted">
        <Link className="rounded-control px-3 py-1 hover:bg-fill" to="/agents">
          Agents
        </Link>
        <span>/</span>
        <span className="ml-2 text-ink">{agent.name}</span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.01em]">{agent.name}</h1>
            <span className={`inline-flex h-5 items-center rounded-md px-2 text-xs font-semibold ${agent.status === "Archived" ? "bg-fill text-muted" : "bg-[#caeac7] text-[#006300]"}`}>
              {agent.status}
            </span>
          </div>
          <div className="mt-[9px] flex h-5 flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-mono">{agent.id}</span>
            <Button variant="ghost" size="sm" className="h-[22px] w-[22px] px-0" aria-label={`Copy ${agent.id}`} onClick={() => copyText(agent.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <span>·</span>
            <span>Last updated {agent.updatedLabel || "2 days ago"}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" className="!w-[71px] !border-0 !bg-transparent" onClick={() => setEditOpen(true)}>
            <Settings className="h-4 w-4" />
            Edit
          </Button>
          <AgentRowActions agent={agent} onArchive={archiveCurrent} />
        </div>
      </div>
      <p className="mt-[9px] text-sm leading-5 text-[#4e4a45]">{agent.description}</p>
      <CdsTabs.Root defaultValue="agent" className="mt-4 flex flex-col gap-5">
        <CdsTabs.List data-cds="NavigationTabs" className="flex h-8 gap-1">
          {["Agent", "Sessions", "Deployments"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="h-8 border-b-2 border-transparent px-3 text-sm font-medium text-muted data-[state=active]:border-ink data-[state=active]:text-ink"
            >
              {tab}
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="agent" className="grid max-w-[952px] gap-5">
          <div>
            <FieldSelect label="Version:" value={agent.version || "v1"} options={[agent.version || "v1"]} onValueChange={() => undefined} triggerClassName="w-[105px]" />
          </div>
          <div className="mb-[31px]">
            <DetailSection title="Model">
              <div className="font-mono text-sm">{agent.model}</div>
            </DetailSection>
          </div>
          <section>
            <h2 className="text-sm font-semibold leading-5">System prompt</h2>
            <div className="relative mt-6 max-w-[952px]">
              <pre className="ml-4 mr-4 max-h-[120px] overflow-hidden whitespace-pre-wrap font-mono text-sm leading-5 text-ink">{agent.systemPrompt}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 right-2 h-[29px] w-[22px] px-0 text-muted"
                aria-label="Copy to clipboard"
                onClick={() => copyText(agent.systemPrompt)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </section>
          <div className="h-6" aria-hidden="true" />
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
      <EditAgentDialog
        agent={agent}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => {
          setAgent(updated);
          setEditOpen(false);
        }}
      />
    </section>
  );
}

const agentStartingTemplates = [
  {
    name: "Blank agent",
    description: "Start from scratch with just the core toolset and a generic prompt.",
    system: "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end."
  },
  {
    name: "Deep researcher",
    description: "Conducts multi-step web research with source synthesis and citations.",
    system: "You are a deep research agent. Plan the investigation, gather evidence, compare sources, and produce a concise answer with citations."
  },
  {
    name: "Structured extractor",
    description: "Parses unstructured text into a typed JSON schema.",
    system: "You extract structured data from messy inputs. Return valid JSON that follows the requested schema and flag ambiguous fields."
  },
  {
    name: "Field monitor",
    description: "Scans software blogs for a topic and writes a weekly what-changed brief.",
    system: "You monitor a technical field for meaningful changes. Compare recent sources and write a short weekly brief with links and impact."
  },
  {
    name: "Support agent",
    description: "Answers customer questions from your docs and knowledge base, and escalates when needed.",
    system: "You are a support agent. Answer from the provided knowledge base, ask clarifying questions when needed, and escalate unresolved issues."
  },
  {
    name: "Incident commander",
    description: "Triages a Sentry alert, opens a Linear incident ticket, and runs the Slack war room.",
    system: "You coordinate incident response. Triage alerts, summarize impact, assign next actions, and keep the incident channel updated."
  }
];

function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (agent: Agent) => void;
}) {
  const [description, setDescription] = useState("");
  const [startingPointMode, setStartingPointMode] = useState<"describe" | "template">("describe");
  const [selectedTemplate, setSelectedTemplate] = useState(agentStartingTemplates[0]);
  const [format, setFormat] = useState<"YAML" | "JSON">("YAML");
  const [configYaml, setConfigYaml] = useState(defaultAgentYaml());
  const jsonConfig = useMemo(() => JSON.stringify(agentConfigFromYaml(configYaml), null, 2), [configYaml]);

  function selectTemplate(template: (typeof agentStartingTemplates)[number]) {
    setSelectedTemplate(template);
    setConfigYaml(agentTemplateYaml(template));
  }

  async function submit() {
    const config = agentConfigFromYaml(configYaml);
    const agent = await createAgent({
      name: config.name,
      description: config.description,
      model: config.model,
      systemPrompt: config.system,
      configYaml
    });
    onCreated(agent);
    onOpenChange(false);
    setDescription("");
    setStartingPointMode("describe");
    setSelectedTemplate(agentStartingTemplates[0]);
    setConfigYaml(defaultAgentYaml());
  }

  return (
    <ConsoleDialog
      title="Create agent"
      description="Start from a template or describe what you need."
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[650px] w-[706px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="h-[calc(650px-80px)] overflow-y-auto px-6 pb-0 pt-[10px]">
        <button className="mb-[11px] flex h-5 w-full items-center gap-2 rounded-[8px] text-sm" type="button">
          <ChevronDown className="h-4 w-4" />
          <span className="[font-weight:580]">Starting point</span>
          <span className="text-muted">·</span>
          <span className="font-normal text-muted">{selectedTemplate.name}</span>
        </button>
        <div className={`rounded-cds bg-fill ${startingPointMode === "template" ? "h-[167px] overflow-hidden" : ""}`}>
          <div className="grid h-[31px] grid-cols-2 rounded-cds bg-fill p-px text-sm" role="radiogroup" aria-label="Starting point">
            <button
              aria-checked={startingPointMode === "describe"}
              className={`h-[29px] rounded-control ${startingPointMode === "describe" ? "bg-white font-medium shadow-sm" : "text-muted"}`}
              role="radio"
              type="button"
              onClick={() => setStartingPointMode("describe")}
            >
              Describe your agent
            </button>
            <button
              aria-checked={startingPointMode === "template"}
              className={`h-[29px] rounded-control ${startingPointMode === "template" ? "bg-white font-medium shadow-sm" : "text-muted"}`}
              role="radio"
              type="button"
              onClick={() => setStartingPointMode("template")}
            >
              Template
            </button>
          </div>
          {startingPointMode === "describe" ? (
            <div className="mt-[23px] min-h-[105px] rounded-control bg-white px-3 pb-3 pt-0">
              <textarea
                className="mt-[2px] h-[45px] w-full resize-none border-0 text-sm leading-[22.75px] outline-none placeholder:text-muted"
                aria-label="Describe your agent"
                placeholder="Summarizes new GitHub PRs and posts a digest to Slack."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="mt-[10px] flex justify-end">
                <Button variant="secondary" className="h-[27px] w-[82px] rounded-control px-0" disabled={!description.trim()}>
                  Generate
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid h-[245px] grid-cols-3 gap-x-[11px] gap-y-[11px] bg-white">
              {agentStartingTemplates.map((template) => (
                <button
                  key={template.name}
                  className={`flex h-[95px] w-[212px] flex-col items-start rounded-cds bg-white p-3 text-left ${selectedTemplate.name === template.name ? "border-2 border-[#c9c6be]" : "border border-line"}`}
                  type="button"
                  onClick={() => selectTemplate(template)}
                >
                  <span className="text-sm leading-5 text-ink">{template.name}</span>
                  <span className="mt-px text-xs leading-4 text-muted">{template.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-[14px]">
          <h2 className="mb-[11px] text-sm leading-5 [font-weight:580]">Agent config</h2>
          <div className="h-[264px] overflow-hidden rounded-cds border border-line bg-white">
            <div className="flex h-[43px] items-center justify-between pb-0 pl-3 pr-2 pt-0">
              <div className="flex h-[27px] -translate-x-px text-sm leading-5">
                <button className={`h-[27px] w-[59px] rounded-full px-[10px] [font-weight:550] ${format === "YAML" ? "bg-fill text-ink" : "text-muted"}`} onClick={() => setFormat("YAML")}>YAML</button>
                <button className={`h-[27px] w-[58px] rounded-full px-[10px] [font-weight:550] ${format === "JSON" ? "bg-fill text-ink" : "text-muted"}`} onClick={() => setFormat("JSON")}>JSON</button>
              </div>
              <Button variant="ghost" className="h-[27px] w-[27px] translate-x-px rounded-control px-0" aria-label="Copy code" onClick={() => copyText(format === "YAML" ? configYaml : jsonConfig)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {format === "YAML" ? (
              <textarea
                className="h-[219px] w-full resize-none overflow-auto border-0 bg-transparent px-[11px] py-3 font-mono text-[13px] leading-[19px] outline-none"
                aria-label="Agent config YAML. Tab inserts indentation. Press Escape then Tab to move focus out of the editor."
                value={configYaml}
                onChange={(event) => setConfigYaml(event.target.value)}
              />
            ) : (
              <pre className="h-[219px] overflow-auto whitespace-pre-wrap px-[11px] py-3 font-mono text-[13px] leading-[19px]">
                {jsonConfig}
              </pre>
            )}
          </div>
        </div>
        <div className="mt-[15px] flex justify-end">
          <Button className="h-[31px] w-[110px] translate-x-px rounded-[8px] px-0 [font-weight:550]" onClick={submit}>Create agent</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function EditAgentDialog({
  agent,
  open,
  onOpenChange,
  onSaved
}: {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (agent: Agent) => void;
}) {
  const [format, setFormat] = useState<"YAML" | "JSON">("YAML");
  const [configYaml, setConfigYaml] = useState(agent.configYaml || defaultAgentYaml(agent));

  useEffect(() => {
    if (open) setConfigYaml(agent.configYaml || defaultAgentYaml(agent));
  }, [agent, open]);

  const jsonConfig = useMemo(() => JSON.stringify(agentConfigFromYaml(configYaml), null, 2), [configYaml]);

  async function submit() {
    const config = agentConfigFromYaml(configYaml);
    const updated = await updateAgent(agent.id, {
      name: config.name,
      description: config.description,
      model: config.model,
      systemPrompt: config.system,
      configYaml
    });
    onSaved(updated);
  }

  return (
    <ConsoleDialog title="Edit agent" open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[calc(86vh-92px)] overflow-y-auto px-6 pb-0 pt-4">
        <div className="rounded-cds border border-line bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex rounded-full bg-fill p-1 text-sm">
              <button className={`rounded-full px-3 py-1 ${format === "YAML" ? "bg-white font-semibold shadow-sm" : "text-muted"}`} onClick={() => setFormat("YAML")}>YAML</button>
              <button className={`rounded-full px-3 py-1 ${format === "JSON" ? "bg-white font-semibold shadow-sm" : "text-muted"}`} onClick={() => setFormat("JSON")}>JSON</button>
            </div>
            <Button variant="ghost" className="h-7 w-7 px-0" aria-label="Copy code" onClick={() => copyText(format === "YAML" ? configYaml : jsonConfig)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-2 text-xs text-muted">Tab inserts indentation. Press Escape then Tab to move focus out of the editor.</p>
          {format === "YAML" ? (
            <textarea
              className="min-h-[360px] w-full resize-y border-0 bg-white font-mono text-sm leading-6 outline-none"
              value={configYaml}
              onChange={(event) => setConfigYaml(event.target.value)}
            />
          ) : (
            <pre className="min-h-[360px] whitespace-pre-wrap font-mono text-sm leading-6">
              {jsonConfig}
            </pre>
          )}
        </div>
        <div className="sticky bottom-0 -mx-6 mt-5 flex justify-end border-t border-transparent bg-white px-6 py-5">
          <Button onClick={submit}>Save new version</Button>
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
  const [agentId, setAgentId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [vault, setVault] = useState("");
  const [resource, setResource] = useState("");
  const canCreate = true;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const manageLinkClass = "text-sm leading-none text-ink [font-weight:550] hover:underline";

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
    setAgentId("");
    setEnvironmentId("");
    setVault("");
    setResource("");
  }

  return (
    <ConsoleDialog
      title="Create session"
      description="Set up an instance of your agent in its environment."
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[526px] w-[706px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-[10px]">
        <div className="grid gap-[17px]">
          <label className={`grid gap-2 ${fieldLabelClass}`}>
            Title
            <TextInput
              className="h-[31px] border-0 bg-white/50 rounded-[8px] px-3 font-normal"
              placeholder="Optional – name this run"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Agent</label>
              <a className={manageLinkClass} href="/agents" target="_blank" rel="noreferrer">Manage agents</a>
            </div>
            <FieldSelect
              label=""
              value={agentId || "Select an agent"}
              options={["Select an agent", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_01AVRPTGyYareCeoUasn66q5"]}
              onValueChange={(value) => setAgentId(value === "Select an agent" ? "" : value)}
              triggerClassName="!h-[31px] w-full border-0 bg-transparent px-2"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Environment</label>
              <a className={manageLinkClass} href="/environments" target="_blank" rel="noreferrer">Manage environments</a>
            </div>
            <FieldSelect
              label=""
              value={environmentId || "Select an environment"}
              options={["Select an environment", "env_01ManagedDebug", "env_01UbuntuNode", "env_01PythonBrowser"]}
              onValueChange={(value) => setEnvironmentId(value === "Select an environment" ? "" : value)}
              triggerClassName="!h-[31px] w-full border-0 bg-transparent px-2"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Credential vaults</label>
              <a className={manageLinkClass} href="/vaults" target="_blank" rel="noreferrer">Manage credential vaults</a>
            </div>
            <FieldSelect
              label=""
              value={vault || "Select one or more vaults"}
              options={["Select one or more vaults", "vault_01GitHub", "No vaults"]}
              onValueChange={(value) => setVault(value === "Select one or more vaults" || value === "No vaults" ? "" : value)}
              triggerClassName="!h-[31px] w-full border-0 bg-transparent px-2"
            />
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Resources</label>
            <p className="text-[13px] leading-[18px] text-muted">Mount files, GitHub repositories, or memory stores into the session.</p>
            <FieldSelect
              label="+"
              value={resource || "Resource"}
              options={["Resource", "session-output.tar.gz", "operations-memory", "No resources"]}
              onValueChange={(value) => setResource(value === "Resource" || value === "No resources" ? "" : value)}
              triggerClassName="!h-[27px] w-[121px] justify-self-start rounded-control border-0 bg-transparent px-[10px] font-medium"
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-9 flex justify-end bg-white px-6 pb-[23px] pt-0">
          <Button className="h-[31px] w-[122px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create session</Button>
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
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const manageLinkClass = "text-xs leading-4 text-[#184f95] hover:underline";

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
    <ConsoleDialog
      title="Create deployment"
      description="Deploy an agent with a trigger, environment, and credentials."
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[718px] w-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-8 w-8 rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="max-h-[calc(100dvh-116px)] overflow-y-auto px-6 pb-0 pt-4">
        <div className="grid gap-5">
          <label className={`grid gap-2 ${fieldLabelClass}`}>
            Name
            <TextInput
              className="h-8 border-0 bg-white/50 rounded-[8px] px-3 font-normal"
              placeholder="Nightly inbox triage"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Agent</label>
              <a className={manageLinkClass} href="/agents" target="_blank" rel="noreferrer">Manage agents</a>
            </div>
            <FieldSelect
              label=""
              value={agentId || "Select an agent"}
              options={["Select an agent", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_01AVRPTGyYareCeoUasn66q5"]}
              onValueChange={(value) => setAgentId(value === "Select an agent" ? "" : value)}
              triggerClassName="!h-8 w-full border-0 bg-white/50 px-2"
            />
          </div>
          <label className={`grid gap-2 ${fieldLabelClass}`}>
            Initial message
            <textarea
              className="cds-focus h-14 resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5"
              placeholder="Summarize today's support tickets and post to #digest"
              value={initialMessage}
              onChange={(event) => setInitialMessage(event.target.value)}
            />
            <span className="text-[13px] font-normal leading-[18px] text-muted">Sent to the agent at the start of every run.</span>
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Environment</label>
              <a className={manageLinkClass} href="/environments" target="_blank" rel="noreferrer">Manage environments</a>
            </div>
            <FieldSelect
              label=""
              value={environmentId || "Select an environment"}
              options={["Select an environment", "env_01WorldCupDigest", "env_01ManagedDebug", "env_01PythonBrowser"]}
              onValueChange={(value) => setEnvironmentId(value === "Select an environment" ? "" : value)}
              triggerClassName="!h-8 w-full border-0 bg-white/50 px-2"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Credential vaults(optional)</label>
              <a className={manageLinkClass} href="/vaults" target="_blank" rel="noreferrer">Manage credential vaults</a>
            </div>
            <FieldSelect
              label="+"
              value={vault || "Add vault"}
              options={["Add vault", "test_secret", "vault_01GitHub"]}
              onValueChange={(value) => setVault(value === "Add vault" ? "" : value)}
              triggerClassName="!h-8 w-full border-0 bg-white/50 px-2"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Memory stores(optional)</label>
              <a className={manageLinkClass} href="/memory-stores" target="_blank" rel="noreferrer">Manage memory stores</a>
            </div>
            <FieldSelect
              label="+"
              value={memoryStore || "Add memory store"}
              options={["Add memory store", "world cup"]}
              onValueChange={(value) => setMemoryStore(value === "Add memory store" ? "" : value)}
              triggerClassName="!h-8 w-full border-0 bg-white/50 px-2"
            />
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Trigger</label>
            <FieldSelect
              label=""
              value={trigger || "Select a trigger"}
              options={["Select a trigger", "Manual", "Schedule"]}
              onValueChange={(value) => setTrigger(value === "Select a trigger" ? "" : value)}
              triggerClassName="!h-8 w-full border-0 bg-white/50 px-2"
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[19px] flex justify-end bg-white px-6 pb-[25px] pt-0">
          <Button className="h-8 w-[71px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateEnvironmentDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (environment: Environment) => void;
}) {
  const [name, setName] = useState("");
  const [hostingType, setHostingType] = useState("Cloud");
  const [description, setDescription] = useState("");
  const canCreate = name.trim().length <= 50;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const helperClass = "text-[13px] font-normal leading-[18px] text-muted";

  async function submit() {
    if (!canCreate) return;
    const environment = await createEnvironment({
      name,
      hostingType,
      description
    });
    onCreated(environment);
    onOpenChange(false);
    setName("");
    setHostingType("Cloud");
    setDescription("");
  }

  return (
    <ConsoleDialog
      title="Create environment"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[429px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="relative -top-px mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="relative -top-px h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-[27px]">
        <div className="grid gap-[15px]">
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
              placeholder="E.g. My Environment"
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
            />
            <span className={helperClass}>50 characters or fewer.</span>
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Hosting type</label>
            <FieldSelect
              label=""
              value={hostingType}
              options={["Cloud", "Self-hosted"]}
              onValueChange={setHostingType}
              triggerClassName="!h-[31px] w-full rounded-[8px] border-0 bg-white/50 px-2"
            />
            <p className={helperClass}>This cannot be changed after creation.</p>
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Description</label>
            <textarea
              className="cds-focus h-[74px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5"
              placeholder="Optional description for this environment"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-4 flex justify-end gap-[7px] bg-white px-6 py-0">
          <Button variant="ghost" className="h-[31px] w-[70px] rounded-[8px] px-0 [font-weight:550]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="h-[31px] w-[69px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateVaultDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (vault: Vault) => void;
}) {
  const [step, setStep] = useState<"vault" | "credential">("vault");
  const [vault, setVault] = useState<Vault | null>(null);
  const [name, setName] = useState("");
  const canContinue = name.trim().length <= 50;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const helperClass = "text-[13px] font-normal leading-[18px] text-muted";

  async function continueToCredential() {
    if (!canContinue) return;
    const created = await createVault({ name });
    setVault(created);
    onCreated(created);
    setStep("credential");
  }

  function closeDialog(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep("vault");
      setVault(null);
      setName("");
    }
  }

  return (
    <ConsoleDialog
      title={step === "vault" ? "Create vault" : "Add a credential"}
      open={open}
      onOpenChange={closeDialog}
      contentClassName={step === "vault" ? "h-[306px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0" : undefined}
      headerClassName={step === "vault" ? "flex items-start justify-between pl-6 pr-4 pt-4" : undefined}
      titleClassName={step === "vault" ? "mt-1 w-[431px] -translate-y-px text-[22px] leading-[26px] text-ink [font-weight:580]" : undefined}
      closeButtonClassName={step === "vault" ? "h-[31px] w-[31px] -translate-y-px rounded-[8px] px-0" : undefined}
      closeLabel={step === "vault" ? "Close" : undefined}
    >
      {step === "vault" ? (
        <div className="px-6 pb-0 pt-[11px]">
          <div className="mb-4 flex h-[82px] gap-2 rounded-[12px] border-0 bg-[#f9dca4] px-4 py-3 text-sm leading-5 text-[#734500]">
            <Info className="h-5 w-5 shrink-0 text-[#734500]" />
            <p>
              Vaults are shared across this workspace. Credentials added to this vault will be usable by anyone with API key access.{" "}
              <span className="font-medium text-[#184f95]">Learn more here</span>
              <span> (opens in new tab).</span>
            </p>
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
              placeholder="Production vault"
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
            />
            <span className={helperClass}>50 characters or fewer.</span>
          </div>
          <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
            <Button className="h-[31px] w-[84px] rounded-[8px] px-0 [font-weight:550]" onClick={continueToCredential} disabled={!canContinue}>Continue</Button>
          </div>
        </div>
      ) : vault ? (
        <CreateCredentialForm
          title={`${vault.name} is ready. Add its first credential so agents can use it.`}
          submitLabel="Connect"
          secondaryLabel="Skip for now"
          onSecondary={() => closeDialog(false)}
          onSubmit={async (input) => {
            await createVaultCredential(vault.id, input);
            closeDialog(false);
          }}
        />
      ) : null}
    </ConsoleDialog>
  );
}

function CreateCredentialDialog({
  open,
  onOpenChange,
  title,
  description,
  onCreated,
  create
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onCreated: (credential: VaultCredential) => void;
  create: (input: { name: string; authType: string; target: string }) => Promise<VaultCredential>;
}) {
  return (
    <ConsoleDialog
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[349px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <CreateCredentialForm
        submitLabel="Connect"
        onSubmit={async (input) => {
          const credential = await create(input);
          onCreated(credential);
          onOpenChange(false);
        }}
      />
    </ConsoleDialog>
  );
}

function CreateCredentialForm({
  title,
  submitLabel,
  secondaryLabel,
  onSecondary,
  onSubmit
}: {
  title?: string;
  submitLabel: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onSubmit: (input: { name: string; authType: string; target: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [authType, setAuthType] = useState("MCP OAuth");
  const [target, setTarget] = useState("");

  useEffect(() => {
    setTarget(authType === "MCP OAuth" ? "https://mcp.example.com" : "");
  }, [authType]);

  async function submit() {
    if (!target.trim()) return;
    await onSubmit({ name, authType, target });
    setName("");
    setTarget("");
  }

  const targetLabel = authType === "Environment variable" ? "Environment variable" : authType === "Bearer token" ? "Endpoint" : "MCP server";
  const targetPlaceholder = authType === "Environment variable" ? "ENV_VAR_NAME" : authType === "Bearer token" ? "https://api.example.com/" : "https://mcp.example.com";
  const canSubmit = target.trim().length > 0;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";

  return (
    <div className="px-6 pb-0 pt-[10px]">
      {title ? <p className="mb-5 text-sm leading-6 text-muted">{title}</p> : null}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className={`${fieldLabelClass} flex h-[22px] items-center gap-2`}>
            Name <span className="inline-flex h-[22px] items-center rounded-[5.5px] bg-fill px-2 text-xs leading-[15px] text-[#52514e] [font-weight:550]">Optional</span>
          </label>
          <TextInput
            className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
            placeholder="Example credential"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-[7px]">
          <label className={fieldLabelClass}>Type</label>
          <FieldSelect
            label=""
            showLabel={false}
            value={authType}
            options={["MCP OAuth", "Bearer token", "Environment variable"]}
            onValueChange={setAuthType}
            triggerClassName="!h-[31px] w-[455px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
          />
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>{targetLabel}</label>
          {authType === "MCP OAuth" ? (
            <FieldSelect
              label=""
              showLabel={false}
              value={target || targetPlaceholder}
              options={[targetPlaceholder]}
              onValueChange={setTarget}
              triggerClassName="!h-[31px] w-[455px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
            />
          ) : (
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
              placeholder={targetPlaceholder}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          )}
        </div>
      </div>
      <div className="sticky bottom-0 -mx-6 mt-4 flex justify-end gap-2 bg-white px-6 py-0">
        {secondaryLabel ? <Button variant="ghost" className="h-[31px] rounded-[8px] px-3 [font-weight:550]" onClick={onSecondary}>{secondaryLabel}</Button> : null}
        <Button variant="ghost" className="h-[31px] w-[81px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
}

function CreateMemoryStoreDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (store: MemoryStore) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const canCreate = name.trim().length > 0;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";

  async function submit() {
    if (!canCreate) return;
    const store = await createMemoryStore({ name, description });
    onCreated(store);
    onOpenChange(false);
    setName("");
    setDescription("");
  }

  return (
    <ConsoleDialog
      title="Create memory store"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[337px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-3">
        <div>
          <div className="grid gap-[7px]">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
              placeholder="My memory store"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="mt-4 grid gap-2">
            <label className={fieldLabelClass}>Description (optional)</label>
            <textarea
              className="cds-focus h-[74px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5"
              placeholder="What this store contains and how agents should use it"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <p className="mt-2 text-[13px] leading-[18px] text-muted">Name and description are rendered in the agent system prompt when this store is attached.</p>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
          <Button className="h-[31px] w-[69px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function AddMemoryDialog({
  open,
  onOpenChange,
  onCreated,
  create
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (memory: MemoryRecord) => void;
  create: (input: { path: string; content: string }) => Promise<MemoryRecord>;
}) {
  const [path, setPath] = useState("/");
  const [content, setContent] = useState("");
  const canCreate = path.trim().length > 1 && content.trim().length > 0;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";

  async function submit() {
    if (!canCreate) return;
    const memory = await create({ path, content });
    onCreated(memory);
    onOpenChange(false);
    setPath("/");
    setContent("");
  }

  return (
    <ConsoleDialog
      title="Add memory"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[496px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-[11px]">
        <div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Path</label>
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal"
              placeholder="/notes/ideas.md"
              value={path}
              onChange={(event) => setPath(event.target.value)}
            />
            <span className="text-[13px] leading-[18px] text-muted">Folders are derived from the slashes in your path.</span>
          </div>
          <div className="mt-[15px] grid gap-2">
            <label className={fieldLabelClass}>Content</label>
            <textarea
              className="cds-focus h-[251px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 font-mono text-sm font-normal leading-5"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
          <Button variant="ghost" className="h-[31px] w-[69px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateFileDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (file: WorkspaceFile) => void;
}) {
  const [name, setName] = useState("");
  const [mediaType, setMediaType] = useState("text/plain");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const canCreate = name.trim().length > 0;

  async function submit() {
    if (!canCreate) return;
    const file = await createFile({ name, mediaType, description, content });
    onCreated(file);
    onOpenChange(false);
    setName("");
    setDescription("");
    setContent("");
  }

  return (
    <ConsoleDialog title="Add local file" description="Create a local filestore row for UI testing." open={open} onOpenChange={onOpenChange}>
      <div className="px-6 pb-0 pt-5">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Name
            <TextInput placeholder="document.pdf" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Media type</label>
            <FieldSelect label="" value={mediaType} options={["text/plain", "application/pdf", "application/json", "image/png"]} onValueChange={setMediaType} />
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <TextInput placeholder="Optional note" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Content
            <textarea
              className="cds-focus min-h-[140px] resize-none rounded-cds border border-line bg-white px-3 py-3 font-mono text-sm leading-6"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end bg-white px-6 py-5">
          <Button onClick={submit} disabled={!canCreate}>Create</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateSkillDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (skill: SkillPackage) => void;
}) {
  const [selectedName, setSelectedName] = useState("");
  const canContinue = selectedName.trim().length > 0;

  async function submit() {
    if (!canContinue) return;
    const skill = await createSkill({
      name: selectedName.replace(/\.(zip|skill)$/i, ""),
      description: `Uploaded skill package ${selectedName}.`,
      version: new Date().toISOString().slice(0, 10).replaceAll("-", "")
    });
    onCreated(skill);
    onOpenChange(false);
    setSelectedName("");
  }

  return (
    <ConsoleDialog
      title="Create skill"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="min-h-[265px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] font-semibold leading-[26px] text-ink"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-3">
        <div className="grid gap-2">
          <label className="flex h-[112px] cursor-pointer items-end justify-center rounded-cds border border-dashed border-line bg-transparent px-4 pb-6 pt-6 text-center">
            <input
              className="hidden"
              type="file"
              accept=".zip,.skill"
              onChange={(event) => setSelectedName(event.target.files?.[0]?.name ?? "")}
            />
            <div>
              <p className="text-sm">Drag and drop a .zip, .skill file, or directory to upload</p>
              {selectedName ? <p className="mt-3 font-mono text-sm text-ink">{selectedName}</p> : null}
            </div>
          </label>
          <p className="text-center text-xs leading-4 text-muted">
            Total file size limit: 8MB. <span className="font-medium">File format</span> · <span className="font-medium">download an example</span>.
          </p>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
          <Button variant="ghost" className="h-[31px] w-[84px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canContinue}>Continue</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function SkillVersionDialog({ skillId, onOpenChange }: { skillId: string | null; onOpenChange: (open: boolean) => void }) {
  const [skill, setSkill] = useState<SkillPackage | null>(null);

  useEffect(() => {
    if (!skillId) {
      setSkill(null);
      return;
    }
    getSkill(skillId).then(setSkill).catch(() => setSkill(null));
  }, [skillId]);

  const open = Boolean(skillId);

  return (
    <ConsoleDialog
      title={skill?.name ?? "Skill"}
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="min-h-[396px] w-[520px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-8 w-8 rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-3">
        {skill ? (
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{skill.owner}</span>
              <span>•</span>
              <span>{skill.createdLabel}</span>
            </div>
            <section>
              <h2 className="mb-3 text-[15px] leading-5 [font-weight:550]">Version history</h2>
              <div className="grid gap-1">
                {(skill.versions ?? []).map((version) => (
                  <div key={version.id} className="grid min-h-[47px] grid-cols-[74px_auto_1fr] items-center gap-3 rounded-control px-3 text-sm hover:bg-fill">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-[22px] w-[74px] justify-start gap-0.5 rounded-[5.5px] bg-fill px-0 font-mono font-semibold text-ink hover:bg-fill"
                      aria-label={`Copy ${version.version}`}
                      onClick={() => copyText(version.version)}
                    >
                      <span>{version.version}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-muted">{version.releasedAt}</span>
                    <span>{version.latest ? <Badge tone="blue" className="h-[22px] rounded-[5.5px] bg-[#cde2fb] text-ink">Latest</Badge> : null}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <EmptyState compact title="Loading version history" description="" />
        )}
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

function environmentTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Archived") return "neutral";
  if (status === "Failed") return "red";
  if (status === "Active") return "green";
  return "blue";
}

function vaultTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Archived") return "neutral";
  if (status === "Failed") return "red";
  if (status === "Active") return "green";
  return "blue";
}

function memoryTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Archived") return "neutral";
  if (status === "Failed") return "red";
  if (status === "Active") return "green";
  return "blue";
}

function fileTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Deleted") return "neutral";
  if (status === "Quarantined") return "red";
  if (status === "Available") return "green";
  return "blue";
}

function EnvironmentActions({ environment, onArchive }: { environment: Environment; onArchive: () => void }) {
  const navigate = useNavigate();
  const archived = environment.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="ml-1" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[170px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => navigate(`/environments/${environment.id}`)}>
            <Database className="h-4 w-4" />
            Open environment
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(environment.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function VaultRowActions({ vault, onArchive, onDelete }: { vault: Vault; onArchive: () => void; onDelete: () => void }) {
  const navigate = useNavigate();
  const archived = vault.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[170px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => navigate(`/vaults/${vault.id}`)}>
            <KeyRound className="h-4 w-4" />
            Open vault
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(vault.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function CredentialActions({ credential, onArchive, onDelete }: { credential: VaultCredential; onArchive: () => void; onDelete: () => void }) {
  const archived = credential.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[160px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(credential.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function MemoryStoreActions({ store, onArchive, onDelete }: { store: MemoryStore; onArchive: () => void; onDelete: () => void }) {
  const navigate = useNavigate();
  const archived = store.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[170px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => navigate(`/memory-stores/${store.id}`)}>
            <Database className="h-4 w-4" />
            Open store
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(store.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive store"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete store
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function MemoryRecordActions({ record, onDelete }: { record: MemoryRecord; onDelete: () => void }) {
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[150px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(record.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function FileActions({ file, onDelete }: { file: WorkspaceFile; onDelete: () => void }) {
  const navigate = useNavigate();
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[150px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => navigate(`/files/${file.id}`)}>
            <FileText className="h-4 w-4" />
            Open file
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(file.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function SessionRowActions({ session, onCancel }: { session: Session; onCancel: () => void }) {
  const navigate = useNavigate();
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[160px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => navigate(`/sessions/${session.id}`)}>
            <MessageSquare className="h-4 w-4" />
            Open session
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(session.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onCancel}
            disabled={session.status === "Cancelled"}
          >
            <Archive className="h-4 w-4" />
            {session.status === "Cancelled" ? "Cancelled" : "Cancel"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function DeploymentActions({
  deployment,
  onRun,
  onPause,
  onResume,
  onArchive
}: {
  deployment: Deployment;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
}) {
  const paused = deployment.status === "Paused";
  const archived = deployment.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="ml-1" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[170px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={onRun} disabled={archived}>
            <Play className="h-4 w-4" />
            Run now
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(deployment.id)}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          {paused ? (
            <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={onResume} disabled={archived}>
              <Play className="h-4 w-4" />
              Resume
            </CdsDropdownMenu.Item>
          ) : (
            <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={onPause} disabled={archived}>
              <Pause className="h-4 w-4" />
              Pause
            </CdsDropdownMenu.Item>
          )}
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function SessionDetailActions({
  session,
  transcriptText,
  onCancel
}: {
  session: Session;
  transcriptText: string;
  onCancel: () => void;
}) {
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="secondary" className="w-[96px]">
          Actions
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[180px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => copyText(session.id)}>
            <Copy className="h-4 w-4" />
            Copy session ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill" onSelect={() => downloadText(`${session.id}-transcript.txt`, transcriptText)}>
            <Download className="h-4 w-4" />
            Download transcript
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onCancel}
            disabled={session.status === "Cancelled"}
          >
            <Archive className="h-4 w-4" />
            {session.status === "Cancelled" ? "Cancelled" : "Cancel session"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function AskClaudeDialog({
  session,
  open,
  onOpenChange,
  onUpdated
}: {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (session: Session) => void;
}) {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;
  const suggestions = [
    {
      title: "Identify errors",
      description: "Find errors, exceptions, or failed operations during the session.",
      prompt: "Identify errors, exceptions, or failed operations during this session."
    },
    {
      title: "Analyze performance",
      description: "Review tool execution times, timeouts, and performance bottlenecks.",
      prompt: "Analyze this session for performance bottlenecks, slow tool calls, and timeouts."
    },
    {
      title: "Trace conversation flow",
      description: "Follow the conversation logic and key decision points throughout the session.",
      prompt: "Trace the conversation flow and summarize the key decision points in this session."
    },
    {
      title: "Suggest improvements",
      description: "Get recommendations for better prompting, tool usage, and user experience.",
      prompt: "Suggest improvements for prompting, tool usage, and user experience based on this session."
    }
  ];

  async function submit() {
    if (!canSend) return;
    const updated = await createSessionMessage(session.id, message);
    onUpdated(updated);
    setMessage("");
  }

  if (!open) return null;

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 w-[368px] border-l border-line bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.04)]">
      <div className="absolute left-0 top-0 h-full w-px bg-line" />
      <Button variant="ghost" className="absolute right-3 top-3 z-20 h-7 w-7 rounded-[7px] px-0" aria-label="Close" onClick={() => onOpenChange(false)}>
        ×
      </Button>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4 pt-12">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold leading-7">How can I help?</h2>
            <div className="mt-4 w-full space-y-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.title}
                  className="w-full rounded-xl border border-line bg-[#fcfcfb] p-3 text-left transition hover:bg-white"
                  onClick={() => setMessage(suggestion.prompt)}
                >
                  <div className="text-sm leading-5 [font-weight:550]">{suggestion.title}</div>
                  <div className="mt-1 text-xs leading-4 text-muted">{suggestion.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <form
          className="p-3 pt-0"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex min-h-[69px] cursor-text items-end gap-2 overflow-hidden rounded-2xl border border-line bg-white p-2 pl-4 shadow-sm">
            <textarea
              aria-label="Ask about this session..."
              className="min-h-[52px] max-h-[200px] min-w-0 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 text-sm leading-5 text-ink outline-none placeholder:text-muted"
              placeholder="Ask about this session..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button className="h-8 w-8 rounded-[8px] bg-[#c6613f] px-0 hover:bg-[#b95435]" aria-label="Send message" disabled={!canSend} type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}

function AgentRowActions({ agent, onArchive }: { agent: Agent; onArchive: () => void }) {
  const navigate = useNavigate();
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[190px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={() => navigate(`/sessions?agentId=${agent.id}`)}
          >
            <Play className="h-4 w-4" />
            Start session
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={() => navigate(`/agents/${agent.id}`)}
          >
            <MessageSquare className="h-4 w-4" />
            Guided edit
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={() => navigate(`/deployments?agentId=${agent.id}`)}
          >
            <Plus className="h-4 w-4" />
            Create deployment
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onArchive}
            disabled={agent.status === "Archived"}
          >
            <Archive className="h-4 w-4" />
            {agent.status === "Archived" ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function SkillActions({ onDelete }: { onDelete: () => void }) {
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          ⋯
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content className="z-50 min-w-[130px] rounded-cds border border-line bg-white p-1 shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function splitValues(value: string) {
  return value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
}

type MetadataRow = { id: string; key: string; value: string };

function emptyMetadataRows(): MetadataRow[] {
  return [{ id: nextLocalId("metadata"), key: "", value: "" }];
}

function parseMetadataRows(value: string): MetadataRow[] {
  const rows = value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return { id: nextLocalId("metadata"), key: key.trim(), value: rest.join("=").trim() };
    });
  return rows.length ? rows : emptyMetadataRows();
}

function serializeMetadataRows(rows: MetadataRow[]) {
  return rows
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }))
    .filter((row) => row.key || row.value)
    .map((row) => `${row.key}=${row.value}`)
    .join("\n");
}

function nextLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function memoryFolders(memories: MemoryRecord[]) {
  const folders = new Set<string>();
  memories.forEach((memory) => {
    const parts = memory.path.split("/").filter(Boolean);
    parts.slice(0, -1).forEach((_, index) => {
      folders.add(parts.slice(0, index + 1).join("/"));
    });
  });
  return [...folders].sort();
}

function memoryName(path: string) {
  return path.split("/").filter(Boolean).pop() || path;
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
    <div className="flex flex-col gap-2">
      <div className="flex h-8 items-center justify-between gap-4">
        <h1 className="text-2xl leading-8 [font-weight:550]">{title}</h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="pr-32 text-sm leading-5 text-[#898781]">{description}</div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 text-sm font-semibold leading-5">{title}</h2>
      {children}
    </section>
  );
}

function DeploymentDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-sm leading-5 [font-weight:550]">{title}</h3>
      {children}
    </section>
  );
}

function EnvironmentDetailSection({ title, children, separated = false }: { title: string; children: React.ReactNode; separated?: boolean }) {
  return (
    <section className={separated ? "mt-1 border-t border-line pb-2 pt-3" : "pb-2"}>
      <h2 className="mb-1 text-base leading-6 [font-weight:550]">{title}</h2>
      {children}
    </section>
  );
}

function EnvironmentEditSection({
  title,
  children,
  action,
  separated = false,
  className = ""
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  separated?: boolean;
  className?: string;
}) {
  return (
    <section className={`${separated ? "mt-1 border-t border-line pb-2 pt-3" : "pb-2"} ${className}`}>
      <div className="mb-1 flex h-6 items-center justify-between">
        <h2 className="text-base leading-6 [font-weight:550]">{title}</h2>
        {action}
      </div>
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

function shortEnvironmentId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 4)}…${id.slice(-7)}`;
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function downloadText(filename: string, value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function filterSessionEvents(events: SessionEvent[], roleFilter: string, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return events.filter((event) => {
    const matchesRole = roleFilter === "All events" || event.role === roleFilter;
    if (!matchesRole) return false;
    if (!normalizedSearch) return true;
    return [event.id, event.role, event.kind, event.summary, event.status, event.tokens, event.cost, event.offset]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
}

function defaultAgentYaml(agent?: Agent) {
  return `name: ${agent?.name ?? "Untitled agent"}
description: ${agent?.description ?? "A blank starting point with the core toolset."}
model: ${agent?.model ?? "claude-sonnet-4-6"}
system: ${JSON.stringify(agent?.systemPrompt ?? "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end.")}
mcp_servers: []
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
skills: []
metadata: {}`;
}

function agentTemplateYaml(template: (typeof agentStartingTemplates)[number]) {
  return `name: ${template.name === "Blank agent" ? "Untitled agent" : template.name}
description: ${template.description}
model: claude-sonnet-4-6
system: ${JSON.stringify(template.system)}
mcp_servers: []
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
skills: []
metadata: {}`;
}

function agentConfigFromYaml(source: string) {
  return {
    name: yamlValue(source, "name", "Untitled agent"),
    model: yamlValue(source, "id", yamlValue(source, "model", "claude-sonnet-4-6")),
    description: yamlValue(source, "description", "A blank starting point with the core toolset."),
    system: yamlValue(source, "system", "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end.")
  };
}

function yamlValue(source: string, key: string, fallback: string) {
  const line = source.split("\n").find((item) => item.trim().startsWith(`${key}:`));
  if (!line) return fallback;
  const value = line.trim().slice(key.length + 1).trim();
  return value ? value.replace(/^['"]|['"]$/g, "") : fallback;
}

const filesPythonTemplate = `import anthropic

client = anthropic.Anthropic()

client.beta.files.upload(
    file=("document.pdf", open("/path/to/document.pdf", "rb"), "application/pdf"),
)`;

const filesCurlTemplate = `curl -X POST "https://api.anthropic.com/v1/files" \\
     -H "x-api-key: $ANTHROPIC_API_KEY" \\
     -H "anthropic-version: 2023-06-01" \\
     -H "anthropic-beta: files-api-2025-04-14" \\
     -F "file=@/path/to/document.pdf"`;
