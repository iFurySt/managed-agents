import {
  Archive,
  Bot,
  Box,
  Boxes,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CircleDollarSign,
  Database,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Home,
  Info,
  KeyRound,
  MessageSquare,
  PanelLeftClose,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Terminal,
  Trash2,
  Wrench
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  archiveSession,
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
  deleteEnvironment,
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
  updateDeployment,
  updateEnvironment
} from "./api";
import { Badge, Button, CdsDropdownMenu, CdsTabs, ConsoleDialog, DataTable, FieldSelect, SidebarItem, TextInput } from "./components/cds";
import type { Agent, CollectionName, Deployment, Environment, MemoryRecord, MemoryStore, Resource, Session, SessionEvent, SkillPackage, SkillVersion, UpdateDeploymentInput, Vault, VaultCredential, WorkspaceFile } from "./types";

const managedRoutes: { path: CollectionName; title: string; description: string; action: string }[] = [];
const defaultDeploymentEnvironmentId = "env_01UTaKkbFknSkQNEsZjUARMh";
const deploymentAgentOptions = [
  { value: "agent_013mi1SmR2hJ6Hk6wNTeJvF9", name: "Managed SSH Reverse Tunnel Bootstrapper", updated: "3 days ago" },
  { value: "agent_01AVRPTGyYareCeoUasn66q5", name: "Incident commander", updated: "3 days ago" },
  { value: "agent_019BdsR2v3NW1DiEG62wpu3e", name: "World Cup Daily Digest (self-hosted clone)", updated: "3 days ago" },
  { value: "agent_017k8CPYuCFRD9AmupUeXd2Z", name: "World Cup Daily Digest", updated: "3 days ago" },
  { value: "agent_01MNpVPKyrSECHGA6HqAmREZ", name: "Untitled agent", updated: "3 days ago" }
];

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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-line bg-[#f9f9f7] p-3">
      <div className="flex h-10 items-start justify-between">
        <Link className="mt-[6px] pl-2 text-base !leading-4 [font-weight:400]" to="/">
          Claude Console
        </Link>
        <Button variant="ghost" className="mt-px !h-7 !w-7 !px-0 text-muted hover:text-ink" aria-label="Collapse sidebar">
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>
      <button className="mb-[18px] mt-[5px] flex h-[30px] items-center justify-between rounded-cds border border-line bg-white px-3 text-sm shadow-sm">
        <span className="flex items-center gap-2">
          <Box className="h-4 w-4 text-[#8b6fff]" />
          Default
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-0">
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
      <div className="-mx-3 border-t border-line bg-[#fcfcfb] px-3 py-3">
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
    <div className="flex shrink-0 items-center gap-3 rounded-lg px-2 text-sm text-[#4e4a45] [font-weight:550]" style={{ height: 36 }}>
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
    <div className="mb-1 flex shrink-0 flex-col gap-1">
      <div className="flex shrink-0 items-center gap-3 rounded-lg px-2 text-sm font-semibold text-[#4e4a45]" style={{ height: 36 }}>
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
            <div key={item} className="flex shrink-0 items-center rounded-lg pl-10 text-sm text-[#4e4a45] [font-weight:400]" style={{ height: 36 }}>
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
    <div data-cds="Banner" className="mb-10 flex h-[76px] items-start gap-2 rounded-[12px] bg-[#fcfcfb] px-4 py-3">
      <Info className="h-5 w-5 shrink-0 text-muted" />
      <div className="flex-1 text-sm leading-5">
        <span>Update June 12: We've suspended access to Claude Fable 5 and Claude Mythos 5. Please use Opus 4.8 or another model.</span>
        <div>
          <Button className="-ml-0.5 mt-2 !h-7 !w-[130px] !gap-1.5 !px-2.5 !text-sm">
            Learn more here
          </Button>
        </div>
      </div>
      <Button variant="ghost" className="-mr-2.5 -mt-1.5 h-8 w-8 px-0" onClick={() => setVisible(false)} aria-label="Dismiss banner">
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
  const [archivingAgent, setArchivingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    listAgents({ q: search, status, created }).then(setAgents).catch(() => setAgents([]));
  }, [created, search, status]);

  async function archiveCurrent(agent: Agent) {
    const updated = await archiveAgent(agent.id);
    setAgents((items) => status === "Archived" ? items.map((item) => (item.id === updated.id ? updated : item)) : items.filter((item) => item.id !== updated.id));
    setArchivingAgent(null);
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
        <div data-cds="TextInput" className="relative flex h-8 w-[320px] items-center rounded-[8px] bg-white/50 px-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
            aria-label="Search by name or exact ID"
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
          renderActions={(agent) => <AgentRowActions agent={agent} onArchive={() => setArchivingAgent(agent)} />}
        />
      </div>
      <AgentArchiveDialog
        open={Boolean(archivingAgent)}
        onOpenChange={(open) => {
          if (!open) setArchivingAgent(null);
        }}
        onConfirm={() => archivingAgent ? archiveCurrent(archivingAgent) : undefined}
      />
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
  const [archivingSession, setArchivingSession] = useState<Session | null>(null);

  useEffect(() => {
    listSessions({ q: search, status, agentId: agent, deploymentId: deployment, created }).then(setSessions).catch(() => setSessions([]));
  }, [agent, created, deployment, search, status]);

  async function archiveCurrent(session: Session) {
    const updated = await archiveSession(session.id);
    setSessions((items) => status === "Archived" ? items.map((item) => (item.id === updated.id ? updated : item)) : items.filter((item) => item.id !== updated.id));
    setArchivingSession(null);
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
          options={["Active", "Idle", "Archived", "All"]}
          onValueChange={setStatus}
          triggerClassName="ml-2 w-[123px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <div className="-mt-4">
        <DataTable
          className="-mx-2 w-[calc(100%+16px)] p-2"
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
          renderActions={(session) => <SessionRowActions session={session} onArchive={() => setArchivingSession(session)} />}
        />
      </div>
      <CreateSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(session) => setSessions((items) => [session, ...items])}
      />
      <SessionArchiveDialog
        open={Boolean(archivingSession)}
        onOpenChange={(open) => {
          if (!open) setArchivingSession(null);
        }}
        onConfirm={() => archivingSession ? archiveCurrent(archivingSession) : undefined}
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
  const [archiveOpen, setArchiveOpen] = useState(false);
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

  async function archiveCurrentSession() {
    if (!session) return;
    const updated = await archiveSession(session.id);
    setSession({ ...session, ...updated });
    setArchiveOpen(false);
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

  async function sendInterrupt() {
    if (!session) return;
    const updated = await createSessionMessage(session.id, "Interrupt the current run.");
    setSession(updated);
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
            onSendInterrupt={sendInterrupt}
            onSendEvent={() => setAskOpen(true)}
            onArchive={() => setArchiveOpen(true)}
          />
          <Button className="w-[116px]" onClick={() => setAskOpen(true)}>
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
      <SessionArchiveDialog open={archiveOpen} onOpenChange={setArchiveOpen} onConfirm={archiveCurrentSession} />
    </section>
  );
}

type DeploymentFilterOption = {
  value: string;
  label: string;
  helper?: string;
};

function DeploymentFilterSelect({
  label,
  value,
  options,
  onValueChange,
  triggerWidth,
  menuWidth,
  itemHeight = "h-8",
  fallbackLabel,
  showSearch = false,
  searchPlaceholder = ""
}: {
  label: string;
  value: string;
  options: DeploymentFilterOption[];
  onValueChange: (value: string) => void;
  triggerWidth: string;
  menuWidth: string;
  itemHeight?: string;
  fallbackLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? fallbackLabel ?? options[0]?.label ?? value;
  const visibleOptions = showSearch
    ? options.filter((option) => `${option.label} ${option.helper ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div data-cds="Field" className="relative h-10">
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={`${label} filter`}
          className={`flex h-8 items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35 ${triggerWidth}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            <span className="text-muted">{label}</span>
            <span className="truncate">{selectedLabel}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className={`absolute left-0 top-[38px] z-50 rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)] ${menuWidth}`}
        >
          {showSearch ? (
            <input
              role="combobox"
              aria-expanded="true"
              aria-label={`${label} filter search`}
              className="-mx-1 -mt-1 mb-1 block h-[37px] w-[calc(100%+8px)] shrink-0 border-0 border-b border-black/10 bg-transparent px-3 text-sm outline-none placeholder:text-muted"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          ) : null}
          <div role="listbox" className="grid gap-0">
            {visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={`flex w-full items-center justify-between rounded-[8px] px-3 text-left text-sm leading-5 text-ink outline-none hover:bg-fill aria-selected:bg-black/[0.05] ${itemHeight}`}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate">{option.label}</span>
                  {option.helper ? <span className="truncate text-xs leading-4 text-muted">{option.helper}</span> : null}
                </span>
                {value === option.value ? <Check className="h-4 w-4 shrink-0 text-muted" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("All");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [archivingDeployment, setArchivingDeployment] = useState<Deployment | null>(null);

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

  async function updateCurrent(deployment: Deployment, input: UpdateDeploymentInput) {
    const updated = await updateDeployment(deployment.id, input);
    setDeployments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setEditingDeployment(null);
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
      <div className="mt-4 flex flex-wrap items-start gap-2">
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
        <DeploymentFilterSelect
          label="Agent"
          value={agent}
          options={deploymentAgentOptions.map((option) => ({ value: option.value, label: option.name, helper: option.updated }))}
          onValueChange={setAgent}
          triggerWidth="w-[112px]"
          menuWidth="w-[320px]"
          itemHeight="h-12"
          fallbackLabel="All"
          showSearch
        />
        <div className="ml-2">
          <DeploymentFilterSelect
            label="Status"
            value={status}
            options={["All", "Active", "Paused"].map((option) => ({ value: option, label: option }))}
            onValueChange={setStatus}
            triggerWidth="w-[98px]"
            menuWidth="w-[192px]"
          />
        </div>
      </div>
      <div className="mt-2 overflow-x-auto">
        <DataTable
          className="-mx-2 w-[calc(100%+16px)] p-2"
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
            { key: "trigger", header: "Trigger", width: "200px", render: (deployment) => <span>{deploymentTriggerLabel(deployment)}</span> },
            { key: "created", header: "Created", width: "160px", render: (deployment) => <span className="text-muted">{deployment.createdLabel}</span> }
          ]}
          actionsHeader="Actions"
          renderActions={(deployment) => (
            <DeploymentActions
              deployment={deployment}
              onPause={() => applyStatus(deployment, "pause")}
              onResume={() => applyStatus(deployment, "resume")}
              onEdit={() => setEditingDeployment(deployment)}
              onArchive={() => setArchivingDeployment(deployment)}
            />
          )}
        />
      </div>
      <CreateDeploymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(deployment) => setDeployments((items) => [deployment, ...items])}
      />
      <CreateDeploymentDialog
        mode="edit"
        open={Boolean(editingDeployment)}
        onOpenChange={(open) => {
          if (!open) setEditingDeployment(null);
        }}
        deployment={editingDeployment}
        onUpdated={(input) => (editingDeployment ? updateCurrent(editingDeployment, input) : Promise.resolve())}
      />
      <DeploymentArchiveDialog
        open={Boolean(archivingDeployment)}
        onOpenChange={(open) => {
          if (!open) setArchivingDeployment(null);
        }}
        onConfirm={async () => {
          if (!archivingDeployment) return;
          await applyStatus(archivingDeployment, "archive");
          setArchivingDeployment(null);
        }}
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
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

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

  async function updateCurrent(input: UpdateDeploymentInput) {
    if (!deployment) return;
    const updated = await updateDeployment(deployment.id, input);
    setDeployment(updated);
    setEditOpen(false);
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
            onPause={() => applyStatus("pause")}
            onResume={() => applyStatus("resume")}
            onEdit={() => setEditOpen(true)}
            onArchive={() => setArchiveOpen(true)}
          />
        </div>
      </div>
      <CreateDeploymentDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        deployment={deployment}
        onUpdated={updateCurrent}
      />
      <DeploymentArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={async () => {
          await applyStatus("archive");
          setArchiveOpen(false);
        }}
      />

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
            <div className="group/value flex items-start gap-2 rounded-md border-[0.5px] border-[#dedbd2] bg-[#f9f9f7] px-3 py-2">
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-4 text-[#4e4a45]">{deployment.schedule}</pre>
              <button
                type="button"
                className="-my-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[8px] p-1 text-muted opacity-0 transition-colors hover:bg-fill hover:text-ink focus-visible:opacity-100 group-hover/value:opacity-100"
                aria-label="Copy"
                onClick={() => copyText(deployment.schedule)}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
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
            <div className="group/value flex items-start gap-2 rounded-md border-[0.5px] border-[#dedbd2] bg-[#f9f9f7] px-3 py-2">
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-4 text-[#4e4a45]">{deployment.initialMessage}</pre>
              <button
                type="button"
                className="-my-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[8px] p-1 text-muted opacity-0 transition-colors hover:bg-fill hover:text-ink focus-visible:opacity-100 group-hover/value:opacity-100"
                aria-label="Copy"
                onClick={() => copyText(deployment.initialMessage)}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
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
          <div className="flex gap-2">
            <Button variant="icon" className="h-8 w-8 rounded-[8px] text-muted" aria-label="Previous page" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="icon" className="h-8 w-8 rounded-[8px] text-muted" aria-label="Next page" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
  const [archivingEnvironment, setArchivingEnvironment] = useState<Environment | null>(null);
  const [deletingEnvironment, setDeletingEnvironment] = useState<Environment | null>(null);

  useEffect(() => {
    listEnvironments({ q: search, status }).then(setEnvironments).catch(() => setEnvironments([]));
  }, [search, status]);

  async function archiveCurrent(environment: Environment) {
    const updated = await archiveEnvironment(environment.id);
    setEnvironments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setArchivingEnvironment(null);
  }

  async function deleteCurrent(environment: Environment) {
    await deleteEnvironment(environment.id);
    setEnvironments((items) => items.filter((item) => item.id !== environment.id));
    setDeletingEnvironment(null);
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
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[calc(100%+16px)] p-2"
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
          renderActions={(environment) => (
            <EnvironmentActions
              environment={environment}
              onArchive={() => setArchivingEnvironment(environment)}
              onDelete={() => setDeletingEnvironment(environment)}
            />
          )}
        />
      </div>
      <CreateEnvironmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(environment) => setEnvironments((items) => [environment, ...items])}
      />
      <EnvironmentConfirmationDialog
        action="archive"
        environment={archivingEnvironment}
        open={Boolean(archivingEnvironment)}
        onOpenChange={(open) => {
          if (!open) setArchivingEnvironment(null);
        }}
        onConfirm={() => archivingEnvironment ? archiveCurrent(archivingEnvironment) : undefined}
      />
      <EnvironmentConfirmationDialog
        action="delete"
        environment={deletingEnvironment}
        open={Boolean(deletingEnvironment)}
        onOpenChange={(open) => {
          if (!open) setDeletingEnvironment(null);
        }}
        onConfirm={() => deletingEnvironment ? deleteCurrent(deletingEnvironment) : undefined}
      />
    </section>
  );
}

function EnvironmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [networkingType, setNetworkingType] = useState("Unrestricted");
  const [packageManager, setPackageManager] = useState("apt");
  const [packages, setPackages] = useState<string[]>([]);
  const [packageDraft, setPackageDraft] = useState("");
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>(emptyMetadataRows());
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    setArchiveOpen(false);
  }

  async function deleteCurrent() {
    if (!environment) return;
    await deleteEnvironment(environment.id);
    setDeleteOpen(false);
    navigate("/environments");
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
            <EnvironmentActions environment={environment} onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
          ) : (
            <>
              <Button variant="ghost" className="h-8 bg-transparent px-3 [font-weight:550] hover:bg-fill" onClick={startEdit}>Edit</Button>
              <EnvironmentActions environment={environment} onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
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
      <EnvironmentConfirmationDialog
        action="archive"
        environment={environment}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={archiveCurrent}
      />
      <EnvironmentConfirmationDialog
        action="delete"
        environment={environment}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteCurrent}
      />
    </section>
  );
}

function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivingVault, setArchivingVault] = useState<Vault | null>(null);
  const [deletingVault, setDeletingVault] = useState<Vault | null>(null);

  useEffect(() => {
    listVaults({ q: search, status }).then(setVaults).catch(() => setVaults([]));
  }, [search, status]);

  async function archiveCurrent(vault: Vault) {
    const updated = await archiveVault(vault.id);
    setVaults((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setArchivingVault(null);
  }

  async function deleteCurrent(vault: Vault) {
    await deleteVault(vault.id);
    setVaults((items) => items.filter((item) => item.id !== vault.id));
    setDeletingVault(null);
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
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[calc(100%+16px)] p-2"
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
          renderActions={(vault) => (
            <VaultRowActions
              vault={vault}
              onArchive={() => setArchivingVault(vault)}
              onDelete={() => setDeletingVault(vault)}
            />
          )}
        />
      </div>
      <CreateVaultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(vault) => setVaults((items) => [vault, ...items])}
      />
      <VaultConfirmationDialog
        action="archive"
        vault={archivingVault}
        open={Boolean(archivingVault)}
        onOpenChange={(open) => {
          if (!open) setArchivingVault(null);
        }}
        onConfirm={() => archivingVault ? archiveCurrent(archivingVault) : undefined}
      />
      <VaultConfirmationDialog
        action="delete"
        vault={deletingVault}
        open={Boolean(deletingVault)}
        onOpenChange={(open) => {
          if (!open) setDeletingVault(null);
        }}
        onConfirm={() => deletingVault ? deleteCurrent(deletingVault) : undefined}
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) getVault(id).then(setVault).catch(() => setVault(null));
  }, [id]);

  async function archiveCurrentVault() {
    if (!vault) return;
    const updated = await archiveVault(vault.id);
    setVault({ ...vault, ...updated });
    setArchiveOpen(false);
  }

  async function deleteCurrentVault() {
    if (!vault) return;
    await deleteVault(vault.id);
    setDeleteOpen(false);
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
            <Badge className="!h-5 !rounded-[5px] px-2 text-xs !leading-[15px] [font-weight:550]" tone={vaultTone(vault.status)}>{vault.status}</Badge>
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
          <Button className="h-8 w-[143px] !gap-1.5 rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add credential
          </Button>
          <VaultRowActions vault={vault} onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
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
      <VaultConfirmationDialog
        action="archive"
        vault={vault}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={archiveCurrentVault}
      />
      <VaultConfirmationDialog
        action="delete"
        vault={vault}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteCurrentVault}
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
  const [archivingStore, setArchivingStore] = useState<MemoryStore | null>(null);
  const [deletingStore, setDeletingStore] = useState<MemoryStore | null>(null);

  useEffect(() => {
    listMemoryStores({ q: query, status, created }).then(setStores).catch(() => setStores([]));
  }, [created, query, status]);

  async function refreshStores() {
    const items = await listMemoryStores({ q: query, status, created });
    setStores(items);
  }

  async function archiveStore(store: MemoryStore) {
    const updated = await archiveMemoryStore(store.id);
    setStores((items) => items.map((item) => item.id === store.id ? updated : item));
    setArchivingStore(null);
  }

  async function deleteStore(store: MemoryStore) {
    await deleteMemoryStore(store.id);
    setStores((items) => items.filter((item) => item.id !== store.id));
    setDeletingStore(null);
  }

  return (
    <section className="-mx-2 flex flex-col">
      <PageHeader
        title="Memory stores"
        description="Browse and manage persistent memory for your agents."
        action={
          <div className="flex items-center gap-2">
            <Button className="!gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create memory store
            </Button>
            <Button variant="icon" className="h-8 w-8 !rounded-[8px] [font-weight:550]" aria-label="Refresh memory stores" onClick={refreshStores}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
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
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[calc(100%+16px)] p-2"
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
          renderActions={(store) => (
            <MemoryStoreActions
              store={store}
              onArchive={() => setArchivingStore(store)}
              onDelete={() => setDeletingStore(store)}
            />
          )}
        />
      </div>
      <CreateMemoryStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(store) => setStores((items) => [store, ...items])}
      />
      <MemoryStoreConfirmationDialog
        action="archive"
        open={Boolean(archivingStore)}
        onOpenChange={(open) => {
          if (!open) setArchivingStore(null);
        }}
        onConfirm={() => archivingStore ? archiveStore(archivingStore) : undefined}
      />
      <MemoryStoreConfirmationDialog
        action="delete"
        open={Boolean(deletingStore)}
        onOpenChange={(open) => {
          if (!open) setDeletingStore(null);
        }}
        onConfirm={() => deletingStore ? deleteStore(deletingStore) : undefined}
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    setArchiveOpen(false);
  }

  async function deleteCurrentStore() {
    if (!store) return;
    await deleteMemoryStore(store.id);
    setDeleteOpen(false);
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
    <section className="-mt-2 flex h-[calc(100vh-144px)] flex-col overflow-hidden">
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
            <Badge className="!h-5 !rounded-[5px] !leading-[15px] [font-weight:550]" tone={memoryTone(store.status)}>{store.status}</Badge>
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
          <Button className="h-8 w-[130px] !gap-1.5 !rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            Add memory
          </Button>
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 overflow-hidden rounded-xl border-[0.5px] border-line">
        <aside className="relative flex w-72 shrink-0 flex-col border-r-[0.5px] border-line bg-[#f9f9f7]">
          <Button variant="ghost" size="sm" className="absolute right-2 top-4 !h-6 !w-6 rounded-[6px] !px-0 [font-weight:550]" aria-label="Expand all">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {folders.map((folder) => (
              <div key={folder} className="flex h-7 items-center gap-1.5 rounded-lg px-3 py-1 text-sm text-[#52514e] hover:bg-[#f6f6f0]">
                <ChevronDown className="h-3.5 w-3.5" />
                <Database className="h-3.5 w-3.5" />
                <span className="truncate">{folder}</span>
              </div>
            ))}
            {memories.map((memory) => (
              <button
                key={memory.id}
                className={`flex h-7 items-center gap-1.5 rounded-lg py-1 pr-3 text-left text-sm hover:bg-[#f6f6f0] ${selectedMemoryId === memory.id ? "bg-[#f6f6f0] pl-8 text-ink [font-weight:550]" : "px-3 text-[#52514e]"}`}
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
              <div className="flex h-[56px] items-center justify-between gap-4 border-b-[0.5px] border-line px-3 py-2">
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
                  <Button variant="ghost" className="!h-7 !gap-1.5 rounded-[7px] !px-2.5 text-sm !leading-5 [font-weight:550]">
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
      <MemoryStoreConfirmationDialog
        action="archive"
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={archiveCurrentStore}
      />
      <MemoryStoreConfirmationDialog
        action="delete"
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteCurrentStore}
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
    <div className="mt-2 max-w-[952px]">
      <p className="mb-3 text-sm text-[#898781]">No files have been uploaded to the Default workspace. Copy the template below to upload your first file:</p>
      <div className="overflow-hidden rounded-cds bg-fill">
        <div className="flex h-9 items-center gap-2 px-3">
          <FilesLanguageMenu language={language} onLanguageChange={onLanguageChange} />
          <div className="ml-auto flex items-center gap-1">
            <a data-cds="Button" className="inline-flex h-6 w-[96px] items-center gap-1.5 rounded-md px-2 text-[13px] leading-5 [font-weight:550] hover:bg-[#eeeeeb]" href="https://docs.claude.com/en/docs/build-with-claude/files">
              View docs
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
            </a>
            <Button variant="ghost" size="sm" className="!-mr-1 !h-6 !w-6 !gap-1.5 !rounded-md !px-0 !text-[13px] !leading-5 [font-weight:550]" aria-label="Copy code" onClick={() => copyText(code)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <pre className="overflow-x-auto px-3 pb-3 pt-3 font-mono text-[13px] leading-[21.125px] text-ink">
          {code.split("\n").map((line, index) => (
            <span key={`${line}-${index}`} className="relative block min-h-[21px] whitespace-pre-wrap pl-10">
              <span className="absolute left-0 w-10 select-none pr-4 text-right text-[#898781]">{index + 1}</span>
              <span>{renderFilesCodeLine(line, language)}</span>
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

function renderFilesCodeLine(line: string, language: string) {
  if (!line) return " ";

  const tokenPattern = language === "Python"
    ? /(".*?"|\bimport\b|\b(?:beta|files)\b|\b(?:Anthropic|upload|open)\b|[.=(),])/g
    : /(".*?"|\b(?:curl)\b|-[A-Z]|[=:\\])/g;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(line.slice(cursor, start));
    nodes.push(
      <span key={`${token}-${index}`} className={filesCodeTokenClass(token, language)}>
        {token}
      </span>
    );
    cursor = start + token.length;
    index += 1;
  }

  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes.length ? nodes : line;
}

function filesCodeTokenClass(token: string, language: string) {
  if (/^".*"$/.test(token)) return "text-[#008000]";
  if (language === "Python" && token === "import") return "text-[#8100c2]";
  if (language === "Python" && (token === "beta" || token === "files")) return "text-[#b80a18]";
  if (language === "Python" && (token === "Anthropic" || token === "upload" || token === "open")) return "text-[#0044cc]";
  if (language === "cURL" && (token === "curl" || token.startsWith("-"))) return "text-[#8100c2]";
  return "text-[#2b303b]";
}

function FilesLanguageMenu({ language, onLanguageChange }: { language: string; onLanguageChange: (value: string) => void }) {
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="ghost" className="!h-6 !w-[81px] !gap-1.5 !rounded-md !bg-transparent !px-2 !text-[13px] !text-[#52514e] [font-weight:550] hover:!bg-[#eeeeeb]">
          {language}
          <ChevronDown className="h-3.5 w-3.5 text-[#898781]" />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="DropdownButton" className="z-50 w-[128px] rounded-[12px] bg-white p-1 shadow-lg" align="start" sideOffset={6}>
          <CdsDropdownMenu.RadioGroup value={language} onValueChange={onLanguageChange}>
            {["Python", "cURL"].map((option) => (
              <CdsDropdownMenu.RadioItem
                key={option}
                value={option}
                className="flex h-8 w-[120px] cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-sm leading-5 outline-none data-[highlighted]:bg-fill data-[state=checked]:bg-fill"
              >
                <span className="min-w-0 flex-1 truncate">{option}</span>
                <CdsDropdownMenu.ItemIndicator>
                  <Check className="h-5 w-5 text-[#2a78d6]" />
                </CdsDropdownMenu.ItemIndicator>
              </CdsDropdownMenu.RadioItem>
            ))}
          </CdsDropdownMenu.RadioGroup>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
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
          <div className="flex items-center gap-2">
            <Button className="!h-8 !w-[120px] !gap-1.5 !rounded-[8px] [font-weight:550]" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create skill
            </Button>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-ink hover:bg-fill"
              aria-label="View documentation"
              href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        }
      />
      <div className="mt-2 flex max-w-[952px] flex-col border-t border-line">
        {skills.map((skill) => (
          <article key={skill.id} className="group grid min-h-[137px] grid-cols-[minmax(0,1fr)_28px] gap-4 border-b border-line px-3 py-3 transition-colors hover:bg-fill focus-within:bg-fill">
            <div className="min-w-0">
              <h3 className="mb-0 text-base leading-6 [font-weight:550]">{skill.name}</h3>
              <p className="cds-line-clamp-2 max-w-[720px] whitespace-pre-wrap text-sm leading-5 text-[#898781]">{skill.description}</p>
              <div className="mt-[26px] flex h-[22px] flex-wrap items-center gap-2 text-xs leading-4 text-[#898781]">
                <span
                  data-cds="Badge"
                  className="inline-flex h-[22px] items-center rounded-[5.5px] bg-fill px-2 font-mono text-xs leading-[15px] text-[#52514e] [font-weight:550]"
                >
                  <span>{skill.slug}</span>
                </span>
                <span>•</span>
                <span>{skill.owner}</span>
                <span>•</span>
                <span>{skill.updatedLabel}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="icon"
                className="!h-7 !w-7 !border-0 !px-0 !text-ink !opacity-0 transition-opacity group-hover:!opacity-100 group-focus-within:!opacity-100"
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    if (id) getAgent(id).then(setAgent).catch(() => setAgent(null));
  }, [id]);

  if (!agent) return <EmptyState title="Agent not found" description="The selected agent could not be loaded." />;

  const currentAgent = agent;

  async function archiveCurrent() {
    const updated = await archiveAgent(currentAgent.id);
    setAgent(updated);
    setArchiveOpen(false);
  }

  const agentDetailHeadingClass = "text-[#52514e] [font-weight:550]";
  const agentDetailTabWidths: Record<string, string> = {
    Agent: "w-[65px]",
    Sessions: "w-[83px]",
    Deployments: "w-[114px]"
  };
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "sessions" || tabParam === "deployments" ? tabParam : "agent";

  function setDetailTab(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === "agent") {
      next.delete("tab");
    } else {
      next.set("tab", value);
    }
    setSearchParams(next);
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
          <AgentRowActions agent={agent} onArchive={() => setArchiveOpen(true)} />
        </div>
      </div>
      <p className="mt-[9px] text-sm leading-5 text-[#4e4a45]">{agent.description}</p>
      <CdsTabs.Root value={activeTab} onValueChange={setDetailTab} className="mt-4 flex flex-col gap-5">
        <CdsTabs.List data-cds="NavigationTabs" className="flex h-8 items-end gap-[2px] border-b border-line font-sans">
          {["Agent", "Sessions", "Deployments"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className={`relative -mb-px inline-flex h-8 shrink-0 items-center justify-center rounded-t-[8px] border-b-2 border-transparent px-3 text-sm text-[#898781] [font-weight:400] data-[state=active]:border-ink data-[state=active]:text-ink data-[state=active]:[font-weight:500] ${agentDetailTabWidths[tab]}`}
            >
              {tab}
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="agent" className="grid max-w-[952px] gap-5">
          <div>
            <FieldSelect
              label="Version:"
              value={agent.version || "v1"}
              options={[agent.version || "v1"]}
              onValueChange={() => undefined}
              triggerClassName="w-[113px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
            />
          </div>
          <div className="mb-[31px]">
            <DetailSection title="Model" headingClassName={agentDetailHeadingClass}>
              <div className="font-mono text-sm">{agent.model}</div>
            </DetailSection>
          </div>
          <section>
            <h2 className={`text-sm leading-5 ${agentDetailHeadingClass}`}>System prompt</h2>
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
          <DetailSection title="MCPs and tools" headingClassName={agentDetailHeadingClass}>
            <div className="flex items-center gap-3 rounded-cds border border-line bg-white p-4">
              <Bot className="h-5 w-5 text-muted" />
              <div>
                <div className="text-sm font-semibold">Built-in tools</div>
                <div className="font-mono text-sm text-muted">{agent.tools}</div>
              </div>
              <Badge>
                <Shield className="mr-1 h-3.5 w-3.5" />
                Tool permissions
              </Badge>
              <Badge>8</Badge>
              <Badge tone="green">
                <Check className="mr-1 h-3.5 w-3.5" />
                Always allow
              </Badge>
            </div>
          </DetailSection>
          <DetailSection title="Skills" headingClassName={agentDetailHeadingClass}>
            <EmptyState compact title="No skills configured." description="" />
          </DetailSection>
        </CdsTabs.Content>
        <CdsTabs.Content value="sessions" className="-mt-6">
          <AgentSessionsPanel agent={agent} />
        </CdsTabs.Content>
        <CdsTabs.Content value="deployments" className="-mt-6">
          <AgentDeploymentsPanel agent={agent} />
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
      <AgentArchiveDialog open={archiveOpen} onOpenChange={setArchiveOpen} onConfirm={archiveCurrent} />
    </section>
  );
}

function AgentSessionsPanel({ agent }: { agent: Agent }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [created, setCreated] = useState("All time");
  const [version, setVersion] = useState("All");
  const [deployment, setDeployment] = useState("All");
  const [status, setStatus] = useState("All");
  const [archivingSession, setArchivingSession] = useState<Session | null>(null);

  useEffect(() => {
    listSessions({ agentId: agent.id, created, deploymentId: deployment, status }).then(setSessions).catch(() => setSessions([]));
  }, [agent.id, created, deployment, status]);

  async function archiveCurrent(session: Session) {
    const updated = await archiveSession(session.id);
    setSessions((items) => status === "Archived" || status === "All" ? items.map((item) => (item.id === updated.id ? updated : item)) : items.filter((item) => item.id !== updated.id));
    setArchivingSession(null);
  }

  const agentVersion = agent.version || "v1";
  const deploymentOptions = ["All", ...Array.from(new Set([deployment === "All" ? "" : deployment, ...sessions.map((session) => session.deploymentId)].filter(Boolean)))];
  const versionOptions = ["All", agentVersion];
  const visibleSessions = version === "All" || version === agentVersion ? sessions : [];

  return (
    <div className="grid gap-4">
      <div className="flex h-8 flex-wrap items-center gap-2">
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerClassName="w-[150px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Version"
          value={version}
          options={versionOptions}
          onValueChange={setVersion}
          triggerClassName="w-[132px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Deployment"
          value={deployment}
          options={deploymentOptions}
          onValueChange={setDeployment}
          triggerClassName="w-[172px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Idle", "Archived"]}
          onValueChange={setStatus}
          triggerClassName="w-[106px] !gap-1.5 !rounded-[8px] !border-0 !bg-white/50 !px-2"
        />
      </div>
      <DataTable
        rows={visibleSessions}
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
            width: "300px",
            render: (session) => (
              <Link className="block truncate font-medium hover:underline" to={`/sessions/${session.id}`}>
                {session.name}
              </Link>
            )
          },
          { key: "status", header: "Status", width: "126px", render: (session) => <Badge tone={sessionTone(session.status)}>{session.status}</Badge> },
          { key: "version", header: "Version", width: "126px", render: () => <span className="font-mono">{agentVersion}</span> },
          { key: "created", header: "Created", width: "160px", render: (session) => <span className="text-muted">{agentSessionCreatedLabel(session)}</span> }
        ]}
        actionsWidth="56px"
        renderActions={(session) => <SessionRowActions session={session} onArchive={() => setArchivingSession(session)} />}
      />
      <SessionArchiveDialog
        open={Boolean(archivingSession)}
        onOpenChange={(open) => {
          if (!open) setArchivingSession(null);
        }}
        onConfirm={() => archivingSession ? archiveCurrent(archivingSession) : undefined}
      />
    </div>
  );
}

function AgentDeploymentsPanel({ agent }: { agent: Agent }) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [archivingDeployment, setArchivingDeployment] = useState<Deployment | null>(null);

  useEffect(() => {
    listDeployments({ agentId: agent.id }).then(setDeployments).catch(() => setDeployments([]));
  }, [agent.id]);

  async function applyStatus(deployment: Deployment, action: "pause" | "resume" | "archive") {
    const updated =
      action === "pause"
        ? await pauseDeployment(deployment.id)
        : action === "resume"
          ? await resumeDeployment(deployment.id)
          : await archiveDeployment(deployment.id);
    setDeployments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function updateCurrent(deployment: Deployment, input: UpdateDeploymentInput) {
    const updated = await updateDeployment(deployment.id, input);
    setDeployments((items) => items.map((item) => (item.id === updated.id ? updated : item)).filter((item) => item.agentId === agent.id));
    setEditingDeployment(null);
  }

  return (
    <>
      {deployments.length ? (
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
              width: "260px",
              render: (deployment) => (
                <Link className="block truncate font-medium hover:underline" to={`/deployments/${deployment.id}`}>
                  {deployment.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "120px", render: (deployment) => <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge> },
            { key: "trigger", header: "Trigger", width: "210px", render: (deployment) => <span>{deploymentTriggerLabel(deployment)}</span> },
            { key: "created", header: "Created", width: "160px", render: (deployment) => <span className="text-muted">{deployment.createdLabel}</span> }
          ]}
          actionsHeader="Actions"
          renderActions={(deployment) => (
            <DeploymentActions
              deployment={deployment}
              onPause={() => applyStatus(deployment, "pause")}
              onResume={() => applyStatus(deployment, "resume")}
              onEdit={() => setEditingDeployment(deployment)}
              onArchive={() => setArchivingDeployment(deployment)}
            />
          )}
        />
      ) : (
        <div className="flex h-[268px] flex-col items-center pt-[120px] text-center">
          <p className="text-lg leading-7 text-ink [font-weight:550]">No deployments</p>
          <p className="mt-1 text-sm leading-5 text-[#898781]">Deploy this agent to run it on a schedule, via webhook, or manually.</p>
          <Button variant="ghost" className="mt-4 h-8 w-[174px] gap-1.5 rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create deployment
          </Button>
        </div>
      )}
      <CreateDeploymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAgentId={agent.id}
        initialAgentName={agent.name}
        initialAgentVersion={agent.version || "v1"}
        initialEnvironmentId="env_01ManagedDebug"
        initialEnvironmentName="managed-ssh-debug-env"
        onCreated={(deployment) => setDeployments((items) => (deployment.agentId === agent.id ? [deployment, ...items] : items))}
      />
      <CreateDeploymentDialog
        mode="edit"
        open={Boolean(editingDeployment)}
        onOpenChange={(open) => {
          if (!open) setEditingDeployment(null);
        }}
        deployment={editingDeployment}
        onUpdated={(input) => (editingDeployment ? updateCurrent(editingDeployment, input) : Promise.resolve())}
      />
      <DeploymentArchiveDialog
        open={Boolean(archivingDeployment)}
        onOpenChange={(open) => {
          if (!open) setArchivingDeployment(null);
        }}
        onConfirm={async () => {
          if (!archivingDeployment) return;
          await applyStatus(archivingDeployment, "archive");
          setArchivingDeployment(null);
        }}
      />
    </>
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

  function generateFromDescription() {
    const prompt = normalizeAgentDescription(description);
    if (!prompt) return;
    setConfigYaml(agentDescriptionYaml(prompt));
  }

  async function submit() {
    const config = agentConfigFromYaml(configYaml);
    const agent = await createAgent({
      name: config.name,
      description: config.description,
      model: config.model.id,
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
            <div className="mt-[12px] min-h-[113px] rounded-[8px] border border-[#d4d0c8] bg-white px-3 pb-3 pt-3">
              <textarea
                className="h-[45px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-[22.75px] outline-none placeholder:text-muted"
                aria-label="Describe your agent"
                placeholder="Summarizes new GitHub PRs and posts a digest to Slack."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div className="mt-[10px] flex justify-end">
                <Button
                  variant="ghost"
                  className={`h-[27px] w-[82px] rounded-control bg-transparent !px-[10px] [font-weight:550] ${description.trim() ? "!opacity-100" : ""}`}
                  disabled={!description.trim()}
                  onClick={generateFromDescription}
                >
                  Generate
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid h-[245px] auto-rows-min grid-cols-3 gap-3 bg-white">
              {agentStartingTemplates.map((template) => (
                <button
                  key={template.name}
                  className={`flex w-full cursor-pointer flex-col items-start overflow-hidden rounded-[8px] bg-white p-3 text-left text-sm transition hover:bg-fill ${selectedTemplate.name === template.name ? "border-[1.5px] border-black/20" : "border border-line"}`}
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
      model: config.model.id,
      systemPrompt: config.system,
      configYaml
    });
    onSaved(updated);
  }

  return (
    <ConsoleDialog
      title="Edit agent"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="h-[680px] w-[720px] max-w-[calc(100vw-32px)] !max-h-[calc(100dvh-32px)] !rounded-[12px] border-0"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-8 w-8 rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="max-h-[calc(100dvh-106px)] overflow-y-auto px-6 pb-0 pt-[11px]">
        <div className="flex h-[548px] flex-col overflow-hidden rounded-[8px] border-[0.5px] border-line bg-white">
          <div className="flex h-11 shrink-0 items-center justify-between gap-2 pl-3 pr-2">
            <div className="flex min-w-0 flex-1 items-center text-sm" role="tablist" aria-label="Agent config format">
              <button
                aria-selected={format === "YAML"}
                className={`h-7 w-[60px] rounded-full px-[10px] [font-weight:550] ${format === "YAML" ? "text-ink" : "text-muted"}`}
                role="tab"
                type="button"
                onClick={() => setFormat("YAML")}
              >
                YAML
              </button>
              <button
                aria-selected={format === "JSON"}
                className={`h-7 w-[59px] rounded-full px-[10px] [font-weight:550] ${format === "JSON" ? "text-ink" : "text-muted"}`}
                role="tab"
                type="button"
                onClick={() => setFormat("JSON")}
              >
                JSON
              </button>
            </div>
            <Button variant="ghost" className="!h-7 !w-7 !gap-1.5 rounded-[7px] !px-0 [font-weight:550]" aria-label="Copy code" onClick={() => copyText(format === "YAML" ? configYaml : jsonConfig)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative flex-1 overflow-auto px-3 pb-3 pt-[13px] text-ink">
            <p className="sr-only">Tab inserts indentation. Press Escape then Tab to move focus out of the editor.</p>
            {format === "YAML" ? (
              <textarea
                className="h-[475px] w-full resize-none border-0 bg-transparent p-0 font-mono text-[13px] leading-[19px] outline-none"
                value={configYaml}
                onChange={(event) => setConfigYaml(event.target.value)}
              />
            ) : (
              <pre className="min-h-[475px] whitespace-pre-wrap p-0 font-mono text-[13px] leading-[19px]">
                {jsonConfig}
              </pre>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="h-8 w-[139px] rounded-[8px] px-3 [font-weight:550]" onClick={submit}>Save new version</Button>
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
  const manageLinkClass = "inline-flex items-center gap-1 text-xs leading-4 text-[#184f95] hover:underline";

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
      contentClassName="h-[526px] w-[706px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      descriptionClassName="mt-1 text-sm text-[#52514e]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-[10px]">
        <div className="grid gap-4">
          <label className={`grid gap-[7px] ${fieldLabelClass}`}>
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
              <a className={manageLinkClass} href="/agents" target="_blank" rel="noreferrer">
                Manage agents
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <FieldSelect
              label=""
              value={agentId || "Select an agent"}
              options={["Select an agent", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_017k8CPYuCFRD9AmupUeXd2Z", "agent_01AVRPTGyYareCeoUasn66q5"]}
              onValueChange={(value) => setAgentId(value === "Select an agent" ? "" : value)}
              showLabel={false}
              triggerClassName="!h-[31px] w-[651px] border-0 !bg-transparent !pl-2 !pr-0"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Environment</label>
              <a className={manageLinkClass} href="/environments" target="_blank" rel="noreferrer">
                Manage environments
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <FieldSelect
              label=""
              value={environmentId || "Select an environment"}
              options={["Select an environment", "env_01ManagedDebug", "env_01UbuntuNode", "env_01PythonBrowser"]}
              onValueChange={(value) => setEnvironmentId(value === "Select an environment" ? "" : value)}
              showLabel={false}
              triggerClassName="!h-[31px] w-[651px] border-0 !bg-transparent !pl-2 !pr-0"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Credential vaults</label>
              <a className={manageLinkClass} href="/vaults" target="_blank" rel="noreferrer">
                Manage credential vaults
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <FieldSelect
              label=""
              value={vault || "Select one or more vaults"}
              options={["Select one or more vaults", "vault_01GitHub", "No vaults"]}
              onValueChange={(value) => setVault(value === "Select one or more vaults" || value === "No vaults" ? "" : value)}
              showLabel={false}
              triggerClassName="!h-[31px] w-[651px] border-0 !bg-transparent !pl-2 !pr-0"
            />
          </div>
          <div className="grid gap-[7px]">
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
        <div className="sticky bottom-0 -mx-6 mt-[37px] flex justify-end bg-white px-6 pb-[23px] pt-0">
          <Button className="h-[31px] w-[122px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create session</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateDeploymentDialog({
  mode = "create",
  open,
  onOpenChange,
  deployment,
  initialAgentId = "",
  initialAgentName = "",
  initialAgentVersion = "v1",
  initialEnvironmentId = "",
  initialEnvironmentName = "",
  onCreated,
  onUpdated
}: {
  mode?: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deployment?: Deployment | null;
  initialAgentId?: string;
  initialAgentName?: string;
  initialAgentVersion?: string;
  initialEnvironmentId?: string;
  initialEnvironmentName?: string;
  onCreated?: (deployment: Deployment) => void;
  onUpdated?: (input: UpdateDeploymentInput) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [vault, setVault] = useState("");
  const [memoryStore, setMemoryStore] = useState("");
  const [trigger, setTrigger] = useState("");
  const [scheduleExpression, setScheduleExpression] = useState("0 9 * * 1-5");
  const [timezone, setTimezone] = useState("Asia/Shanghai");

  const canCreate = name && agentId && initialMessage && environmentId && trigger;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const manageLinkClass = "inline-flex items-center gap-1 text-xs leading-4 text-[#184f95] hover:underline";
  const lockedAgentId = mode === "edit" && deployment ? deployment.agentId : initialAgentId;
  const lockedAgentName = mode === "edit" && deployment ? deployment.agentName : initialAgentName;
  const lockedAgentVersion = mode === "edit" && deployment ? deployment.agentVersion : initialAgentVersion;
  const pickerEnvironmentId = mode === "edit" && deployment ? deployment.environmentId : initialEnvironmentId;
  const pickerEnvironmentName = mode === "edit" && deployment ? deployment.environmentName : initialEnvironmentName;
  const scopedAgent = Boolean(lockedAgentId);

  function selectAgent(nextAgentId: string) {
    setAgentId(nextAgentId);
    if (nextAgentId && !environmentId && !initialEnvironmentId) {
      setEnvironmentId(defaultDeploymentEnvironmentId);
    }
  }

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && deployment) {
      setName(deployment.name);
      setAgentId(deployment.agentId);
      setInitialMessage(deployment.initialMessage);
      setEnvironmentId(deployment.environmentId);
      setVault(firstDeploymentBinding(deployment.vaults));
      setMemoryStore(firstDeploymentBinding(deployment.memoryStores));
      setTrigger(deployment.trigger || "Manual");
      setScheduleExpression(deployment.schedule && deployment.schedule !== "Manual" ? deployment.schedule : "0 9 * * 1-5");
      setTimezone(deployment.timezone || "Asia/Shanghai");
      return;
    }
    setName("");
    setInitialMessage("");
    setVault("");
    setMemoryStore("");
    setTrigger("");
    setScheduleExpression("0 9 * * 1-5");
    setTimezone("Asia/Shanghai");
    if (initialAgentId) setAgentId(initialAgentId);
    else setAgentId("");
    if (initialEnvironmentId) setEnvironmentId(initialEnvironmentId);
    else setEnvironmentId("");
  }, [deployment, initialAgentId, initialEnvironmentId, mode, open]);

  async function submit() {
    if (!canCreate) return;
    const input: UpdateDeploymentInput = {
      name,
      agentId,
      initialMessage,
      environmentId,
      vaults: vault ? [vault] : [],
      memoryStores: memoryStore ? [memoryStore] : [],
      trigger,
      schedule: trigger === "Schedule" ? scheduleExpression : "Manual",
      timezone
    };
    if (mode === "edit") {
      await onUpdated?.(input);
      onOpenChange(false);
      return;
    }
    const created = await createDeployment(input);
    onCreated?.(created);
    onOpenChange(false);
    setName("");
    setAgentId(initialAgentId);
    setEnvironmentId(initialEnvironmentId);
    setInitialMessage("");
    setVault("");
    setMemoryStore("");
    setTrigger("");
    setScheduleExpression("0 9 * * 1-5");
    setTimezone("Asia/Shanghai");
  }

  return (
    <ConsoleDialog
      title={mode === "edit" ? "Edit deployment" : "Create deployment"}
      description={mode === "edit" ? "Update this deployment's trigger, environment, and credentials. Changes apply to future runs." : "Deploy an agent with a trigger, environment, and credentials."}
      open={open}
      onOpenChange={onOpenChange}
      contentClassName={`${mode === "edit" ? "h-[calc(100dvh-32px)]" : "h-[718px]"} w-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] !rounded-[12px] border-0`}
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
          {scopedAgent ? (
            <div className="grid grid-cols-[300px_160px] gap-3">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className={fieldLabelClass}>Agent</label>
                  <a className={manageLinkClass} href={`/agents/${lockedAgentId}`} target="_blank" rel="noreferrer">
                    View agent
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
                <div className="flex h-8 items-center truncate text-sm">{lockedAgentName || lockedAgentId}</div>
              </div>
              <div className="grid gap-2">
                <label className={fieldLabelClass}>Version</label>
                <DeploymentVersionPicker value={lockedAgentVersion} />
              </div>
            </div>
          ) : agentId ? (
            <div className="grid grid-cols-[292px_160px] gap-5">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className={fieldLabelClass}>Agent</label>
                  <a className={manageLinkClass} href="/agents" target="_blank" rel="noreferrer">
                    Manage agents
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
                <DeploymentAgentPicker value={agentId} onValueChange={selectAgent} />
              </div>
              <div className="grid gap-2">
                <label className={fieldLabelClass}>Version</label>
                <DeploymentVersionPicker value="v1" />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabelClass}>Agent</label>
                <a className={manageLinkClass} href="/agents" target="_blank" rel="noreferrer">
                  Manage agents
                  <ExternalLink className="h-3 w-3" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
              <DeploymentAgentPicker value={agentId} onValueChange={selectAgent} wide />
            </div>
          )}
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
              <a className={manageLinkClass} href="/environments" target="_blank" rel="noreferrer">
                Manage environments
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <DeploymentEnvironmentPicker
              value={environmentId}
              onValueChange={setEnvironmentId}
              initialEnvironmentId={pickerEnvironmentId}
              initialEnvironmentName={pickerEnvironmentName}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Credential vaults(optional)</label>
              <a className={manageLinkClass} href="/vaults" target="_blank" rel="noreferrer">
                Manage credential vaults
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <DeploymentVaultPicker value={vault} onValueChange={setVault} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Memory stores(optional)</label>
              <a className={manageLinkClass} href="/memory-stores" target="_blank" rel="noreferrer">
                Manage memory stores
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
            <DeploymentMemoryStorePicker value={memoryStore} onValueChange={setMemoryStore} />
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Trigger</label>
            <DeploymentTriggerPicker value={trigger} onValueChange={setTrigger} />
          </div>
          {trigger === "Schedule" ? (
            <DeploymentScheduleFields
              expression={scheduleExpression}
              onExpressionChange={setScheduleExpression}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          ) : null}
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[19px] flex justify-end bg-white px-6 pb-[25px] pt-0">
          <Button className={`h-8 rounded-[8px] px-0 [font-weight:550] ${mode === "edit" ? "w-[51px]" : "w-[71px]"}`} onClick={submit} disabled={!canCreate}>{mode === "edit" ? "Save" : "Create"}</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function DeploymentVersionPicker({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  const label = `${value} · latest`;

  return (
    <div data-cds="Field" className="relative w-[160px]">
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment version"
          className="flex h-8 w-[152px] items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 w-[192px] rounded-[12px] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="listbox">
            <button
              type="button"
              role="option"
              aria-selected="true"
              className="flex h-8 w-[184px] items-center justify-between rounded-[8px] bg-black/[0.05] px-3 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.05]"
              onClick={() => setOpen(false)}
            >
              <span>{label}</span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#c6613f]" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentAgentPicker({
  value,
  onValueChange,
  wide = false
}: {
  value: string;
  onValueChange: (value: string) => void;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = deploymentAgentOptions.find((option) => option.value === value);

  return (
    <div data-cds="Field" className={`relative ${wide ? "w-[472px]" : "w-[300px]"}`}>
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment agent"
          className={`flex h-8 items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35 ${wide ? "w-[464px]" : "w-[292px]"}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="truncate">{selected?.name ?? "Select an agent"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[39px] z-50 w-[472px] rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {deploymentAgentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-12 w-full items-center justify-between rounded-[8px] px-3 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="truncate text-xs leading-4 text-muted">{option.updated}</span>
                </span>
                {value === option.value ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#c6613f]" aria-hidden /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentEnvironmentPicker({
  value,
  onValueChange,
  initialEnvironmentId,
  initialEnvironmentName
}: {
  value: string;
  onValueChange: (value: string) => void;
  initialEnvironmentId?: string;
  initialEnvironmentName?: string;
}) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: initialEnvironmentId || defaultDeploymentEnvironmentId, name: initialEnvironmentName || "managed-ssh-debug-env", updated: "3 days ago", host: "Cloud" },
    { value: "env_01LiiuDCwZBtqZd5EYMk9D9x", name: "123", updated: "3 days ago", host: "Self-hosted" },
    { value: "env_01AzQWp3SXQEATgdCFUNwteR", name: "myenv", updated: "3 days ago", host: "Self-hosted" },
    { value: "env_01UNo9NMB1ZQLKCZk21qryb8", name: "world-cup-digest-env", updated: "3 days ago", host: "Cloud" }
  ];
  const dedupedOptions = options.filter((option, index, all) => all.findIndex((item) => item.value === option.value) === index);
  const selected = value ? dedupedOptions.find((option) => option.value === value) : undefined;

  return (
    <div data-cds="Field" className="relative">
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment environment"
          className="flex h-8 w-full items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="truncate">{selected?.name ?? "Select an environment"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[39px] z-50 w-full rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {dedupedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-12 w-full items-center justify-between rounded-[8px] px-3 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="truncate text-xs leading-4 text-muted">
                    {option.updated} · {option.host}
                  </span>
                </span>
                {value === option.value ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#c6613f]" aria-hidden /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentVaultPicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: "test_secret", name: "test_secret", updated: "3 days ago", summary: "3 credentials" },
    { value: "vault_01GitHub", name: "GitHub source access", updated: "2 days ago", summary: "1 credential" }
  ];
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative">
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Add credential vault"
          className="flex h-8 w-full items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            {selected ? <Shield className="h-4 w-4 shrink-0 text-muted" /> : <Plus className="h-4 w-4 shrink-0 text-muted" />}
            <span className="truncate">{selected?.name ?? "Add vault"}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[39px] z-50 w-full rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-[46px] w-full items-center justify-between rounded-[8px] px-3 text-left outline-none hover:bg-fill"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="truncate text-xs leading-4 text-muted">{option.updated}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs leading-4 text-muted">
                  <KeyRound className="h-3.5 w-3.5" />
                  {option.summary}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentMemoryStorePicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: "123", name: "123", description: "No description", access: "Read & write" },
    { value: "zzz", name: "zzz", description: "No description", access: "Read & write" },
    { value: "world cup", name: "world cup", description: "No description", access: "Read & write" },
    { value: "leo_test", name: "leo_test", description: "123", access: "Read & write" }
  ];
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative grid gap-2">
      {selected ? (
        <div className="flex h-8 items-center justify-between rounded-[8px] bg-white/50 px-2 text-sm">
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            <Database className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{selected.name}</span>
            <span className="shrink-0 text-muted">{selected.access}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${selected.name}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] text-muted hover:bg-fill hover:text-ink"
            onClick={() => onValueChange("")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Add memory store"
          className="flex h-8 w-full items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            <Plus className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">Add memory store</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute bottom-[39px] left-0 z-50 w-full rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-[46px] w-full items-center justify-between rounded-[8px] px-3 text-left outline-none hover:bg-fill"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="truncate text-xs leading-4 text-muted">{option.description}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs leading-4 text-muted">
                  <Database className="h-3.5 w-3.5" />
                  {option.access}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentTriggerPicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: "Manual", description: "Run on demand from the dashboard or API", icon: Play },
    { value: "Schedule", description: "Run automatically on a cron schedule", icon: Clock }
  ];
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative">
      <div className="h-8 rounded-[8px] bg-white/50">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment trigger"
          className="flex h-8 w-[464px] items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            {selected ? <selected.icon className="h-4 w-4 text-muted" /> : null}
            <span className="truncate">{selected?.value ?? "Select a trigger"}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 w-[472px] rounded-[12px] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="listbox" className="grid gap-0">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted" />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="text-sm leading-4 text-ink">{option.value}</span>
                    <span className="truncate text-[13px] leading-4 text-muted">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type DeploymentFrequency = "Every minute" | "Every hour" | "Daily" | "Weekdays" | "Weekly" | "Custom cron";
type ScheduleMeridiem = "AM" | "PM";
type ScheduleWeekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

const deploymentFrequencyOptions: { value: DeploymentFrequency }[] = [
  { value: "Every minute" },
  { value: "Every hour" },
  { value: "Daily" },
  { value: "Weekdays" },
  { value: "Weekly" },
  { value: "Custom cron" }
];

const deploymentWeekdayOptions: { value: ScheduleWeekday; cron: number; runs: string[] }[] = [
  {
    value: "Sunday",
    cron: 0,
    runs: ["Sun, Jun 21, 2026, 9:00 AM", "Sun, Jun 28, 2026, 9:00 AM", "Sun, Jul 5, 2026, 9:00 AM", "Sun, Jul 12, 2026, 9:00 AM", "Sun, Jul 19, 2026, 9:00 AM"]
  },
  {
    value: "Monday",
    cron: 1,
    runs: ["Mon, Jun 22, 2026, 9:00 AM", "Mon, Jun 29, 2026, 9:00 AM", "Mon, Jul 6, 2026, 9:00 AM", "Mon, Jul 13, 2026, 9:00 AM", "Mon, Jul 20, 2026, 9:00 AM"]
  },
  {
    value: "Tuesday",
    cron: 2,
    runs: ["Tue, Jun 23, 2026, 9:00 AM", "Tue, Jun 30, 2026, 9:00 AM", "Tue, Jul 7, 2026, 9:00 AM", "Tue, Jul 14, 2026, 9:00 AM", "Tue, Jul 21, 2026, 9:00 AM"]
  },
  {
    value: "Wednesday",
    cron: 3,
    runs: ["Wed, Jun 24, 2026, 9:00 AM", "Wed, Jul 1, 2026, 9:00 AM", "Wed, Jul 8, 2026, 9:00 AM", "Wed, Jul 15, 2026, 9:00 AM", "Wed, Jul 22, 2026, 9:00 AM"]
  },
  {
    value: "Thursday",
    cron: 4,
    runs: ["Thu, Jun 25, 2026, 9:00 AM", "Thu, Jul 2, 2026, 9:00 AM", "Thu, Jul 9, 2026, 9:00 AM", "Thu, Jul 16, 2026, 9:00 AM", "Thu, Jul 23, 2026, 9:00 AM"]
  },
  {
    value: "Friday",
    cron: 5,
    runs: ["Fri, Jun 26, 2026, 9:00 AM", "Fri, Jul 3, 2026, 9:00 AM", "Fri, Jul 10, 2026, 9:00 AM", "Fri, Jul 17, 2026, 9:00 AM", "Fri, Jul 24, 2026, 9:00 AM"]
  },
  {
    value: "Saturday",
    cron: 6,
    runs: ["Sat, Jun 20, 2026, 9:00 AM", "Sat, Jun 27, 2026, 9:00 AM", "Sat, Jul 4, 2026, 9:00 AM", "Sat, Jul 11, 2026, 9:00 AM", "Sat, Jul 18, 2026, 9:00 AM"]
  }
];

const deploymentScheduleRunDates: Record<Exclude<DeploymentFrequency, "Custom cron">, string[]> = {
  "Every minute": [
    "Fri, Jun 19, 2026, 11:02 PM",
    "Fri, Jun 19, 2026, 11:03 PM",
    "Fri, Jun 19, 2026, 11:04 PM",
    "Fri, Jun 19, 2026, 11:05 PM",
    "Fri, Jun 19, 2026, 11:06 PM"
  ],
  "Every hour": [
    "Sat, Jun 20, 2026, 12:00 AM",
    "Sat, Jun 20, 2026, 1:00 AM",
    "Sat, Jun 20, 2026, 2:00 AM",
    "Sat, Jun 20, 2026, 3:00 AM",
    "Sat, Jun 20, 2026, 4:00 AM"
  ],
  Daily: [
    "Sat, Jun 20, 2026, 9:00 AM",
    "Sun, Jun 21, 2026, 9:00 AM",
    "Mon, Jun 22, 2026, 9:00 AM",
    "Tue, Jun 23, 2026, 9:00 AM",
    "Wed, Jun 24, 2026, 9:00 AM"
  ],
  Weekdays: [
    "Mon, Jun 22, 2026, 9:00 AM",
    "Tue, Jun 23, 2026, 9:00 AM",
    "Wed, Jun 24, 2026, 9:00 AM",
    "Thu, Jun 25, 2026, 9:00 AM",
    "Fri, Jun 26, 2026, 9:00 AM"
  ],
  Weekly: deploymentWeekdayOptions[1].runs
};

const deploymentDailyOneAmRuns = [
  "Sat, Jun 20, 2026, 1:00 AM",
  "Sun, Jun 21, 2026, 1:00 AM",
  "Mon, Jun 22, 2026, 1:00 AM",
  "Tue, Jun 23, 2026, 1:00 AM",
  "Wed, Jun 24, 2026, 1:00 AM"
];

function parseScheduleTime(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2] === undefined ? 0 : Number(match[2]);
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function getScheduleHour24(hour: number, meridiem: ScheduleMeridiem) {
  if (meridiem === "AM") return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
}

function formatScheduleTimeForRuns(value: string, meridiem: ScheduleMeridiem) {
  const parsed = parseScheduleTime(value);
  if (!parsed) return `${value || "9:00"} ${meridiem}`;
  return `${parsed.hour}:${String(parsed.minute).padStart(2, "0")} ${meridiem}`;
}

function getScheduleExpressionForFrequency(frequency: DeploymentFrequency, time: string, meridiem: ScheduleMeridiem, weekday: ScheduleWeekday) {
  if (frequency === "Every minute") return "* * * * *";
  if (frequency === "Every hour") return "0 * * * *";
  if (frequency === "Custom cron") return null;
  const parsed = parseScheduleTime(time);
  if (!parsed) return null;
  const hour24 = getScheduleHour24(parsed.hour, meridiem);
  if (frequency === "Daily") return `${parsed.minute} ${hour24} * * *`;
  if (frequency === "Weekly") {
    const selectedWeekday = deploymentWeekdayOptions.find((option) => option.value === weekday) ?? deploymentWeekdayOptions[1];
    return `${parsed.minute} ${hour24} * * ${selectedWeekday.cron}`;
  }
  return `${parsed.minute} ${hour24} * * 1-5`;
}

function getDeploymentScheduleRuns(frequency: DeploymentFrequency, time: string, meridiem: ScheduleMeridiem, weekday: ScheduleWeekday, expression: string) {
  const selectedWeekday = deploymentWeekdayOptions.find((option) => option.value === weekday) ?? deploymentWeekdayOptions[1];
  if (frequency === "Custom cron" && expression === "0 1 * * *") return deploymentDailyOneAmRuns;
  const runs = frequency === "Custom cron" ? deploymentScheduleRunDates.Weekdays : frequency === "Weekly" ? selectedWeekday.runs : deploymentScheduleRunDates[frequency];
  if (frequency === "Every minute" || frequency === "Every hour") return runs;
  const displayTime = formatScheduleTimeForRuns(time, meridiem);
  return runs.map((run) => run.replace(/\d{1,2}:\d{2} [AP]M$/, displayTime));
}

function getDeploymentInitialFrequency(expression: string): DeploymentFrequency {
  if (expression === "* * * * *") return "Every minute";
  if (expression === "0 * * * *") return "Every hour";
  if (expression === "0 9 * * 1-5") return "Weekdays";
  return "Custom cron";
}

type DeploymentTimezoneOption = {
  value: string;
  label: string;
  offsetMinutes: number;
};

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

const deploymentTimezoneReferenceDate = new Date("2026-06-19T15:00:00Z");
const fallbackDeploymentTimezones = [
  "Pacific/Midway",
  "Pacific/Niue",
  "Pacific/Pago_Pago",
  "Pacific/Honolulu",
  "Pacific/Rarotonga",
  "Pacific/Tahiti",
  "Pacific/Marquesas",
  "America/Adak",
  "Pacific/Gambier",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "America/Los_Angeles",
  "America/New_York"
];

function getDeploymentTimezoneNames() {
  const maybeIntl = Intl as IntlWithSupportedValues;
  const supported = maybeIntl.supportedValuesOf ? maybeIntl.supportedValuesOf("timeZone") : [];
  return Array.from(new Set([...fallbackDeploymentTimezones, ...supported]));
}

function getDeploymentTimezoneOffsetMinutes(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).formatToParts(deploymentTimezoneReferenceDate);
    const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const localTime = Date.UTC(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      Number(lookup.hour),
      Number(lookup.minute),
      Number(lookup.second)
    );
    return Math.round((localTime - deploymentTimezoneReferenceDate.getTime()) / 60000);
  } catch {
    return 0;
  }
}

function formatDeploymentTimezoneOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `GMT${sign}${hours}:${minutes}`;
}

const deploymentTimezoneOptions: DeploymentTimezoneOption[] = getDeploymentTimezoneNames()
  .map((timezone) => {
    const offsetMinutes = getDeploymentTimezoneOffsetMinutes(timezone);
    return {
      value: timezone,
      label: `(${formatDeploymentTimezoneOffset(offsetMinutes)}) ${timezone.replaceAll("_", " ")}`,
      offsetMinutes
    };
  })
  .sort((left, right) => left.offsetMinutes - right.offsetMinutes || left.value.localeCompare(right.value));

function DeploymentFrequencyPicker({ value, onValueChange }: { value: DeploymentFrequency; onValueChange: (value: DeploymentFrequency) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-8 rounded-[8px] bg-white/50">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label="Select schedule frequency"
        className="flex h-8 w-[calc(100%-8px)] items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          data-side="top"
          data-align="start"
          className="absolute bottom-[38px] left-0 z-50 w-[213.5px] rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {deploymentFrequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-8 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm leading-5 text-ink outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.value}</span>
                {value === option.value ? <Check className="h-4 w-4 shrink-0 text-muted" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentTimeField({
  value,
  meridiem,
  onValueChange,
  onMeridiemChange
}: {
  value: string;
  meridiem: ScheduleMeridiem;
  onValueChange: (value: string) => void;
  onMeridiemChange: (meridiem: ScheduleMeridiem) => void;
}) {
  return (
    <div data-cds="Field" className="flex min-w-0 flex-col gap-2">
      <label className="text-sm leading-none [font-weight:550]">At</label>
      <div className="flex h-8 items-center gap-2">
        <input
          data-cds="TextInput"
          className="cds-focus h-8 w-[110px] rounded-[8px] border-0 bg-white/50 px-3 text-sm font-normal leading-5 text-ink"
          placeholder="9:00"
          value={value}
          aria-label="Time"
          onChange={(event) => onValueChange(event.target.value)}
        />
        <div
          data-cds="SegmentedControl"
          role="radiogroup"
          aria-label="AM or PM"
          className="relative inline-flex h-8 w-fit shrink-0 items-stretch rounded-[8px] bg-black/[0.05] p-px text-sm"
        >
          <div className={`absolute bottom-px top-px w-[47px] rounded-[7px] bg-white shadow-sm ${meridiem === "AM" ? "left-px" : "left-[48px]"}`} aria-hidden />
          <button
            type="button"
            role="radio"
            aria-checked={meridiem === "AM"}
            className={`relative z-10 h-[30px] px-3 ${meridiem === "AM" ? "text-ink" : "text-muted"}`}
            onClick={() => onMeridiemChange("AM")}
          >
            AM
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={meridiem === "PM"}
            className={`relative z-10 h-[30px] px-3 ${meridiem === "PM" ? "text-ink" : "text-muted"}`}
            onClick={() => onMeridiemChange("PM")}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}

function DeploymentDayPicker({ value, onValueChange }: { value: ScheduleWeekday; onValueChange: (value: ScheduleWeekday) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-8 rounded-[8px] bg-white/50">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label="Select weekly day"
        className="flex h-8 w-[calc(100%-8px)] items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          data-side="top"
          data-align="start"
          className="absolute bottom-[38px] left-0 z-50 h-[232px] w-[213.5px] rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div role="listbox" className="grid gap-0">
            {deploymentWeekdayOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex h-8 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm leading-5 text-ink outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.value}</span>
                {value === option.value ? <Check className="h-4 w-4 shrink-0 text-muted" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentDayField({ value, onValueChange }: { value: ScheduleWeekday; onValueChange: (value: ScheduleWeekday) => void }) {
  return (
    <div data-cds="Field" className="flex min-w-0 flex-col gap-2">
      <label className="text-sm leading-none [font-weight:550]">On</label>
      <DeploymentDayPicker value={value} onValueChange={onValueChange} />
    </div>
  );
}

function DeploymentTimezonePicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = deploymentTimezoneOptions.find((option) => option.value === value) ?? deploymentTimezoneOptions.find((option) => option.value === "Asia/Shanghai");
  const filteredOptions = deploymentTimezoneOptions.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="relative h-8 rounded-[8px] bg-white/50">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label="Select timezone"
        className="flex h-8 w-[calc(100%-8px)] items-center justify-between rounded-[8px] bg-transparent px-2 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          data-side="top"
          data-align="start"
          className="absolute bottom-[38px] left-0 z-50 h-[320px] w-[213.5px] rounded-[12px] bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit]">
            <input
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-label="Filter timezones"
              className="-mx-1 -mt-1 mb-1 block h-[37px] w-[calc(100%+8px)] shrink-0 border-0 border-b border-black/10 bg-transparent px-3 text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden outline-none">
              <div role="listbox" className="grid w-full min-w-0 gap-1 outline-none">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    className="flex h-8 w-full min-w-0 items-center justify-between rounded-[8px] px-3 text-left text-sm leading-5 text-ink outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {value === option.value ? <Check className="h-4 w-4 shrink-0 text-muted" /> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeploymentTimezoneField({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return (
    <div data-cds="Field" className="flex min-w-0 flex-col gap-2">
      <label className="text-sm leading-none [font-weight:550]">Timezone</label>
      <DeploymentTimezonePicker value={value} onValueChange={onValueChange} />
    </div>
  );
}

function DeploymentScheduleFields({
  expression,
  onExpressionChange,
  timezone,
  onTimezoneChange
}: {
  expression: string;
  onExpressionChange: (expression: string) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}) {
  const [frequency, setFrequency] = useState<DeploymentFrequency>(() => getDeploymentInitialFrequency(expression));
  const [scheduleTime, setScheduleTime] = useState("9:00");
  const [meridiem, setMeridiem] = useState<ScheduleMeridiem>("AM");
  const [weekday, setWeekday] = useState<ScheduleWeekday>("Monday");
  const customCron = frequency === "Custom cron";
  const nextRuns = getDeploymentScheduleRuns(frequency, scheduleTime, meridiem, weekday, expression);

  function syncExpression(nextFrequency: DeploymentFrequency, nextTime: string, nextMeridiem: ScheduleMeridiem, nextWeekday: ScheduleWeekday) {
    const nextExpression = getScheduleExpressionForFrequency(nextFrequency, nextTime, nextMeridiem, nextWeekday);
    if (nextExpression) onExpressionChange(nextExpression);
  }

  function selectFrequency(nextFrequency: DeploymentFrequency) {
    setFrequency(nextFrequency);
    syncExpression(nextFrequency, scheduleTime, meridiem, weekday);
  }

  function changeTime(nextTime: string) {
    setScheduleTime(nextTime);
    syncExpression(frequency, nextTime, meridiem, weekday);
  }

  function changeMeridiem(nextMeridiem: ScheduleMeridiem) {
    setMeridiem(nextMeridiem);
    syncExpression(frequency, scheduleTime, nextMeridiem, weekday);
  }

  function changeWeekday(nextWeekday: ScheduleWeekday) {
    setWeekday(nextWeekday);
    syncExpression(frequency, scheduleTime, meridiem, nextWeekday);
  }

  return (
    <div className="flex flex-col gap-4 rounded-[12px] border-[0.5px] border-black/10 p-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div data-cds="Field" className="flex min-w-0 flex-col gap-2">
            <label className="text-sm leading-none [font-weight:550]">Frequency</label>
            <DeploymentFrequencyPicker value={frequency} onValueChange={selectFrequency} />
          </div>
          {frequency === "Weekly" ? <DeploymentDayField value={weekday} onValueChange={changeWeekday} /> : <DeploymentTimezoneField value={timezone} onValueChange={onTimezoneChange} />}
          {frequency === "Daily" || frequency === "Weekdays" ? (
            <>
              <DeploymentTimeField value={scheduleTime} meridiem={meridiem} onValueChange={changeTime} onMeridiemChange={changeMeridiem} />
              <div className="h-[54px]" aria-hidden />
            </>
          ) : null}
          {frequency === "Weekly" ? (
            <>
              <DeploymentTimeField value={scheduleTime} meridiem={meridiem} onValueChange={changeTime} onMeridiemChange={changeMeridiem} />
              <DeploymentTimezoneField value={timezone} onValueChange={onTimezoneChange} />
            </>
          ) : null}
        </div>
        {customCron ? (
          <label className="grid gap-2 text-sm leading-none [font-weight:550]">
            Cron expression
            <input
              data-cds="TextInput"
              className="cds-focus h-8 rounded-[8px] border-0 bg-white/50 px-2 font-mono text-sm font-normal leading-5 text-ink"
              placeholder={expression}
              value={expression}
              onChange={(event) => onExpressionChange(event.target.value)}
            />
            <span className="text-[13px] font-normal leading-[18px] text-muted">minute · hour · day · month · weekday — * any, */5 every 5th, 1-5 range</span>
          </label>
        ) : (
          <div className="flex h-9 items-center justify-between rounded-[8px] bg-canvas px-3 py-2">
            <span className="font-mono text-sm leading-5 text-ink">{expression}</span>
            <button
              type="button"
              data-cds="TextLink"
              className="rounded-[2px] text-sm leading-5 text-[#184f95] underline decoration-current/40 underline-offset-[3px] hover:decoration-current"
              onClick={() => setFrequency("Custom cron")}
            >
              Edit cron
            </button>
          </div>
        )}
      </div>
      <div className="rounded-[12px] border-[0.5px] border-black/10 bg-canvas p-4">
        <div className="mb-1.5 flex items-center gap-2 text-sm [font-weight:550]">
          Next 5 runs
          <button type="button" aria-label="About next runs" className="grid h-3 w-3 place-items-center text-muted hover:text-ink">
            <Info className="h-3 w-3" />
          </button>
        </div>
        <div className="flex flex-col gap-1 text-sm text-[#4e4a45]">
          {nextRuns.map((run) => (
            <div key={run} className="flex h-5 items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-muted" />
              {run}
            </div>
          ))}
        </div>
      </div>
    </div>
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
  const [draggingUpload, setDraggingUpload] = useState(false);
  const canContinue = selectedName.trim().length > 0;

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingUpload(false);

    const droppedName = getSkillUploadDropName(event);
    if (droppedName) {
      setSelectedName(droppedName);
    }
  }

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
      overlayClassName="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
      contentClassName="min-h-[265px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-3">
        <div className="flex flex-col">
          <div
            className={`flex h-[112px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-transparent px-4 py-6 transition-colors ${draggingUpload ? "border-[#b7b2aa] bg-[#fbfaf7]" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDraggingUpload(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setDraggingUpload(true);
            }}
            onDragLeave={() => setDraggingUpload(false)}
            onDrop={handleDrop}
          >
            <div>
              <p className="text-sm text-[#898781]">Drag and drop a .zip, .skill file, or directory to upload</p>
              {selectedName ? <p className="mt-3 font-mono text-sm text-ink">{selectedName}</p> : null}
            </div>
          </div>
          <p className="pt-2 text-xs leading-4 text-[#898781]">
            Total file size limit: 8MB.{" "}
            <a className="underline" href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener noreferrer">
              File format
            </a>{" "}
            ·{" "}
            <a className="underline" href="https://github.com/anthropics/skills" target="_blank" rel="noopener noreferrer">
              download an example
            </a>
            .
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="h-[31px] w-[84px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canContinue}>Continue</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

type SkillUploadEntry = {
  isDirectory?: boolean;
  name?: string;
};

type SkillUploadItem = DataTransferItem & {
  webkitGetAsEntry?: () => SkillUploadEntry | null;
};

function getSkillUploadDropName(event: DragEvent<HTMLDivElement>) {
  const item = event.dataTransfer.items?.[0] as SkillUploadItem | undefined;
  const entry = item?.webkitGetAsEntry?.();
  if (entry?.isDirectory && entry.name) {
    return entry.name;
  }

  const file = event.dataTransfer.files?.[0] as (File & { webkitRelativePath?: string }) | undefined;
  if (!file) return "";

  const relativeRoot = file.webkitRelativePath?.split("/").filter(Boolean)[0];
  return relativeRoot || file.name;
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          data-cds="Dialog"
          className="fixed left-1/2 top-1/2 z-50 flex h-[396px] w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[12px] bg-white p-6 text-sm text-ink shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <div className="mb-4 flex min-h-0 items-start gap-2">
            <div className="-mt-1 flex min-w-0 flex-1 flex-col gap-1">
              <Dialog.Title className="truncate text-[22px] leading-[26px] text-ink [font-weight:580]">{skill?.name ?? "Skill"}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="icon" className="-mr-2 -mt-2 h-8 w-8 rounded-[8px] px-0" aria-label="Close">
                <span className="text-lg leading-none">×</span>
              </Button>
            </Dialog.Close>
          </div>
          {skill ? (
            <>
              <div className="mb-6 flex h-5 items-center gap-2 text-sm text-[#898781]">
                <span>{skill.owner}</span>
                <span>•</span>
                <span>{skill.createdLabel}</span>
              </div>
              <section>
                <h3 className="mb-3 text-[15px] leading-5 [font-weight:550]">Version history</h3>
                <div className="divide-y divide-line border-y border-line">
                  {(skill.versions ?? []).map((version) => (
                    <div key={version.id} className="flex min-h-[47px] items-center justify-between px-3 py-3 text-sm hover:bg-fill">
                      <div className="flex flex-1 items-center gap-3">
                        <span
                          role="button"
                          tabIndex={0}
                          className="relative cursor-pointer"
                          aria-label={`Copy ${version.version}`}
                          onClick={() => copyText(version.version)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") copyText(version.version);
                          }}
                        >
                          <span data-cds="Badge" className="inline-flex h-[22px] items-center rounded-[5.5px] bg-fill px-2 align-bottom font-mono text-xs leading-[15px] text-[#52514e] [font-weight:550]">{version.version}</span>
                        </span>
                        <span className="text-[#898781]">{version.releasedAt}</span>
                        {version.latest ? <span data-cds="Badge" className="inline-flex h-[22px] items-center rounded-[5.5px] bg-[#cde2fb] px-2 text-xs leading-[15px] text-[#184f95] [font-weight:550]">Latest</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <EmptyState compact title="Loading version history" description="" />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
  if (status === "Archived") return "neutral";
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

function deploymentTriggerLabel(deployment: Deployment) {
  if (deployment.trigger !== "Schedule") return deployment.trigger;
  if (deployment.schedule === "0 1 * * *") return "Daily at 1:00 AM GMT+8";
  if (deployment.schedule === "0 9 * * 1-5") return "Weekdays at 9:00 AM GMT+8";
  return deployment.schedule || "Schedule";
}

function firstDeploymentBinding(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] ?? "";
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

function EnvironmentActions({ environment, onArchive, onDelete }: { environment: Environment; onArchive: () => void; onDelete: () => void }) {
  const archived = environment.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="ml-1" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[128px] max-w-[320px] rounded-cds bg-white p-1 text-sm text-ink shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
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

function EnvironmentConfirmationDialog({
  action,
  environment,
  open,
  onOpenChange,
  onConfirm
}: {
  action: "archive" | "delete";
  environment: Environment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const isDelete = action === "delete";
  const title = isDelete ? "Delete profile" : "Archive profile";
  const confirmLabel = isDelete ? "Delete" : "Archive";
  const description = isDelete
    ? `Are you sure you want to delete "${environment?.name ?? "this profile"}"? This action cannot be undone.`
    : `Are you sure you want to archive "${environment?.name ?? "this profile"}"? Archived profiles can no longer be used to create new sessions.`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-8 w-[70px] rounded-[8px] border-0 bg-[#f1f0ec] px-0 text-sm [font-weight:550] hover:bg-[#e8e6df]">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              className={`h-8 rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a] ${isDelete ? "w-[67px]" : "w-[75px]"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VaultRowActions({ vault, onArchive, onDelete }: { vault: Vault; onArchive: () => void; onDelete: () => void }) {
  const archived = vault.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[128px] max-w-[320px] rounded-cds bg-white p-1 text-sm text-ink shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
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

function VaultConfirmationDialog({
  action,
  vault,
  open,
  onOpenChange,
  onConfirm
}: {
  action: "archive" | "delete";
  vault: Vault | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const isDelete = action === "delete";
  const title = isDelete ? "Delete vault" : "Archive vault";
  const confirmLabel = isDelete ? "Delete" : "Archive";
  const description = isDelete
    ? `Are you sure you want to delete "${vault?.name ?? "this vault"}"? This will also delete all credentials in this vault. This action cannot be undone.`
    : `Are you sure you want to archive "${vault?.name ?? "this vault"}"? Any active sessions using this vault will lose their credentials, and it can no longer be used to create new sessions.`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-8 w-[70px] rounded-[8px] border-0 bg-[#f1f0ec] px-0 text-sm [font-weight:550] hover:bg-[#e8e6df]">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              className={`h-8 rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a] ${isDelete ? "w-[67px]" : "w-[75px]"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
  const archived = store.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[145px] max-w-[320px] rounded-cds bg-white p-1 text-sm text-ink shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive store"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-[#a33a29] outline-none data-[highlighted]:bg-[#fff1ef]"
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

function MemoryStoreConfirmationDialog({
  action,
  open,
  onOpenChange,
  onConfirm
}: {
  action: "archive" | "delete";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const isDelete = action === "delete";
  const title = isDelete ? "Delete memory store" : "Archive memory store";
  const confirmLabel = isDelete ? "Delete" : "Archive";
  const description = isDelete
    ? "This will permanently delete the memory store and all memories inside it. This can’t be undone."
    : "This memory store will be hidden from the default view. Sessions that reference it keep working.";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-8 w-[70px] rounded-[8px] border-0 bg-[#f1f0ec] px-0 text-sm [font-weight:550] hover:bg-[#e8e6df]">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              className={`h-8 rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a] ${isDelete ? "w-[67px]" : "w-[75px]"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MemoryRecordActions({ record, onDelete }: { record: MemoryRecord; onDelete: () => void }) {
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="!h-7 !w-7 !gap-1.5 text-sm !leading-5 [font-weight:550]" aria-label="More actions">
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

function SessionArchiveDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">Archive session</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">
            This session won't accept new events and will be hidden. This can't be undone.
          </Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-8 w-[70px] rounded-[8px] border-0 bg-[#f1f0ec] px-0 text-sm [font-weight:550] hover:bg-[#e8e6df]">
                Cancel
              </Button>
            </Dialog.Close>
            <Button className="h-8 w-[75px] rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a]" onClick={onConfirm}>
              Archive
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SessionRowActions({ session, onArchive }: { session: Session; onArchive: () => void }) {
  const archived = session.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[160px] max-w-[320px] rounded-cds bg-white p-1 text-sm text-ink shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive session"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function DeploymentArchiveDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">Archive deployment?</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">
            Archived deployments stop firing scheduled runs. Run history is kept.
          </Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" className="h-8 w-[70px] rounded-[8px] border-0 bg-[#f1f0ec] px-0 text-sm [font-weight:550] hover:bg-[#e8e6df]">
                Cancel
              </Button>
            </Dialog.Close>
            <Button className="h-8 w-[75px] rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a]" onClick={onConfirm}>
              Archive
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeploymentActions({
  deployment,
  onPause,
  onResume,
  onEdit,
  onArchive
}: {
  deployment: Deployment;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const paused = deployment.status === "Paused";
  const archived = deployment.status === "Archived";
  const itemClass = "flex h-8 w-[120px] cursor-pointer items-center gap-2 rounded-[7px] px-2.5 text-sm outline-none data-[highlighted]:bg-fill disabled:pointer-events-none disabled:opacity-50";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="ml-1" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 w-[128px] rounded-[12px] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]" align="end" sideOffset={6}>
          {paused ? (
            <CdsDropdownMenu.Item className={itemClass} onSelect={onResume} disabled={archived}>
              <Play className="h-5 w-5 text-muted" />
              Resume
            </CdsDropdownMenu.Item>
          ) : (
            <CdsDropdownMenu.Item className={itemClass} onSelect={onPause} disabled={archived}>
              <Pause className="h-5 w-5 text-muted" />
              Pause
            </CdsDropdownMenu.Item>
          )}
          <CdsDropdownMenu.Item className={itemClass} onSelect={onEdit} disabled={archived}>
            <Pencil className="h-5 w-5 text-muted" />
            Edit
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={itemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-5 w-5 text-muted" />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function SessionDetailActions({
  session,
  onSendInterrupt,
  onSendEvent,
  onArchive
}: {
  session: Session;
  onSendInterrupt: () => void;
  onSendEvent: () => void;
  onArchive: () => void;
}) {
  const archived = session.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="secondary" className="w-[96px]">
          Actions
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[160px] max-w-[320px] rounded-cds bg-white p-1 text-sm text-ink shadow-lg" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={onSendInterrupt}
          >
            <Pause className="h-4 w-4 text-muted" />
            Send interrupt
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-fill"
            onSelect={onSendEvent}
          >
            <Terminal className="h-4 w-4 text-muted" />
            Send event…
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive session"}
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

function AgentArchiveDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-cds="ConfirmationDialog"
          role="alertdialog"
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_16px_48px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.1)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[17px] leading-[26px] text-ink [font-weight:620]">Archive agent</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#696762]">
            This agent will be hidden from the default view. Sessions that reference it keep working.
          </Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-[70px] rounded-[8px] bg-transparent px-0 text-sm [font-weight:550] hover:bg-fill">
                Cancel
              </Button>
            </Dialog.Close>
            <Button className="h-8 w-[75px] rounded-[8px] bg-[#b33f31] px-0 text-sm text-white [font-weight:550] hover:bg-[#a5362a]" onClick={onConfirm}>
              Archive
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AgentRowActions({ agent, onArchive }: { agent: Agent; onArchive: () => void }) {
  const archived = agent.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <span className="text-lg leading-none">⋯</span>
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className="z-50 min-w-[148px] max-w-[320px] rounded-[12px] bg-white p-1 text-sm text-ink shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]" align="end">
          <CdsDropdownMenu.Item
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill"
            onSelect={onArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4 text-muted" />
            {archived ? "Archived" : "Archive agent"}
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

function DetailSection({ title, children, headingClassName = "font-semibold" }: { title: string; children: React.ReactNode; headingClassName?: string }) {
  return (
    <section>
      <h2 className={`mb-1.5 text-sm leading-5 ${headingClassName}`}>{title}</h2>
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

function agentSessionCreatedLabel(session: Session) {
  const created = new Date(session.createdAt);
  if (Number.isNaN(created.getTime())) return session.createdLabel;
  return created.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
system: ${agent?.systemPrompt ?? "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end."}
mcp_servers: []
tools:
  - type: agent_toolset_20260401
skills: []`;
}

function agentTemplateYaml(template: (typeof agentStartingTemplates)[number]) {
  return `name: ${template.name === "Blank agent" ? "Untitled agent" : template.name}
description: ${template.description}
model: claude-sonnet-4-6
system: ${template.system}
mcp_servers: []
tools:
  - type: agent_toolset_20260401
skills: []`;
}

function agentDescriptionYaml(description: string) {
  const name = agentNameFromDescription(description);
  const sentence = /[.!?]$/.test(description) ? description : `${description}.`;
  const system = `You are an autonomous agent created for this task: ${sentence} Plan the work, use connected tools carefully, and finish with a concise result.`;

  return `name: ${yamlScalar(name)}
description: ${yamlScalar(description)}
model: claude-sonnet-4-6
system: ${yamlScalar(system)}
mcp_servers: []
tools:
  - type: agent_toolset_20260401
skills: []`;
}

function normalizeAgentDescription(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function agentNameFromDescription(description: string) {
  const cleaned = description
    .replace(/[`"'()[\]{}]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean).slice(0, 5);
  while (words.length > 1 && /^(and|or|to|for|with|from|by|in|on|at|the|a|an)$/i.test(words[words.length - 1])) {
    words.pop();
  }
  if (words.length === 0) return "Generated agent";
  return words
    .map((word) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function yamlScalar(value: string) {
  return JSON.stringify(value);
}

function agentConfigFromYaml(source: string) {
  const modelId = yamlValue(source, "id", yamlValue(source, "model", "claude-sonnet-4-6"));
  return {
    name: yamlValue(source, "name", "Untitled agent"),
    description: yamlValue(source, "description", "A blank starting point with the core toolset."),
    model: {
      id: modelId,
      speed: "standard"
    },
    system: yamlValue(source, "system", "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end."),
    mcp_servers: [],
    tools: [
      {
        type: "agent_toolset_20260401",
        default_config: {
          enabled: true,
          permission_policy: {
            type: "always_allow"
          }
        },
        configs: []
      }
    ],
    skills: [],
    metadata: {}
  };
}

function yamlValue(source: string, key: string, fallback: string) {
  const line = source.split("\n").find((item) => item.trim().startsWith(`${key}:`));
  if (!line) return fallback;
  const value = line.trim().slice(key.length + 1).trim();
  if (!value) return fallback;
  if (value.startsWith("\"") && value.endsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
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
