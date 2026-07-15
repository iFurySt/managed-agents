import {
  Boxes,
  Check,
  ChevronDown,
  Copy,
  CircleDollarSign,
  Database,
  Download,
  FileText,
  FolderPlus,
  Gauge,
  Home,
  MessageSquare,
  Pause,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Terminal,
  Trash2,
  Wrench
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ChangeEventHandler, type ComponentProps, type DragEvent, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  archiveSession,
  archiveAgent,
  archiveDeployment,
  createAgent,
  createDeployment,
  createEnvironment,
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
import { Badge, Button, CdsDropdownMenu, CdsTabs, ConsoleDialog, CopyableIdText, CopyIconButton, CopyIdButton, DataTable, FieldSelect, showToast, SidebarItem, TextInput, ToastViewport } from "./components/cds";
import type { Agent, CollectionName, Deployment, Environment, MemoryRecord, MemoryStore, Resource, Session, SessionEvent, SkillPackage, SkillVersion, UpdateDeploymentInput, Vault, VaultCredential, WorkspaceFile } from "./types";

const managedRoutes: { path: CollectionName; title: string; description: string; action: string }[] = [];
const sidebarCollapsedStorageKey = "managed-agents.sidebar.collapsed";
const bannerDismissedStorageKey = "managed-agents.banner.dismissed";
const defaultDeploymentEnvironmentId = "env_01UTaKkbFknSkQNEsZjUARMh";
const deploymentAgentOptions = [
  { value: "agent_011VCSqwTBQSr7SqT2Mwmus2", name: "Untitled agent", updated: "5 days ago" },
  { value: "agent_013mi1SmR2hJ6Hk6wNTeJvF9", name: "Managed SSH Reverse Tunnel Bootstrapper", updated: "Jun 16" },
  { value: "agent_01AVRPTGyYareCeoUasn66q5", name: "Incident commander", updated: "Jun 16" },
  { value: "agent_019BdsR2v3NW1DiEG62wpu3e", name: "World Cup Daily Digest (self-hosted clone)", updated: "Jun 16" },
  { value: "agent_017k8CPYuCFRD9AmupUeXd2Z", name: "World Cup Daily Digest", updated: "Jun 16" },
  { value: "agent_01MNpVPKyrSECHGA6HqAmREZ", name: "Untitled agent", updated: "Jun 16" }
];
const sessionAgentOptions = [
  { value: "agent_011VCSqwTBQSr7SqT2Mwmus2", name: "Untitled agent", updated: "5 days ago" },
  { value: "agent_013mi1SmR2hJ6Hk6wNTeJvF9", name: "Managed SSH Reverse Tunnel Bootstrapper", updated: "5 days ago" },
  { value: "agent_01AVRPTGyYareCeoUasn66q5", name: "Incident commander", updated: "5 days ago" },
  { value: "agent_019BdsR2v3NW1DiEG62wpu3e", name: "World Cup Daily Digest (self-hosted clone)", updated: "5 days ago" },
  { value: "agent_017k8CPYuCFRD9AmupUeXd2Z", name: "World Cup Daily Digest", updated: "5 days ago" },
  { value: "agent_01MNpVPKyrSECHGA6HqAmREZ", name: "Untitled agent", updated: "5 days ago" }
];
const sessionEnvironmentOptions = [
  { value: "env_01UTaKkbFknSkQNEsZjUARMh", name: "managed-ssh-debug-env", updated: "5 days ago", type: "Cloud" },
  { value: "env_01LiiuDCwZBtqZd5EYMk9D9x", name: "123", updated: "5 days ago", type: "Self-hosted" },
  { value: "env_01AzQWp3SXQEATgdCFUNwteR", name: "myenv", updated: "5 days ago", type: "Self-hosted" },
  { value: "env_01UNo9NMB1ZQLKCZk21qryb8", name: "world-cup-digest-env", updated: "5 days ago", type: "Cloud" }
];
const defaultSessionAgentId = sessionAgentOptions.find((option) => option.name === "World Cup Daily Digest")?.value ?? sessionAgentOptions[0]?.value ?? "";
const defaultSessionEnvironmentId = sessionEnvironmentOptions.find((option) => option.name === "world-cup-digest-env")?.value ?? sessionEnvironmentOptions[0]?.value ?? "";
const defaultSessionVaultId = "test_secret";
const createSessionSelectShellClass = "flex h-8 w-full min-w-0 items-center rounded-[8px] bg-white/50 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]";
const createSessionSelectTriggerClass = "cds-focus inline-flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-none border-0 bg-transparent pl-2 pr-0 text-left text-sm leading-5 text-ink outline-none";
const createSessionSearchInputClass = "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-5 text-ink caret-ink outline-none placeholder:text-[#898781] focus:outline-none";
const sessionResourceKinds = ["GitHub Repository", "File", "Memory Store"] as const;
type SessionResourceKind = (typeof sessionResourceKinds)[number];
const builtInToolPermissions = [
  { name: "bash", description: "Execute bash commands" },
  { name: "read", description: "Read files" },
  { name: "write", description: "Write files" },
  { name: "edit", description: "String replacement in files" },
  { name: "glob", description: "File pattern matching" },
  { name: "grep", description: "Text search with regex" },
  { name: "web_fetch", description: "Fetch URL content" },
  { name: "web_search", description: "Search the web" }
];
const cdsMenuContentClass =
  "z-50 max-w-[320px] rounded-[12px] bg-white p-1 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]";
const cdsMenuItemClass =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-fill";
const cdsMenuDangerItemClass = `${cdsMenuItemClass} text-[#8e2626] data-[highlighted]:bg-[#fff1ef]`;
const cdsMenuSeparatorClass = "my-1 h-px bg-line";
const topFilterShellClassName =
  "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-white/50 pl-0 pr-2 text-sm leading-5 text-ink shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]";
const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  workbench: "Workbench",
  batches: "Batches",
  "agent-quickstart": "Quickstart",
  agents: "Agents",
  sessions: "Sessions",
  deployments: "Deployments",
  environments: "Environments",
  vaults: "Credential vaults",
  "memory-stores": "Memory stores",
  files: "Files",
  skills: "Skills"
};

function getDocumentTitle(pathname: string) {
  const [segment] = pathname.split("/").filter(Boolean);
  const pageTitle = segment ? pageTitles[segment] : null;
  const title = pageTitle || "Claude Platform";
  return title === "Claude Platform" ? title : `${title} | Claude Platform`;
}

function formatVersionCreatedLabel(createdAt: string) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "Created";
  return `Created ${created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function App() {
  const location = useLocation();
  const bannerRoute = false;
  const [bannerVisible, setBannerVisible] = useState(() => {
    try {
      return window.localStorage.getItem(bannerDismissedStorageKey) !== "true";
    } catch {
      return true;
    }
  });
  const showBanner = bannerRoute && bannerVisible;
  const fullWidthRoute = location.pathname.startsWith("/memory-stores/");
  const contentShellClass = fullWidthRoute
    ? "w-full max-w-none px-1 pb-8 pt-3"
    : `w-full max-w-none overflow-hidden px-8 pb-8 ${showBanner ? "pt-3" : "pt-6"}`;
  const routeShellClass = fullWidthRoute ? `px-7 ${showBanner ? "pt-6" : "pt-3"}` : showBanner ? "pt-6" : "";

  useEffect(() => {
    document.title = getDocumentTitle(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ToastViewport />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className={contentShellClass}>
            {showBanner ? <Banner onDismiss={() => setBannerVisible(false)} /> : null}
            <div className={routeShellClass}>
              <Routes>
                <Route path="/" element={<Navigate to="/agents" replace />} />
                <Route path="/workspaces/:workspaceId/:section/*" element={<WorkspaceRouteRedirect />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workbench" element={<BuildSurfacePage title="Workbench" description="Create and test prompts, files, and tools before promoting work into managed agents." />} />
                <Route path="/batches" element={<BuildSurfacePage title="Batches" description="Run and inspect batch jobs for repeatable Claude workloads." />} />
                <Route path="/agent-quickstart" element={<QuickstartPage />} />
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

function readSidebarCollapsedPreference() {
  try {
    return window.localStorage.getItem(sidebarCollapsedStorageKey) === "true";
  } catch {
    return false;
  }
}

function WorkspaceRouteRedirect() {
  const { section, "*": rest = "" } = useParams();
  const location = useLocation();
  const targetSection = section === "credential-vaults" ? "vaults" : section;
  const suffix = rest ? `/${rest}` : "";
  return <Navigate to={`/${targetSection || "agents"}${suffix}${location.search}${location.hash}`} replace />;
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsedPreference);
  const location = useLocation();
  const managedSectionActive = ["/agents", "/sessions", "/deployments", "/environments", "/vaults", "/memory-stores"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const buildSectionActive = ["/files", "/skills"].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarCollapsedStorageKey, collapsed ? "true" : "false");
    } catch {
      // Ignore unavailable storage; the sidebar still works for the current session.
    }
  }, [collapsed]);

  if (collapsed) {
    return (
      <aside aria-label="Main navigation" className="sticky top-0 flex h-screen w-12 shrink-0 flex-col border-r-[0.5px] border-line bg-[#f9f9f7] p-0 shadow-[inset_-4px_0px_6px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex h-[52px] items-start justify-start pl-2 pt-3">
          <SidebarIconButton aria-label="Expand" data-testid="menu-sidebar-open" onClick={() => setCollapsed(false)}>
            <SidebarPanelIcon />
          </SidebarIconButton>
        </div>
        <div data-testid="sidebar-workspace-scope-picker-concise" className="ml-2 mt-1 h-8 w-8 shrink-0">
          <button
            className="m-px flex h-[30px] w-[30px] shrink-0 items-center justify-center border-0 bg-transparent text-ink shadow-none"
            aria-expanded="false"
            aria-label="Workspace"
            role="combobox"
            type="button"
          >
            <WorkspaceBoxIcon />
            <span className="sr-only">Default</span>
          </button>
        </div>
        <nav className="mt-[17px] flex min-h-0 flex-1 flex-col items-start gap-1 overflow-y-auto pb-0 pl-1.5">
          <CollapsedSidebarLink glyph="" label="Dashboard" to="/dashboard" testId="sidebar-nav-dashboard-concise" />
          <CollapsedSidebarLink glyph="" label="API keys" to="/settings/workspaces/default/keys" testId="sidebar-nav-api-keys-concise" />
          <CollapsedSidebarButton glyph="" label="Build" active={buildSectionActive} testId="sidebar-section-build-concise" />
          <CollapsedSidebarButton glyph="" label="Managed Agents" active={managedSectionActive} testId="sidebar-section-managed-agents-concise" />
          <CollapsedSidebarButton glyph="" label="Analytics" testId="sidebar-section-analytics-concise" />
          <CollapsedSidebarButton glyph="" label="Claude Code" testId="sidebar-section-claude-code-concise" />
          <CollapsedSidebarButton glyph="" label="Manage" testId="sidebar-section-manage-concise" />
        </nav>
        <div className="flex flex-col items-start gap-1 border-t-[0.5px] border-line pb-5 pl-1.5 pt-2">
          <CollapsedSidebarLink glyph="" label="Documentation" to="/docs/en/home" testId="sidebar-nav-documentation-concise" />
          <CollapsedSidebarLink glyph="" label="Credits" to="/settings/billing" testId="sidebar-nav-credits-concise" />
          <button
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors hover:bg-fill"
            type="button"
            aria-label="User menu"
          >
            <span className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-[#52514e] text-[12px] leading-5 text-[#fcfcfb] [font-weight:600]">L</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Main navigation" className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r-[0.5px] border-line bg-[#f9f9f7] p-3 shadow-[inset_-4px_0px_6px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex h-10 w-full flex-col pb-3">
        <div className="-mr-2 flex w-full translate-y-px items-center justify-between">
          <Link className="pl-2" to="/dashboard" data-testid="sidebar-logo-home">
            <div data-cds="ProductLogo" className="inline-flex flex-col items-start">
              <span
                className="whitespace-nowrap font-voice font-medium leading-none text-primary [font-size:16px] [font-weight:550]"
                style={{ marginLeft: "-0.1em", fontOpticalSizing: "auto", fontFeatureSettings: '"ss01", "dlig"' }}
              >
                Managed Agents Console
              </span>
            </div>
          </Link>
          <SidebarIconButton aria-label="Collapse" onClick={() => setCollapsed(true)}>
            <SidebarPanelIcon />
          </SidebarIconButton>
        </div>
      </div>
      <CdsDropdownMenu.Root>
        <div className="mb-[17px] mt-[4px] inline-flex h-8 w-full items-center gap-1.5 rounded-cds border border-black/10 bg-transparent pr-2 text-sm leading-5">
          <CdsDropdownMenu.Trigger asChild>
            <button
              className="flex min-w-0 flex-1 items-center gap-1.5 self-stretch border-0 bg-transparent p-0 pl-2 text-left outline-none"
              role="combobox"
              aria-label="Workspace"
            >
              <span className="flex w-full min-w-0 items-center gap-2">
                <WorkspaceBoxIcon />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">Default</span>
                </span>
              </span>
              <WorkspaceChevronIcon />
            </button>
          </CdsDropdownMenu.Trigger>
        </div>
        <CdsDropdownMenu.Portal>
          <CdsDropdownMenu.Content
            data-cds="Menu"
            className="z-50 w-[232px] rounded-[12px] bg-white p-1 text-sm leading-5 text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
            side="bottom"
            align="start"
            sideOffset={6}
            alignOffset={-1}
            avoidCollisions={false}
          >
            <CdsDropdownMenu.Item className="flex h-10 w-full items-center gap-2 rounded-[8px] bg-[rgba(11,11,11,0.05)] px-2 text-sm outline-none">
              <WorkspaceBoxIcon />
              <span className="min-w-0 flex-1 truncate">Default</span>
              <SidebarGlyph glyph="" className="h-4 w-4 text-[#52514e] text-[16px] [font-weight:700]" />
            </CdsDropdownMenu.Item>
            <CdsDropdownMenu.Separator className="my-1 h-px bg-line" />
            <CdsDropdownMenu.Item className="flex h-8 w-full items-center gap-2 rounded-[8px] px-2 text-sm outline-none data-[highlighted]:bg-fill">
              <SidebarGlyph glyph="" className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:566.5]" />
              <span className="min-w-0 flex-1 truncate">Create workspace</span>
            </CdsDropdownMenu.Item>
          </CdsDropdownMenu.Content>
        </CdsDropdownMenu.Portal>
      </CdsDropdownMenu.Root>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-0">
        <IconItem icon={<SidebarGlyph glyph="" />} label="Dashboard" to="/dashboard" testId="sidebar-nav-dashboard-full" />
        <IconItem icon={<SidebarGlyph glyph="" />} label="API keys" to="/settings/workspaces/default/keys" testId="sidebar-nav-api-keys-full" />
        <Group icon={<SidebarGlyph glyph="" />} label="Build" items={["Workbench", "Files", "Skills", "Batches"]} testId="sidebar-section-build" />
        <Group
          icon={<SidebarGlyph glyph="" />}
          label="Managed Agents"
          items={["Quickstart", "Agents", "Sessions", "Deployments", "Environments", "Credential vaults", "Memory stores"]}
          managed
          testId="sidebar-section-managed-agents"
        />
        <Group icon={<SidebarGlyph glyph="" />} label="Analytics" items={["Usage", "Caching", "Rate limits", "Cost", "Logs"]} defaultExpanded={false} testId="sidebar-section-analytics" />
        <Group icon={<SidebarGlyph glyph="" />} label="Claude Code" items={["Usage", "Settings"]} defaultExpanded={false} testId="sidebar-section-claude-code" />
        <Group icon={<SidebarGlyph glyph="" />} label="Manage" items={["Limits", "Service accounts", "Privacy controls", "Security", "Webhooks", "Tags"]} testId="sidebar-section-manage" />
      </nav>
      <div className="-mx-3 flex flex-col gap-1 border-t-[0.5px] border-line bg-transparent px-3 pb-0 pt-2">
        <FooterItem icon={<SidebarGlyph glyph="" className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:433.3]" />} label="Documentation" to="/docs/en/home" />
        <FooterItem icon={<SidebarGlyph glyph="" className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:433.3]" />} label="Credits" right={"USD\u00a03.10"} overlayTo="/settings/billing" overlayAriaLabel="Credits — view billing" />
        <CdsDropdownMenu.Root>
          <CdsDropdownMenu.Trigger asChild>
            <button className="-my-0.5 flex h-12 w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-fill data-[state=open]:bg-fill" type="button" aria-label="User menu">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border-[0.5px] border-black/10 bg-[rgba(11,11,11,0.05)] text-[#52514e]">
                <SidebarGlyph glyph="" className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:433.3]" />
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <div className="truncate text-sm leading-5 text-ink [font-weight:550]">Leo</div>
                <div className="flex min-w-0 items-baseline gap-1.5 text-xs leading-4 text-[#52514e] [font-weight:430]">
                  <span className="shrink-0">Admin</span>
                  <span className="shrink-0">·</span>
                  <span className="truncate">Leo’s Individual Org</span>
                </div>
              </div>
              <SidebarGlyph glyph="" className="mr-2 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.3]" />
            </button>
          </CdsDropdownMenu.Trigger>
          <CdsDropdownMenu.Portal>
            <CdsDropdownMenu.Content
              data-cds="Menu"
              className="z-50 flex w-72 flex-col rounded-[12px] bg-white p-1 text-sm leading-5 text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
              side="right"
              align="end"
              sideOffset={6}
              alignOffset={-2}
              avoidCollisions={false}
            >
              <div className="truncate px-2.5 py-1 text-[13px] leading-4 text-[#898781] [font-weight:550]">iterx.internal@gmail.com</div>
              <CdsDropdownMenu.RadioGroup value="leo">
                <CdsDropdownMenu.RadioItem value="leo" className="flex h-12 w-full items-center gap-2 rounded-[8px] bg-[rgba(11,11,11,0.05)] px-2.5 py-1.5 text-sm outline-none">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(11,11,11,0.05)] text-[#52514e]">
                    <SidebarGlyph glyph="" className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:433.3]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate leading-5 [font-weight:580]">Leo’s Individual Org</span>
                    <span className="block truncate text-[13px] leading-4 text-[#52514e]">API plan</span>
                  </span>
                  <CdsDropdownMenu.ItemIndicator>
                    <SidebarGlyph glyph="" className="h-4 w-4 text-[#52514e] text-[16px] [font-weight:700]" />
                  </CdsDropdownMenu.ItemIndicator>
                </CdsDropdownMenu.RadioItem>
              </CdsDropdownMenu.RadioGroup>
              <CdsDropdownMenu.Separator className="my-1 h-px bg-transparent" />
              <SidebarUserMenuItem glyph="">Organization settings</SidebarUserMenuItem>
              <CdsDropdownMenu.Separator className="my-1 h-px bg-transparent" />
              <SidebarUserMenuItem glyph="">Feedback</SidebarUserMenuItem>
              <SidebarUserMenuItem glyph="">Get help</SidebarUserMenuItem>
              <SidebarUserMenuItem glyph="" trailing="">Language</SidebarUserMenuItem>
              <SidebarUserMenuItem glyph="" trailing="">Legal center</SidebarUserMenuItem>
              <CdsDropdownMenu.Separator className="my-1 h-px bg-transparent" />
              <SidebarUserMenuItem glyph="">Log out</SidebarUserMenuItem>
            </CdsDropdownMenu.Content>
          </CdsDropdownMenu.Portal>
        </CdsDropdownMenu.Root>
      </div>
    </aside>
  );
}

function SidebarUserMenuItem({ glyph, children, trailing }: { glyph: string; children: React.ReactNode; trailing?: string }) {
  return (
    <CdsDropdownMenu.Item className="flex h-8 w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-fill">
      <SidebarGlyph glyph={glyph} className="h-5 w-5 text-[#52514e] text-[20px] [font-weight:433.3]" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing ? <SidebarGlyph glyph={trailing} className="h-4 w-4 text-[#898781] text-[16px] [font-weight:533.3]" /> : null}
    </CdsDropdownMenu.Item>
  );
}

function SidebarIconButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-cds="Button"
      data-size="sm"
      type="button"
      className={`group/sidebar-icon relative isolate inline-flex h-7 w-7 shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control border-0 bg-transparent px-0 text-sm leading-5 text-[#898781] outline-none transition-colors [font-weight:550] hover:text-ink ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="absolute inset-0 -z-[1] rounded-[inherit] bg-transparent transition-colors group-hover/sidebar-icon:bg-fill" />
      {children}
    </button>
  );
}

function CollapsedSidebarLink({ glyph, label, to = "#", testId }: { glyph: string; label: string; to?: string; testId?: string }) {
  const location = useLocation();
  const managedActive =
    label === "Managed Agents" &&
    ["/agents", "/sessions", "/deployments", "/environments", "/vaults", "/memory-stores"].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const active = managedActive || (to !== "#" && (location.pathname === to || location.pathname.startsWith(`${to}/`)));

  return (
    <Link className={`flex h-9 w-9 items-center justify-center rounded-lg text-[#52514e] hover:bg-fill hover:text-ink ${active ? "bg-[rgba(11,11,11,0.05)] !text-ink" : ""}`} to={to} aria-label={label} data-testid={testId} aria-current={active ? "page" : undefined}>
      <SidebarGlyph glyph={glyph} className="h-5 w-5 text-current text-[20px] [font-weight:433.3]" />
    </Link>
  );
}

function CollapsedSidebarButton({ glyph, label, active = false, testId }: { glyph: string; label: string; active?: boolean; testId?: string }) {
  return (
    <button
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#52514e] transition-colors hover:bg-fill hover:text-ink ${active ? "bg-[rgba(11,11,11,0.05)] !text-ink" : ""}`}
      type="button"
      aria-expanded={false}
      aria-label={label}
      data-testid={testId}
    >
      <SidebarGlyph glyph={glyph} className="h-5 w-5 text-current text-[20px] [font-weight:433.3]" />
    </button>
  );
}

function SidebarPanelIcon() {
  return <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />;
}

function MoreActionsIcon() {
  return <CdsIconGlyph glyph="" />;
}

function MenuArchiveIcon() {
  return <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />;
}

function MenuDeleteIcon() {
  return <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />;
}

function MenuResumeIcon() {
  return <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />;
}

function MenuEditIcon() {
  return <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />;
}

function CdsIconGlyph({ glyph, className = "h-5 w-5 text-current text-[20px] [font-weight:433.3]" }: { glyph: string; className?: string }) {
  return (
    <span data-cds="Icon" aria-hidden="true" className={`flex shrink-0 select-none items-center justify-center leading-none [font-family:var(--font-anthropicons,Anthropicons-Variable)] ${className}`}>
      {glyph}
    </span>
  );
}

function SidebarGlyph({ glyph, className = "h-5 w-5 text-[#898781] text-[20px] [font-weight:433.3]" }: { glyph: string; className?: string }) {
  return <CdsIconGlyph glyph={glyph} className={className} />;
}

function WorkspaceBoxIcon() {
  return (
    <CdsIconGlyph glyph="" className="h-4 w-4 text-[#9b87f5] text-[16px] [font-weight:533.3]" />
  );
}

function WorkspaceChevronIcon() {
  return (
    <span data-cds="Icon" aria-hidden="true" className="mr-0.5 flex h-4 w-4 shrink-0 select-none items-center justify-center text-[16px] leading-none text-[#898781] [font-family:var(--font-anthropicons,Anthropicons-Variable)] [font-weight:533.25]">
      
    </span>
  );
}

function PaginationButton({
  direction,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { direction: "previous" | "next" }) {
  return (
    <button
      data-cds="Button"
      type="button"
      className="cds-focus inline-flex h-8 w-8 shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-line bg-white p-0 text-sm leading-5 text-[#898781] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:bg-fill hover:text-ink disabled:pointer-events-none disabled:text-[#b9b6ad] [font-weight:550]"
      {...props}
    >
      <CdsIconGlyph glyph={direction === "previous" ? "" : ""} className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
    </button>
  );
}

function IconItem({ icon, label, right, to, testId }: { icon: React.ReactNode; label: string; right?: string; to?: string; testId?: string }) {
  const location = useLocation();
  const active = Boolean(to && (location.pathname === to || location.pathname.startsWith(`${to}/`)));
  const className = `flex h-9 shrink-0 items-center gap-3 rounded-lg px-2 text-sm leading-5 text-[#52514e] [font-weight:400] hover:bg-fill ${active ? "bg-[rgba(11,11,11,0.05)] text-ink" : ""}`;
  const content = (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {right ? <span className="text-muted">{right}</span> : null}
    </>
  );

  return to ? (
    <Link className={className} to={to} data-testid={testId} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function FooterItem({
  icon,
  label,
  right,
  to,
  overlayTo,
  overlayAriaLabel
}: {
  icon: React.ReactNode;
  label: string;
  right?: string;
  to?: string;
  overlayTo?: string;
  overlayAriaLabel?: string;
}) {
  const className = "flex h-9 shrink-0 items-center gap-3 rounded-lg px-2 text-sm leading-5 text-[#52514e] [font-weight:400] hover:bg-fill";
  const content = (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {right ? <span className="text-[#898781] tabular-nums">{right}</span> : null}
    </>
  );

  return to ? (
    <Link className={className} to={to}>
      {content}
    </Link>
  ) : overlayTo ? (
    <div className={`${className} relative`}>
      {content}
      <Link className="absolute inset-0 rounded-lg" to={overlayTo} aria-label={overlayAriaLabel || label} />
    </div>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Group({ icon, label, items, managed = false, defaultExpanded = true, testId }: { icon: React.ReactNode; label: string; items: string[]; managed?: boolean; defaultExpanded?: boolean; testId?: string }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const location = useLocation();
  const toPath = (item: string) => {
    if (!managed) return "#";
    if (item === "Quickstart") return "/workspaces/default/agent-quickstart";
    const section = item.toLowerCase().replaceAll(" ", "-").replace("credential-vaults", "vaults");
    return `/workspaces/default/${section}`;
  };
  const buildPath = (item: string) => {
    if (item === "Workbench") return "/workbench";
    if (item === "Files") return "/workspaces/default/files";
    if (item === "Skills") return "/workspaces/default/skills";
    if (item === "Batches") return "/workspaces/default/batches";
    return null;
  };
  const sidebarTestId = (item: string) => {
    const ids: Record<string, string> = {
      Workbench: "sidebar-nav-workbench-full",
      Files: "sidebar-nav-files-full",
      Skills: "sidebar-nav-skills-full",
      Batches: "sidebar-nav-batches-full",
      Quickstart: "sidebar-nav-agent-quickstart-full",
      Agents: "sidebar-nav-agents-full",
      Sessions: "sidebar-nav-sessions-full",
      Deployments: "sidebar-nav-deployments-full",
      Environments: "sidebar-nav-environments-full",
      "Credential vaults": "sidebar-nav-bergamot-full",
      "Memory stores": "sidebar-nav-memory-stores-full"
    };
    return ids[item];
  };
  const groupRoutes = items.map((item) => buildPath(item) ?? (managed ? toPath(item) : null)).filter((route): route is string => Boolean(route && route !== "#"));
  const groupRouteAliases = groupRoutes.flatMap((route) => [route, route.replace("/workspaces/default", "")]);
  const groupActive = groupRouteAliases.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));
  return (
    <div className={`${expanded ? "mb-1" : ""} flex shrink-0 flex-col gap-1`}>
      <button
        className="flex h-9 shrink-0 items-center gap-3 rounded-lg px-2 text-left text-sm leading-5 text-[#52514e] hover:bg-fill"
        type="button"
        aria-expanded={expanded}
        data-testid={testId}
        onClick={() => setExpanded((value) => !value)}
      >
        {icon}
        <span className={`truncate text-left ${groupActive ? "[font-weight:580]" : "[font-weight:550]"}`}>{label}</span>
        <CdsIconGlyph glyph="" className={`ml-auto h-3 w-3 shrink-0 text-[#898781] text-[12px] [font-weight:577.75] ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded ? <div className="flex flex-col gap-1">
        {items.map((item) => {
          const route = buildPath(item) ?? (managed ? toPath(item) : null);
          return route && route !== "#" ? (
            <SidebarItem key={item} to={route} inset badge={item === "Deployments" ? "New" : undefined} testId={sidebarTestId(item)}>
              {item}
            </SidebarItem>
          ) : (
            <div key={item} className="flex shrink-0 items-center rounded-lg pl-10 text-sm leading-[21px] text-[#52514e] [font-weight:400]" style={{ height: 36 }}>
              {item}
            </div>
          );
        })}
      </div> : null}
    </div>
  );
}

function BuildSurfacePage({ title, description }: { title: string; description: string }) {
  return (
    <section className="max-w-[968px]">
      <PageHeader title={title} description={description} />
      <div className="mt-10">
        <EmptyState title={`${title} is ready`} description="This surface is available from the Build navigation and will show workspace data as the implementation expands." />
      </div>
    </section>
  );
}

function DashboardPage() {
  return (
    <section className="max-w-[968px]">
      <PageHeader title="Dashboard" description="Review workspace activity, resources, and managed agent entry points." />
      <div className="mt-10">
        <EmptyState title="Dashboard is ready" description="Workspace activity and product summaries will appear here as the control-plane surfaces expand." />
      </div>
    </section>
  );
}

function QuickstartPage() {
  return (
    <section className="max-w-[968px]">
      <PageHeader
        title="Quickstart"
        description="Create an agent, start a session, and connect environments, vaults, memory, files, and skills."
      />
      <div className="mt-10 grid gap-4 text-sm leading-5 text-[#52514e]">
        <div className="rounded-cds border border-line bg-white px-4 py-3">
          <div className="mb-1 text-ink [font-weight:550]">1. Create or choose an agent</div>
          <p>Agents define the model, system prompt, tool permissions, skills, and runtime defaults used by sessions and deployments.</p>
        </div>
        <div className="rounded-cds border border-line bg-white px-4 py-3">
          <div className="mb-1 text-ink [font-weight:550]">2. Start a session</div>
          <p>Sessions provide the interactive execution surface for a selected agent, environment, mounted files, vault credentials, and memory stores.</p>
        </div>
        <div className="rounded-cds border border-line bg-white px-4 py-3">
          <div className="mb-1 text-ink [font-weight:550]">3. Promote repeatable work to a deployment</div>
          <p>Deployments capture scheduled or triggered runs once a workflow is stable enough to run repeatedly.</p>
        </div>
      </div>
    </section>
  );
}

function Banner({ onDismiss }: { onDismiss: () => void }) {
  function dismiss() {
    try {
      window.localStorage.setItem(bannerDismissedStorageKey, "true");
    } catch {
      // Ignore unavailable storage; the banner still closes for this render.
    }
    onDismiss();
  }
  return (
    <div
      data-cds="Banner"
      className="mb-4 flex h-[76px] items-start gap-2 rounded-[12px] bg-[#fcfcfb] px-4 py-3 text-sm leading-5 shadow-[0_0_0_1px_rgba(11,11,11,0.1)]"
    >
      <span className="flex h-5 shrink-0 items-center text-[#52514e]">
        <CdsIconGlyph glyph="" />
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-4 gap-y-3">
        <div className="max-w-full min-w-0 flex-auto">
          Update June 12: We've suspended access to Claude Fable 5 and Claude Mythos 5. Please use Opus 4.8 or another model.
        </div>
        <span className="-ml-0.5 flex h-5 shrink-0 items-center">
          <Button className="!h-7 !w-[130px] !gap-1.5 !px-2.5 !text-sm [font-weight:550]">
            Learn more here
          </Button>
        </span>
      </div>
      <span className="-mr-2.5 flex h-5 shrink-0 items-center">
        <Button variant="ghost" className="!h-8 !w-8 !rounded-[8px] !px-0 [font-weight:550]" onClick={dismiss} aria-label="Dismiss">
          <CdsIconGlyph glyph="" />
        </Button>
      </span>
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
  const agentTableWidths = { id: "180px", name: "240px", model: "170px", status: "120px", created: "150px", updated: "150px", actions: "56px" };

  useEffect(() => {
    listAgents({ q: search, status, created }).then(setAgents).catch(() => setAgents([]));
  }, [created, search, status]);

  async function archiveCurrent(agent: Agent) {
    const updated = await archiveAgent(agent.id);
    setAgents((items) => status === "Archived" ? items.map((item) => (item.id === updated.id ? updated : item)) : items.filter((item) => item.id !== updated.id));
    setArchivingAgent(null);
    showToast("Agent archived.");
  }

  return (
    <section className="-mx-2 flex flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Create and manage autonomous agents."
        action={
          <div className="flex items-center gap-2">
            <HeaderCreateButton className="!w-[132px]" onClick={() => setDialogOpen(true)}>Create agent</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/agent-setup"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="flex items-center gap-2">
        <div data-cds="TextInput" className="relative flex h-8 w-[320px] items-center rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
          <CdsIconGlyph glyph="" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#898781] text-[16px] [font-weight:533.25]" />
          <input
            className="ml-6 h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
            aria-label="Search by name or exact ID"
            placeholder="Search by name or exact ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search ? <SearchClearButton onClear={() => setSearch("")} /> : null}
        </div>
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Archived", "All"]}
          onValueChange={setStatus}
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <DataTable
        className="-mx-2 -my-2 w-[1106px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
        tableClassName="w-[1106px] border-separate border-spacing-0 whitespace-nowrap"
        rows={agents}
        getKey={(agent) => agent.id}
        getRowHref={(agent) => `/agents/${agent.id}`}
        columns={[
          {
            key: "id",
            header: "ID",
            width: agentTableWidths.id,
            render: (agent) => (
              <div className="group/cid flex items-center gap-1 font-mono text-xs [font-weight:550]">
                <span>{shortId(agent.id)}</span>
                <CopyIdButton value={agent.id} />
              </div>
            )
          },
          {
            key: "name",
            header: "Name",
            width: agentTableWidths.name,
            render: (agent) => (
              <Link className="block truncate [font-weight:400]" to={`/agents/${agent.id}`}>
                {agent.name}
              </Link>
            )
          },
          { key: "model", header: "Model", width: agentTableWidths.model, render: (agent) => <span className="font-mono text-muted">{agent.model}</span> },
          { key: "status", header: "Status", width: agentTableWidths.status, render: (agent) => <Badge tone={agent.status === "Archived" ? "neutral" : "green"}>{agent.status}</Badge> },
          { key: "created", header: "Created", width: agentTableWidths.created, render: (agent) => <span className="text-muted">{agent.createdLabel || "2 days ago"}</span> },
          { key: "updated", header: "Last updated", width: agentTableWidths.updated, render: (agent) => <span className="text-muted">{agent.updatedLabel || "2 days ago"}</span> }
        ]}
        actionsWidth={agentTableWidths.actions}
        renderActions={(agent) => <AgentRowActions agent={agent} onArchive={() => setArchivingAgent(agent)} />}
      />
      <div className="-mt-[1.5px] flex gap-2">
        <PaginationButton direction="previous" aria-label="Previous page" disabled />
        <PaginationButton direction="next" aria-label="Next page" disabled />
      </div>
      <AgentArchiveDialog
        agentName={archivingAgent?.name ?? "this agent"}
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [created, setCreated] = useState("All time");
  const [agent, setAgent] = useState(searchParams.get("agentId") ?? "All");
  const [deployment, setDeployment] = useState(searchParams.get("deploymentId") ?? "All");
  const [status, setStatus] = useState(searchParams.get("status") ?? "Active");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivingSession, setArchivingSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPage(0);
    setLoading(true);
    listSessions({ q: search, status, agentId: agent, deploymentId: deployment, created })
      .then((items) => {
        if (!cancelled) setSessions(items);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agent, created, deployment, search, status]);

  const pageSize = 8;
  const maxPage = Math.max(0, Math.ceil(sessions.length / pageSize) - 1);
  const visibleSessions = sessions.slice(page * pageSize, page * pageSize + pageSize);

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
          <div className="flex items-center gap-2">
            <HeaderCreateButton className="!w-[144px]" onClick={() => setDialogOpen(true)}>Create session</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/sessions"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div data-cds="TextInput" className="flex h-8 items-center gap-2 rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
            <span className="text-xs text-[#898781] [font-weight:580]">ID</span>
            <input
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-muted"
              aria-label="Search by session ID"
              placeholder="Search by session ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search ? <SearchClearButton onClear={() => setSearch("")} /> : null}
          </div>
          <span aria-hidden="true" className="h-1 px-1 text-xs text-transparent" />
        </div>
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Agent"
          value={agent}
          options={["All", "agent_013mi1SmR2hJ6Hk6wNTeJvF9", "agent_017k8CPYuCFRD9AmupUeXd2Z"]}
          onValueChange={setAgent}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Deployment"
          value={deployment}
          options={["All", "depl_01ERmHnRJWQSLyxk7pVCMZXs"]}
          onValueChange={setDeployment}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Idle", "Archived", "All"]}
          onValueChange={setStatus}
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <div className="-mt-2">
        <DataTable
          className="-mx-2 -my-2 w-[1066px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
          tableClassName="w-[1066px] border-separate border-spacing-0 whitespace-nowrap"
          rows={visibleSessions}
          getKey={(session) => session.id}
          getRowHref={(session) => `/sessions/${session.id}`}
          loading={loading}
          columns={[
            {
              key: "id",
              header: "ID",
              width: "160px",
              render: (session) => (
                <div className="group/cid flex items-center gap-1">
                  <span className="font-mono font-semibold">{shortId(session.id)}</span>
                  <CopyIdButton value={session.id} />
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "170px",
              render: (session) => (
                <Link className="block truncate [font-weight:400]" to={`/sessions/${session.id}`}>
                  {session.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "130px", render: (session) => <Badge tone={sessionTone(session.status)}>{session.status}</Badge> },
            {
              key: "agent",
              header: "Agent",
              width: "170px",
              render: (session) => (
                <button
                  data-cds="Button"
                  type="button"
                  className="cds-focus inline-flex h-[25px] min-w-0 max-w-full items-center gap-1.5 rounded-md border-[0.5px] border-black/10 bg-transparent px-1.5 py-0.5 text-sm leading-5 text-[#52514e] [font-weight:400] hover:bg-fill"
                >
                  <CdsIconGlyph glyph="" className="h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
                  <span className="truncate">{session.agentName}</span>
                </button>
              )
            },
            { key: "tokens", header: "Tokens in / out", width: "140px", render: (session) => <span className="text-ink">{session.tokens}</span> },
            { key: "created", header: "Created", width: "200px", render: (session) => <span className="text-muted">{session.createdLabel}</span> }
          ]}
          actionsWidth="56px"
          renderActions={(session) => <SessionRowActions session={session} onArchive={() => setArchivingSession(session)} />}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={page >= maxPage}
          onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
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
            <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            {session.agentName}
          </Button>
          <span>·</span>
          <Button variant="ghost" className="h-[25px] px-2 font-normal text-[#4e4a45]">
            <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            {session.environmentName}
          </Button>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            {session.duration}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            {session.tokens}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            {session.createdLabel}
          </span>
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
            <FieldSelect label="" value={eventFilter} options={["All events", "User", "Agent", "Tool", "System"]} onValueChange={setEventFilter} triggerClassName="!h-7 min-w-[97px] px-2" />
            <Button variant="icon" aria-label="Open search filter" onClick={() => setEventSearchOpen((open) => !open)}>
              <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            </Button>
            {eventSearchOpen ? (
              <TextInput className="w-[220px]" aria-label="Filter events" placeholder="Filter events" value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} />
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="icon" aria-label="Keyboard shortcuts">
              <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            </Button>
            <CopyIconButton value={transcriptText} ariaLabel="Copy all" className="h-7 w-7 !px-0" iconClassName="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            <Button variant="icon" aria-label="Download" onClick={() => downloadText(`${session.id}-transcript.txt`, transcriptText)}>
              <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
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
                <CdsIconGlyph glyph="" />
              </Button>
              <div className="text-sm">
                <div className="pr-10">
                  <h2 className="text-sm leading-6 text-ink">{selectedEvent.role} {selectedEvent.kind}</h2>
                  <div className="mt-1 flex h-5 items-center gap-2 text-xs text-muted">
                    <span className="font-mono">{shortId(selectedEvent.id)}</span>
                    <span className="hidden font-mono">{selectedEvent.id}</span>
                    <CopyIconButton value={selectedEvent.id} className="h-[20px] w-[20px] px-0" iconClassName="h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]" />
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
      <div className="inline-flex h-8 items-center rounded-[8px] bg-white/50 pr-2 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={`${label} filter`}
          className={`flex h-8 items-center justify-between rounded-[8px] bg-transparent pl-2 pr-0 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35 ${triggerWidth}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            <span className="text-muted">{label}</span>
            <span className="truncate">{selectedLabel}</span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
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
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [archivingDeployment, setArchivingDeployment] = useState<Deployment | null>(null);

  useEffect(() => {
    setPage(0);
    listDeployments({ q: search, status, agentId: agent }).then(setDeployments).catch(() => setDeployments([]));
  }, [agent, search, status]);

  const pageSize = 8;
  const maxPage = Math.max(0, Math.ceil(deployments.length / pageSize) - 1);
  const visibleDeployments = deployments.slice(page * pageSize, page * pageSize + pageSize);

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
          <div className="flex items-center gap-2">
            <HeaderCreateButton onClick={() => setDialogOpen(true)}>Create deployment</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/deployments"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="mt-4 flex flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div data-cds="TextInput" className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
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
        <DeploymentFilterSelect
          label="Status"
          value={status}
          options={["All", "Active", "Paused"].map((option) => ({ value: option, label: option }))}
          onValueChange={setStatus}
          triggerWidth="w-[98px]"
          menuWidth="w-[192px]"
        />
      </div>
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[1146px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
          tableClassName="w-[1146px] border-separate border-spacing-0 whitespace-nowrap"
          headerTextClassName="text-[13px]"
          rows={visibleDeployments}
          getKey={(deployment) => deployment.id}
          showSelection={false}
          actionsWidth="56px"
          actionsHeaderAlign="right"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "160px",
              render: (deployment) => (
                <div className="group/cid flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono font-semibold">{shortId(deployment.id)}</span>
                  <CopyIdButton value={deployment.id} />
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "240px",
              render: (deployment) => (
                <Link className="block truncate [font-weight:400]" to={`/deployments/${deployment.id}`}>
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
                <span className="relative z-10 inline-flex max-w-full items-center gap-1.5 align-middle">
                  <button
                    data-cds="Button"
                    type="button"
                    className="cds-focus inline-flex h-[25px] min-w-0 max-w-full items-center gap-1.5 rounded-md border-[0.5px] border-black/10 bg-transparent px-1.5 py-0.5 text-sm leading-5 text-[#52514e] [font-weight:400] hover:bg-fill"
                  >
                    <CdsIconGlyph glyph="" className="h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
                    <span className="truncate">{deployment.agentName}</span>
                  </button>
                  <span className="shrink-0 rounded bg-[#f6f6f4] px-1 font-mono text-[11px] leading-4 text-[#52514e]">{deployment.agentVersion}</span>
                </span>
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
      <div className="mt-5 flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={page >= maxPage}
          onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
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
    <section className="flex w-full max-w-none flex-col">
      <div className="-ml-5 -mt-3 mb-3 flex h-9 w-[984px] items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link className="px-3 py-1 transition-colors hover:text-ink" to="/deployments">
            Deployments
          </Link>
          <span>/</span>
          <span className="text-ink">{deployment.name}</span>
        </nav>
      </div>
      <div className="-mx-2 flex items-start justify-between gap-4 px-1">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-[22px] leading-7 [font-weight:550]">{deployment.name}</h1>
            <Badge tone={deploymentTone(deployment.status)}>{deployment.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs leading-4 text-muted">
            <CopyableIdText value={deployment.id} display={shortDeploymentDetailId(deployment.id)} />
            <span>·</span>
            <span>Created {deployment.createdLabel === "Jun 16" ? "Jun 16, 2026" : deployment.createdLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 w-[101px] !rounded-[8px] bg-transparent px-3 !gap-1.5 [font-weight:550] hover:bg-fill" onClick={runNow}>
            <CdsIconGlyph glyph="" className="-ml-1 h-5 w-5 text-current text-[20px] [font-weight:433.3]" />
            Run now
          </Button>
          <DeploymentActions
            deployment={deployment}
            onPause={() => applyStatus("pause")}
            onResume={() => applyStatus("resume")}
            onEdit={() => setEditOpen(true)}
            onArchive={() => setArchiveOpen(true)}
            triggerClassName=""
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
        className="mt-6 flex flex-col gap-4"
      >
        <CdsTabs.List data-cds="NavigationTabs" className="-ml-2 flex gap-0.5 border-b border-line">
          {["Configuration", "Runs"].map((tab) => (
            <CdsTabs.Trigger
              key={tab}
              value={tab.toLowerCase()}
              className="relative h-8 rounded-t-cds border-b-2 border-transparent px-3 text-sm text-muted data-[state=active]:border-ink data-[state=active]:text-ink [&[data-state=active]_.deployment-tab-label]:font-medium"
            >
              <span className="deployment-tab-label absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-center whitespace-nowrap font-normal">{tab}</span>
              <span aria-hidden="true" className="invisible [font-weight:550]">
                {tab}
              </span>
            </CdsTabs.Trigger>
          ))}
        </CdsTabs.List>
        <CdsTabs.Content value="configuration" className="-ml-1 -mt-px flex max-w-[792px] flex-col gap-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <DeploymentDetailSection title="Agent">
              <div className="flex items-center gap-1.5">
                <DeploymentDetailToken icon="" to={`/agents/${deployment.agentId}`}>{deployment.agentName}</DeploymentDetailToken>
                <span className="text-sm leading-5 text-muted [font-weight:550]">{deployment.agentVersion}</span>
              </div>
            </DeploymentDetailSection>
            <DeploymentDetailSection title="Environment">
              <DeploymentDetailToken icon="" to={`/environments/${deployment.environmentId}`}>{deployment.environmentName}</DeploymentDetailToken>
            </DeploymentDetailSection>
          </div>
          <DeploymentDetailSection title="Credential vaults">
            <DeploymentDetailToken icon="">{deployment.vaults || "No credential vault"}</DeploymentDetailToken>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Memory stores">
            <DeploymentDetailToken icon="">{deployment.memoryStores || "No memory store"}</DeploymentDetailToken>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Schedule">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="group/value flex items-start gap-2 rounded-md border-[0.5px] border-[#dedbd2] bg-[#f9f9f7] px-3 py-2">
                  <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-4 text-[#4e4a45]">{deployment.schedule}</pre>
                  <CopyIconButton value={deployment.schedule} className="-my-0.5 h-[22px] w-[22px] shrink-0 rounded-[8px] p-1 text-muted !opacity-0 transition-colors hover:bg-fill hover:text-ink focus-visible:!opacity-100 group-hover/value:!opacity-100" iconClassName="h-4 w-4 text-[16px] [font-weight:533.25]" />
                </div>
                <span className="text-xs leading-4 text-muted">Timezone: {deployment.timezone}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs leading-4 text-muted">
                <span className="mr-0.5 inline-flex items-center gap-1">
                  <span>Next (when resumed):</span>
                  <button type="button" className="inline-flex h-3 w-3 items-center justify-center text-muted" aria-label="About scheduling jitter">
                    <CdsIconGlyph glyph="" className="h-3 w-3 text-[12px] [font-weight:433.3]" />
                  </button>
                </span>
                {deployment.nextRuns.split(", ").map((run) => (
                  <span
                    key={run}
                    className={run.startsWith("+") ? "px-2 py-0.5 text-muted" : "rounded-[8px] border border-line bg-[#fcfcfb] px-2.5 py-0.5 text-[#4e4a45]"}
                  >
                    {run}
                  </span>
                ))}
                <span className="ml-auto flex items-baseline gap-2 text-xs text-ink">
                  <span className="text-[#4e4a45]">Last scheduled run:</span>
                  <span>{deployment.lastRunLabel}</span>
                </span>
              </div>
            </div>
          </DeploymentDetailSection>
          <DeploymentDetailSection title="Initial message">
            <div className="group/value flex items-start gap-2 rounded-md border-[0.5px] border-[#dedbd2] bg-[#f9f9f7] px-3 py-2">
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-4 text-[#4e4a45]">{deployment.initialMessage}</pre>
              <CopyIconButton value={deployment.initialMessage} className="-my-0.5 h-[22px] w-[22px] shrink-0 rounded-[8px] p-1 text-muted !opacity-0 transition-colors hover:bg-fill hover:text-ink focus-visible:!opacity-100 group-hover/value:!opacity-100" iconClassName="h-4 w-4 text-[16px] [font-weight:533.25]" />
            </div>
          </DeploymentDetailSection>
        </CdsTabs.Content>
        <CdsTabs.Content value="runs" className="-ml-2 -mt-10 flex flex-col gap-2">
          <div className="flex gap-4">
            <FieldSelect label="Trigger" value={trigger} options={["All", "Manual", "Schedule"]} onValueChange={setTrigger} triggerClassName="w-[101px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent" />
            <FieldSelect label="Result" value={result} options={["All", "Success", "Failed"]} onValueChange={setResult} triggerClassName="w-[98px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent" />
          </div>
          <DataTable
            rows={visibleRuns}
            getKey={(run) => run.id}
            showSelection={false}
            showActions={false}
            className="-ml-2 w-[1210px]"
            tableClassName="ml-2 mt-2 [&_tbody_tr]:!h-11 [&_tbody_td]:!py-1"
            headerTextClassName="text-[13px]"
            columns={[
              {
                key: "id",
                header: "ID",
                width: "160px",
                render: (run) => (
                  <span className="group/cid relative z-10 inline-flex min-w-0 max-w-full items-center gap-1 align-middle">
                    <span className="relative inline-block max-w-full truncate align-bottom font-mono text-xs text-ink [font-weight:550]">
                      {shortRunTableId(run.id)}
                      <span className="pointer-events-none absolute left-0 top-0 select-none whitespace-nowrap text-transparent">{run.id}</span>
                    </span>
                    <CopyIconButton value={run.id} ariaLabel={`Copy ${run.id}`} className="-my-1 h-[22px] w-[22px] !rounded-[4px] !px-0 !text-[#898781] !opacity-0 hover:!bg-fill hover:!text-[#52514e] group-hover/cid:!opacity-100 focus-visible:!opacity-100" iconClassName="h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]" />
                  </span>
                )
              },
              {
                key: "started",
                header: "Started at (GMT+8)",
                width: "260px",
                render: (run) => (
                  <span className="inline-flex items-baseline gap-2 text-sm leading-5 text-ink">
                    <span>{run.startedAt}</span>
                    <span className="text-muted">{run.startedLabel}</span>
                  </span>
                )
              },
              { key: "trigger", header: "Trigger", width: "120px", render: (run) => <span>{run.trigger}</span> },
              { key: "status", header: "Status", width: "110px", render: (run) => <Badge tone="green">{run.result}</Badge> },
              { key: "version", header: "Agent version", width: "160px", render: (run) => <span>{run.agentVersion}</span> },
              {
                key: "session",
                header: "Session",
                width: "260px",
                render: (run) => (
                  <Link className="relative -mx-1 -my-0.5 inline-block w-fit max-w-full rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-fill" to={`/sessions/${run.sessionId}`}>
                    <span className="relative inline-block max-w-full truncate align-bottom font-mono text-xs text-muted">
                      {shortRunTableId(run.sessionId)}
                      <span className="pointer-events-none absolute left-0 top-0 select-none whitespace-nowrap text-transparent">{run.sessionId}</span>
                    </span>
                  </Link>
                )
              },
              { key: "sessionStatus", header: "Session status", width: "140px", render: (run) => <Badge tone={sessionTone(run.sessionStatus)}>{run.sessionStatus}</Badge> }
            ]}
          />
          <div className="flex gap-2">
            <PaginationButton direction="previous" aria-label="Previous page" disabled />
            <PaginationButton direction="next" aria-label="Next page" disabled />
          </div>
        </CdsTabs.Content>
      </CdsTabs.Root>
    </section>
  );
}

function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivingEnvironment, setArchivingEnvironment] = useState<Environment | null>(null);
  const [deletingEnvironment, setDeletingEnvironment] = useState<Environment | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPage(0);
    setLoading(true);
    listEnvironments({ q: search, status })
      .then((items) => {
        if (!cancelled) setEnvironments(items);
      })
      .catch(() => {
        if (!cancelled) setEnvironments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const pageSize = 8;
  const maxPage = Math.max(0, Math.ceil(environments.length / pageSize) - 1);
  const visibleEnvironments = environments.slice(page * pageSize, page * pageSize + pageSize);

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
          <div className="flex items-center gap-2">
            <HeaderCreateButton onClick={() => setDialogOpen(true)}>Create environment</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/environments"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="mt-4 flex h-10 flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div data-cds="TextInput" className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
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
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[913px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
          tableClassName="w-[913px] border-separate border-spacing-0 whitespace-nowrap"
          rows={visibleEnvironments}
          getKey={(environment) => environment.id}
          loading={loading}
          actionsWidth="56px"
          actionsHeaderAlign="right"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "216px",
              render: (environment) => (
                <div className="group/cid relative z-10 inline-flex max-w-full items-center gap-1 align-middle font-mono text-xs [font-weight:550]">
                  <span className="truncate">{shortEnvironmentListId(environment.id)}</span>
                  <span className="hidden">{environment.id}</span>
                  <CopyIdButton value={environment.id} />
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "241px",
              render: (environment) => (
                <Link className="block truncate [font-weight:400]" to={`/environments/${environment.id}`}>
                  {environment.name}
                </Link>
              )
            },
            { key: "status", header: "Status", width: "100px", render: (environment) => <Badge tone={environmentTone(environment.status)}>{environment.status}</Badge> },
            { key: "type", header: "Type", width: "120px", render: (environment) => <Badge tone="neutral" className="bg-[#f6f6f4] text-[#52514e]">{environment.type}</Badge> },
            { key: "updated", header: "Updated at", width: "140px", align: "right", render: (environment) => <span className="text-muted">{environment.updatedLabel}</span> }
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
      <div className="mt-[8.5px] flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={page >= maxPage}
          onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
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
        <nav className="-translate-y-0.5 flex items-center gap-2 text-sm text-muted">
          <Link className="px-3 py-1 transition-colors hover:text-ink" to="/environments">
            Environments
          </Link>
          <span>/</span>
          <span className="text-ink">{environment.name}</span>
        </nav>
      </div>

      <div className="relative mx-1 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 -translate-y-0.5">
          <div className="mb-1 flex items-center gap-2">
            {editing ? (
              <TextInput
                className="h-9 !w-[256px] max-w-none flex-none rounded-[8px] !text-[22px] leading-[26px] [font-weight:580]"
                placeholder="Environment name"
                value={name}
                maxLength={50}
                onChange={(event) => setName(event.target.value)}
              />
            ) : (
              <h1 className="truncate text-[22px] leading-[26px] [font-weight:580]">{environment.name}</h1>
            )}
            {editing ? null : <Badge tone="neutral" className="h-[22px] rounded-[999px] !bg-[rgba(11,11,11,0.05)] !text-[#52514e]">{environment.type}</Badge>}
          </div>
          {editing ? null : (
            <div className="flex flex-wrap items-center gap-2 text-xs leading-4 text-muted">
              <CopyableIdText value={environment.id} display={shortEnvironmentDetailId(environment.id)} />
              <span>·</span>
              <span>Last updated {environment.updatedLabel}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <EnvironmentActions environment={environment} triggerClassName="" onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
          ) : (
            <>
              <Button variant="ghost" className="h-8 bg-transparent px-3 [font-weight:550] hover:bg-fill" onClick={startEdit}>Edit</Button>
              <EnvironmentActions environment={environment} triggerClassName="" onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
            </>
          )}
        </div>
        {!editing && environment.description ? (
          <p className="absolute left-0 top-14 w-full text-sm leading-5 text-[#52514e]">{environment.description}</p>
        ) : null}
      </div>

      {editing ? (
        <div className="-mt-[18px] flex w-full flex-col gap-4 px-1">
          <div className="max-w-[800px]">
            <label className="mb-1 block text-sm leading-5 [font-weight:550]">Description</label>
            <textarea
              className="cds-focus h-[66px] min-h-[66px] w-full resize-none rounded-[9px] border border-line bg-white px-3 py-2 text-sm leading-5"
              placeholder="Add a description for this environment (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <EnvironmentEditSection title="Networking" description="Configure network access policies for this environment." className="mt-0.5">
            <div className="flex flex-col gap-2">
              <label className="block text-sm leading-[14px] [font-weight:550]">Type</label>
              <FieldSelect
                label="Type"
                showLabel={false}
                value={networkingType}
                options={["Unrestricted", "No internet", "Allowlist"]}
                onValueChange={setNetworkingType}
                triggerClassName="w-[792px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
              />
            </div>
          </EnvironmentEditSection>
          <EnvironmentEditSection
            title="Packages"
            description="Specify packages and their versions available in this environment. Separate multiple values with spaces."
            separated
            action={
              <Button variant="icon" className="h-8 w-8 rounded-[8px]" aria-label="Add package" onClick={addPackage}>
                <Plus className="h-4 w-4" />
              </Button>
            }
          >
            <div className="flex min-h-9 items-center gap-2">
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
            description="Add custom key-value pairs to tag and organize this environment. Keys must be lowercase."
            separated
            action={
              <Button variant="icon" className="h-8 w-8 rounded-[8px] text-sm leading-5 [font-weight:550]" aria-label="Add metadata entry" onClick={addMetadataRow}>
                <Plus className="h-4 w-4" />
              </Button>
            }
          >
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
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 rounded-[8px] px-3 [font-weight:550]" onClick={saveChanges}>Save changes</Button>
            <Button variant="ghost" className="h-8 rounded-[8px] px-3 [font-weight:550]" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex w-full flex-col gap-4 px-1">
          <EnvironmentDetailSection title="Networking" description="Configure network access policies for this environment.">
            <div className="text-sm leading-[21px]">
              <span className="[font-weight:550]">Type</span>
              <div className="mt-1">{environment.networkingType || "Unrestricted"}</div>
            </div>
          </EnvironmentDetailSection>
          <EnvironmentDetailSection title="Packages" description="Specify packages and their versions available in this environment. Separate multiple values with spaces." separated>
            <div className="group/value flex min-h-[35px] items-start gap-2 rounded-md border-[0.5px] border-line bg-[#f9f9f7] px-3 py-2">
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-4 text-[#52514e]">{environment.packageManager || "apt"}: {environment.packages || "No packages"}</pre>
              <CopyIconButton value={`${environment.packageManager || "apt"}: ${environment.packages || ""}`.trim()} ariaLabel="Copy" className="-my-0.5 h-[22px] w-[22px] px-0 text-muted !opacity-0 group-hover/value:!opacity-100 focus-visible:!opacity-100" iconClassName="h-3.5 w-3.5 text-current" />
            </div>
          </EnvironmentDetailSection>
          <EnvironmentDetailSection title="Metadata" description="Add custom key-value pairs to tag and organize this environment. Keys must be lowercase." separated>
            {environment.metadata ? (
              <pre className="min-h-[37px] rounded-md border-[0.5px] border-line bg-fill px-3 py-2 font-mono text-sm leading-5">{environment.metadata}</pre>
            ) : (
              <div className="min-h-[37px] rounded-md border-[0.5px] border-line bg-canvas px-3 py-2 text-sm text-muted">No metadata</div>
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
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivingVault, setArchivingVault] = useState<Vault | null>(null);
  const [deletingVault, setDeletingVault] = useState<Vault | null>(null);

  useEffect(() => {
    setPage(0);
    listVaults({ q: search, status }).then(setVaults).catch(() => setVaults([]));
  }, [search, status]);

  const pageSize = 8;
  const maxPage = Math.max(0, Math.ceil(vaults.length / pageSize) - 1);
  const visibleVaults = vaults.slice(page * pageSize, page * pageSize + pageSize);

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
          <div className="flex items-center gap-2">
            <HeaderCreateButton onClick={() => setDialogOpen(true)}>Create vault</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/vaults"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="mt-4 flex h-10 flex-wrap items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div data-cds="TextInput" className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
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
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[913px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
          tableClassName="border-separate border-spacing-0 whitespace-nowrap"
          rows={visibleVaults}
          getKey={(vault) => vault.id}
          showSelection={false}
          actionsWidth="48px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "216px",
              render: (vault) => (
                <div className="group/cid flex items-center gap-2">
                  <span className="font-mono font-semibold">{shortId(vault.id)}</span>
                  <CopyIdButton value={vault.id} />
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "249px",
              render: (vault) => (
                <Link className="block truncate [font-weight:400]" to={`/vaults/${vault.id}`}>
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
      <div className="mt-[10.5px] flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={page >= maxPage}
          onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
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
  const [credentialPage, setCredentialPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) getVault(id).then(setVault).catch(() => setVault(null));
  }, [id]);

  useEffect(() => {
    setCredentialPage(0);
  }, [id, status]);

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

  const filteredCredentials = status === "All" ? (vault.credentials ?? []) : (vault.credentials ?? []).filter((credential) => credential.status === status);
  const credentialPageSize = 8;
  const credentialMaxPage = Math.max(0, Math.ceil(filteredCredentials.length / credentialPageSize) - 1);
  const visibleCredentials = filteredCredentials.slice(credentialPage * credentialPageSize, credentialPage * credentialPageSize + credentialPageSize);

  return (
    <section className="-mt-4 flex flex-col">
      <div className="-ml-5 flex h-[52px] items-center justify-between">
        <nav className="-translate-y-1 flex items-center gap-2 text-sm text-muted">
          <Link className="px-3 py-1 transition-colors hover:text-ink" to="/vaults">
            Credential vaults
          </Link>
          <span>/</span>
          <span className="text-ink">{vault.name}</span>
        </nav>
      </div>

      <div className="ml-1 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h1 className="truncate text-[22px] leading-[26px] [font-weight:580]">{vault.name}</h1>
            <Badge className="!h-5 !rounded-[5px] px-2 text-xs !leading-[15px] [font-weight:550]" tone={vaultTone(vault.status)}>{vault.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm leading-5 text-muted">
            <CopyableIdText value={vault.id} />
            <span>·</span>
            <span>Created {vault.createdLabel}</span>
            <span>·</span>
            <span>Updated {vault.updatedLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 w-[143px] !gap-1.5 rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:566.5]" />
            Add credential
          </Button>
          <VaultRowActions vault={vault} onArchive={() => setArchiveOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>

      <div className="mt-6 flex h-8 items-start gap-2">
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Archived"]}
          onValueChange={setStatus}
          triggerClassName="w-[98px] rounded-none !border-transparent !bg-transparent px-0 hover:!bg-transparent"
        />
      </div>
      <DataTable
        className="-mx-2 w-[1108px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
        tableClassName="w-[1108px] border-separate border-spacing-0 whitespace-nowrap [&_tbody_tr]:!h-[47px] [&_tbody_tr:first-child]:!h-12 [&_tbody_td]:!py-1.5"
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
              <div className="group/cid flex items-center gap-2">
                <span className="font-mono font-semibold">{shortCredentialId(credential.id)}</span>
                <span className="hidden">{credential.id}</span>
                <CopyIdButton value={credential.id} />
              </div>
            )
          },
          { key: "name", header: "Name", width: "180px", render: (credential) => <span className="font-medium">{credential.name}</span> },
          {
            key: "auth",
            header: "Auth",
            width: "220px",
            render: (credential) => (
              <div className="flex min-w-0 items-center gap-1">
                <span>{credential.authType}</span>
                <span className="truncate font-mono text-sm leading-5 text-muted">{credential.target}</span>
              </div>
            )
          },
          { key: "status", header: "Status", width: "100px", render: (credential) => <Badge tone={vaultTone(credential.status)}>{credential.status}</Badge> },
          { key: "lastUsed", header: "Last used", width: "180px", render: (credential) => <span className="text-muted">{credential.lastUsed}</span> },
          { key: "updated", header: "Updated", width: "180px", render: (credential) => <span className="text-muted">{credential.updatedLabel}</span> }
        ]}
        renderActions={(credential) => <CredentialActions credential={credential} onArchive={() => archiveCredential(credential)} onDelete={() => deleteCredential(credential)} />}
        emptyState={
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-base leading-6 text-ink [font-weight:550]">No credentials yet</h2>
            <p className="mt-1 text-sm leading-5 text-[#898781]">Add a credential to give agents access through this vault.</p>
            <Button variant="ghost" className="mt-4 h-8 w-[143px] !gap-1.5 rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
              <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:566.5]" />
              Add credential
            </Button>
          </div>
        }
      />
      <div className="mt-3 flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={credentialPage === 0}
          onClick={() => setCredentialPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={credentialPage >= credentialMaxPage}
          onClick={() => setCredentialPage((value) => Math.min(credentialMaxPage, value + 1))}
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
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivingStore, setArchivingStore] = useState<MemoryStore | null>(null);
  const [deletingStore, setDeletingStore] = useState<MemoryStore | null>(null);

  useEffect(() => {
    setPage(0);
    listMemoryStores({ q: query, status, created }).then(setStores).catch(() => setStores([]));
  }, [created, query, status]);

  const pageSize = 8;
  const maxPage = Math.max(0, Math.ceil(stores.length / pageSize) - 1);
  const visibleStores = stores.slice(page * pageSize, page * pageSize + pageSize);

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
            <HeaderCreateButton onClick={() => setDialogOpen(true)}>Create memory store</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://platform.claude.com/docs/en/managed-agents/memory"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="mt-4 flex h-10 items-start gap-2">
        <div className="flex h-10 w-[320px] flex-col gap-1">
          <div data-cds="TextInput" className="relative flex h-8 items-center rounded-[8px] bg-white/50 px-3 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
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
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["Active", "Archived", "All"]}
          onValueChange={setStatus}
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <div className="overflow-x-auto">
        <DataTable
          className="-mx-2 w-[913px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
          tableClassName="w-[913px] border-separate border-spacing-0 whitespace-nowrap"
          rows={visibleStores}
          getKey={(store) => store.id}
          actionsWidth="56px"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "200px",
              render: (store) => (
                <div className="group/cid relative z-10 inline-flex max-w-full items-center gap-1 align-middle font-mono text-xs [font-weight:550]">
                  <span className="truncate">{shortMemoryStoreId(store.id)}</span>
                  <CopyIdButton value={store.id} />
                </div>
              )
            },
            {
              key: "name",
              header: "Name",
              width: "297px",
              render: (store) => (
                <Link className="block truncate [font-weight:400]" to={`/memory-stores/${store.id}`}>
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
      <div className="mt-[8.5px] flex gap-2">
        <PaginationButton
          direction="previous"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        />
        <PaginationButton
          direction="next"
          aria-label="Next page"
          disabled={page >= maxPage}
          onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
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
      const defaultMemory = records[records.length - 1];
      setSelectedMemoryId(defaultMemory.id);
      if (memoryParam !== defaultMemory.id) {
        setSearchParams({ memory: defaultMemory.id }, { replace: true });
      }
    }
  }, [memoryParam, selectedMemoryId, setSearchParams, store]);

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
  const selectedFolder = selectedMemory ? memoryFolder(selectedMemory.path) : null;

  return (
    <section className="-mt-2 flex h-[calc(100vh-96px)] flex-col overflow-hidden">
      <div className="-ml-5 flex h-9 items-center justify-between">
        <nav className="-translate-y-1 flex items-center gap-2 text-sm text-muted">
          <Link className="px-3 py-1 transition-colors hover:text-ink" to="/memory-stores">
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
            <CopyableIdText value={store.id} display={shortMemoryStoreDetailId(store.id)} />
            <span>·</span>
            <span>Created {store.createdLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="h-8 w-[130px] !gap-1.5 !rounded-[8px] px-0 [font-weight:550]" onClick={() => setDialogOpen(true)}>
            <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:566.5]" />
            Add memory
          </Button>
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 overflow-hidden rounded-xl border-[0.5px] border-line">
        <aside className="relative flex w-72 shrink-0 flex-col border-r-[0.5px] border-line bg-[#f9f9f7]">
          {folders.length > 0 ? (
            <Button variant="ghost" size="sm" className="absolute right-2 top-4 !h-6 !w-6 rounded-[6px] !px-0 [font-weight:550]" aria-label="Expand all">
              <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
            </Button>
          ) : null}
          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {folders.length === 0 ? (
              <div className="flex h-6 items-center rounded-md px-2 text-sm leading-5 text-[#898781]">Empty</div>
            ) : folders.map((folder) => (
              <div key={folder}>
                <div className="flex h-7 items-center gap-1.5 rounded-lg px-3 py-1 text-sm text-[#52514e] hover:bg-[#f6f6f0]">
                  <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]" />
                  <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-current text-[14px] [font-weight:628.5]" />
                  <span className="truncate">{folder}</span>
                </div>
                {selectedMemory && selectedFolder === folder ? (
                  <button
                    className="flex h-7 w-full items-center gap-1.5 rounded-lg py-1 pl-8 pr-3 text-left text-sm text-[#52514e] hover:bg-[#f6f6f0]"
                    onClick={() => selectMemory(selectedMemory.id)}
                  >
                    <CdsIconGlyph glyph="" className="h-3.5 w-3.5 shrink-0 text-current text-[14px] [font-weight:628.5]" />
                    <span className="min-w-0 flex-1 truncate">{selectedMemory.displayName || memoryName(selectedMemory.path)}</span>
                    <span className="text-xs text-muted">{selectedMemory.size}</span>
                  </button>
                ) : null}
              </div>
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
                    <CopyableIdText value={selectedMemory.id} display={shortMemoryRecordId(selectedMemory.id)} />
                    <span>·</span>
                    <span>Updated {selectedMemory.updatedLabel}</span>
                    <span>·</span>
                    <CopyableIdText value={selectedMemory.authorId} display={shortUserId(selectedMemory.authorId)} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="inline-flex h-7 rounded-control bg-fill p-px">
                    <button className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-white" aria-label="Preview memory">
                      <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
                    </button>
                    <button className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-muted" aria-label="View source">
                      <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
                    </button>
                  </div>
                  <MemoryRecordActions record={selectedMemory} onDelete={() => deleteRecord(selectedMemory)} />
                  <Button variant="ghost" className="!h-7 !gap-1.5 rounded-[7px] !px-2.5 text-sm !leading-5 [font-weight:550]">
                    <CdsIconGlyph glyph="" className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
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

  useEffect(() => {
    listFiles({ q: query, kind, status }).then(setFiles).catch(() => setFiles([]));
  }, [kind, query, status]);

  async function deleteCurrent(file: WorkspaceFile) {
    await deleteFile(file.id);
    setFiles((items) => items.filter((item) => item.id !== file.id));
  }

  return (
    <section className="mx-auto flex w-full max-w-[1216px] flex-col gap-2">
      <PageHeader
        title="Files"
        titleClassName="w-[656px]"
        description="Only files from the Default workspace are shown. To see other workspace's files, select a workspace."
        action={
          <div className="flex items-center gap-2">
            <a
              data-cds="Button"
              aria-label="View documentation"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-sm !leading-5 [font-weight:550] hover:bg-fill"
              href="https://docs.claude.com/en/docs/build-with-claude/files"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
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
                  <div className="group/cid flex items-center gap-2">
                    <span className="font-mono font-semibold">{shortId(file.id)}</span>
                    <CopyIdButton value={file.id} />
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
    </section>
  );
}

function FilesEmptyState({ language, onLanguageChange }: { language: string; onLanguageChange: (value: string) => void }) {
  const code = language === "Python" ? filesPythonTemplate : filesCurlTemplate;
  return (
    <div className="mt-2 flex w-full flex-col gap-3">
      <span className="text-sm leading-5 text-[#898781]">
        No files have been uploaded to the <span className="[font-weight:600]">Default</span> workspace. Copy the template below to upload your first file:
      </span>
      <div className="group relative flex flex-col overflow-hidden rounded-lg bg-black/[0.05]">
        <div className="flex h-9 shrink-0 items-center gap-2 pl-3 pr-2">
          <FilesLanguageMenu language={language} onLanguageChange={onLanguageChange} />
          <div className="ml-auto flex items-center gap-1">
            <a data-cds="Button" className="inline-flex h-6 w-[96px] items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[13px] leading-5 [font-weight:550] hover:bg-[#eeeeeb]" href="https://docs.claude.com/en/docs/build-with-claude/files">
              View docs
              <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-[#898781] text-[14px] [font-weight:628.5]" />
            </a>
            <CopyIconButton value={code} ariaLabel="Copy code" className="!h-6 !w-6 !gap-1.5 !rounded-md !px-0 !text-[13px] !leading-5 [font-weight:550]" />
          </div>
        </div>
        <div className="code-scroll-region min-h-0 flex-1 overflow-auto focus-visible:outline-none">
          <div className="px-3 pb-3 pt-3 font-mono text-[13px] leading-[21.125px] text-ink [overflow-wrap:anywhere]">
            {code.split("\n").map((line, index) => (
              <div key={`${line}-${index}`} className="relative min-h-[21px] whitespace-pre-wrap pl-10">
                <span className="absolute left-0 w-10 select-none pr-4 text-right text-[#898781]">{index + 1}</span>
                <span>{renderFilesCodeLine(line, language)}</span>
              </div>
            ))}
          </div>
        </div>
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
          <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-[#898781] text-[14px] [font-weight:628.5]" />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="DropdownButton"
          className="z-50 w-[128px] rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
          align="start"
          sideOffset={6}
        >
          <CdsDropdownMenu.RadioGroup value={language} onValueChange={onLanguageChange}>
            {["Python", "cURL"].map((option) => (
              <CdsDropdownMenu.RadioItem
                key={option}
                value={option}
                className="flex h-8 w-[120px] cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-sm leading-5 outline-none data-[highlighted]:bg-fill data-[state=checked]:bg-fill"
              >
                <span className="min-w-0 flex-1 truncate">{option}</span>
                <CdsDropdownMenu.ItemIndicator>
                  <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
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
            <CopyableIdText
              value={file.id}
              display={shortId(file.id)}
              className="relative -mx-1 -my-0.5 w-fit max-w-full cursor-pointer rounded-md px-1 py-0.5 font-mono text-sm text-muted transition-colors hover:bg-fill"
              textClassName="relative inline-block max-w-full truncate align-bottom font-mono text-sm text-muted"
            />
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
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  useEffect(() => {
    listSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  async function deleteCurrent(skill: SkillPackage) {
    await deleteSkill(skill.id);
    setSkills((items) => items.filter((item) => item.id !== skill.id));
  }

  return (
    <section className="mx-auto flex w-full max-w-[1216px] flex-col gap-4">
      <PageHeader
        title="Skills"
        description="Skills are repeatable and customizable instructions that Claude API can follow. Only skills from the Default workspace are shown. To see other workspace's skills, select a workspace."
        action={
          <div className="flex items-center gap-2">
            <HeaderCreateButton className="!w-[120px]" onClick={() => setDialogOpen(true)}>Create skill</HeaderCreateButton>
            <a
              data-cds="Button"
              className="cds-focus inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-sm !leading-5 text-ink [font-weight:550] hover:bg-fill"
              aria-label="View documentation"
              href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview"
            >
              <CdsIconGlyph glyph="" />
            </a>
          </div>
        }
      />
      <div className="mt-2 flex w-full flex-col border-t border-line">
        {skills.map((skill) => (
          <article
            key={skill.id}
            className="flex h-[137px] flex-col border-b border-line px-3 py-3 transition-colors hover:bg-fill focus-within:bg-fill"
            onMouseEnter={() => setHoveredSkillId(skill.id)}
            onMouseLeave={() => setHoveredSkillId((current) => (current === skill.id ? null : current))}
            onFocusCapture={() => setHoveredSkillId(skill.id)}
            onBlurCapture={() => setHoveredSkillId((current) => (current === skill.id ? null : current))}
          >
            <div className="mb-2 flex min-h-0 flex-1 items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="mb-0 text-base leading-6 [font-weight:550]">{skill.name}</h3>
                <p className="cds-line-clamp-2 max-w-[720px] whitespace-pre-wrap text-sm leading-5 text-[#898781]">{skill.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="icon"
                  className="!h-7 !w-7 !gap-1.5 !border-0 !px-0 !text-ink text-sm !leading-5 transition-opacity [font-weight:550]"
                  style={{ opacity: hoveredSkillId === skill.id ? 1 : 0 }}
                  aria-label={`View version history for ${skill.name}`}
                  onClick={() => setVersionSkillId(skill.id)}
                >
                  <CdsIconGlyph glyph="" />
                </Button>
                {skill.owner !== "Anthropic" ? <SkillActions onDelete={() => deleteCurrent(skill)} /> : null}
              </div>
            </div>
            <div className="flex h-[22px] flex-wrap items-center gap-2 text-xs leading-4 text-[#898781]">
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
  const [toolPermissionsOpen, setToolPermissionsOpen] = useState(false);

  useEffect(() => {
    if (id) getAgent(id).then(setAgent).catch(() => setAgent(null));
  }, [id]);

  if (!agent) return <EmptyState title="Agent not found" description="The selected agent could not be loaded." />;

  const currentAgent = agent;

  async function archiveCurrent() {
    const updated = await archiveAgent(currentAgent.id);
    setAgent(updated);
    setArchiveOpen(false);
    showToast("Agent archived.");
  }

  const agentDetailHeadingClass = "text-[#52514e] [font-weight:550]";
  const agentDetailBodyClass = "text-sm leading-5 text-[#52514e]";
  const agentDetailTabWidths: Record<string, string> = {
    Agent: "w-[65px]",
    Sessions: "w-[83px]",
    Deployments: "w-[114px]"
  };
  const toolPermissions = agent.tools === "agent_toolset_20260401" ? builtInToolPermissions : [];
  const toolPermissionsId = `${agent.id}-tool-permissions`;
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
    <section className="flex w-full max-w-none flex-col">
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
            <CopyableIdText value={agent.id} className="relative -mx-1 -my-0.5 w-fit max-w-full cursor-pointer rounded-md px-1 py-0.5 font-mono text-sm text-muted transition-colors hover:bg-fill" textClassName="relative inline-block max-w-full truncate align-bottom font-mono text-sm text-muted" />
            <span>·</span>
            <span>Last updated {agent.updatedLabel || "2 days ago"}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            className="!w-[71px] !gap-1.5 !rounded-[8px] !border-[0.5px] !border-[rgba(11,11,11,0.1)] !bg-white/50 !shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:!bg-[rgba(11,11,11,0.05)] active:!bg-[rgba(11,11,11,0.05)] active:scale-[0.975] [font-weight:550]"
            onClick={() => setEditOpen(true)}
          >
            <CdsIconGlyph glyph="" />
            Edit
          </Button>
          <AgentRowActions agent={agent} onArchive={() => setArchiveOpen(true)} onGuidedEdit={() => setEditOpen(true)} />
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
        <CdsTabs.Content value="agent" className="grid w-full max-w-3xl">
          <div>
            <Select.Root value={agent.version || "v1"} onValueChange={() => undefined}>
              <div data-cds="FieldSelect" className={`${topFilterShellClassName} w-[112px]`}>
                <Select.Trigger
                  data-cds="Button"
                  aria-label="Version"
                  className="cds-focus inline-flex h-8 min-w-0 flex-1 items-center gap-1.5 self-stretch rounded-none border-0 bg-transparent p-0 pl-2 pr-0 text-sm text-ink shadow-none"
                >
                  <span className="flex min-w-0 flex-1 items-baseline gap-1 whitespace-nowrap">
                    <span className="shrink-0 text-muted">Version:</span>
                    <Select.Value className="min-w-0 truncate font-mono text-[13px]">{agent.version || "v1"}</Select.Value>
                  </span>
                  <Select.Icon className="shrink-0">
                    <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
                  </Select.Icon>
                </Select.Trigger>
              </div>
              <Select.Portal>
                <Select.Content
                  position="popper"
                  sideOffset={8}
                  className="z-50 w-[256px] rounded-[12px] border-[0.5px] border-[rgba(11,11,11,0.1)] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
                >
                  <Select.Viewport>
                    {(agent.versions?.length ? agent.versions : [{ version: agent.version || "v1", createdAt: agent.createdAt }]).map((entry) => (
                      <Select.Item
                        key={entry.version}
                        value={entry.version}
                        className="grid h-[46px] cursor-pointer grid-cols-[minmax(0,1fr)_24px] items-center rounded-[8px] px-3 text-sm outline-none data-[highlighted]:bg-fill"
                      >
                        <Select.ItemText>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-mono text-sm leading-5 text-ink">{entry.version}</span>
                            <span className="truncate text-sm leading-5 text-[#898781]">{formatVersionCreatedLabel(entry.createdAt)}</span>
                          </span>
                        </Select.ItemText>
                        <Select.ItemIndicator className="justify-self-end">
                          <CdsIconGlyph glyph="" className="h-5 w-5 shrink-0 text-[#184f95] text-[20px] [font-weight:533.25]" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          <AgentConfigSection title="Model" headingClassName={agentDetailHeadingClass}>
            <div className={`mt-3 font-mono ${agentDetailBodyClass}`}>{agent.model}</div>
          </AgentConfigSection>
          <AgentConfigSection title="System prompt" headingClassName={agentDetailHeadingClass} separated>
            <div className="group/codeblock relative mt-2 rounded-[8px] bg-[#f9f9f7] px-4 py-4">
              <pre className="max-h-[120px] overflow-hidden whitespace-pre-wrap font-mono text-sm leading-5 text-ink">{agent.systemPrompt}</pre>
              <CopyIconButton
                value={agent.systemPrompt}
                ariaLabel="Copy to clipboard"
                className="absolute right-2 top-2 h-7 w-7 px-0 text-muted !opacity-0 transition-opacity hover:bg-white hover:text-[#52514e] focus-visible:!opacity-100 group-hover/codeblock:!opacity-100"
              />
            </div>
          </AgentConfigSection>
          <AgentConfigSection title="MCPs and tools" headingClassName={agentDetailHeadingClass} separated>
            <div className="mt-2 flex w-full flex-col overflow-hidden rounded-[8px] border-[0.5px] border-[rgba(11,11,11,0.1)] text-sm">
              <div className="flex items-center gap-3 py-3 pl-5 pr-3">
                <CdsIconGlyph glyph="" className="h-5 w-5 text-[#898781] text-[20px] [font-weight:433.25]" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm leading-5 text-ink [font-weight:550]">Built-in tools</span>
                  <span className="truncate font-mono text-xs leading-4 text-[#898781]">{agent.tools}</span>
                </div>
              </div>
              <button
                type="button"
                className="flex h-[46px] w-full items-center gap-2 rounded-[8px] border-t-[0.5px] border-[rgba(11,11,11,0.1)] py-3 pl-4 pr-10 text-left text-[#52514e] hover:bg-[#f9f9f7]"
                aria-label="Toggle tool permissions"
                aria-controls={toolPermissionsId}
                aria-expanded={toolPermissionsOpen}
                onClick={() => setToolPermissionsOpen((value) => !value)}
              >
                <CdsIconGlyph glyph="" className={`h-4 w-4 text-[16px] [font-weight:533.25] transition-transform ${toolPermissionsOpen ? "" : "-rotate-90"}`} />
                <span className="flex min-w-0 flex-1 items-center gap-2 text-sm leading-5 text-[#52514e]">
                  <span>Tool permissions</span>
                  <span className="inline-flex h-[22px] shrink-0 items-center rounded-[5.5px] bg-fill px-2 text-xs leading-[15px] text-[#52514e] [font-weight:550]">{toolPermissions.length}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs leading-4 text-[#898781] [font-weight:550]">
                  <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-[#006300] text-[14px] [font-weight:628.5]" />
                  Always allow
                </span>
              </button>
              {toolPermissionsOpen ? (
                <div id={toolPermissionsId} className="flex flex-col">
                  {toolPermissions.map((tool) => (
                    <div
                      key={tool.name}
                      className="grid min-h-[50px] grid-cols-[120px_minmax(0,1fr)_160px] items-center gap-6 border-t-[0.5px] border-[rgba(11,11,11,0.1)] px-10 py-2 text-sm leading-5"
                    >
                      <span className="font-mono text-sm leading-5 text-ink">{tool.name}</span>
                      <span className="min-w-0 truncate text-sm leading-5 text-[#898781]">{tool.description}</span>
                      <span className="flex shrink-0 items-center justify-end gap-1.5 text-xs leading-4 text-[#898781] [font-weight:550]">
                        <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-[#006300] text-[14px] [font-weight:628.5]" />
                        Always allow
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </AgentConfigSection>
          <AgentConfigSection title="Skills" headingClassName={agentDetailHeadingClass} separated>
            <p className="mt-2 text-xs leading-4 text-[#898781]">No skills configured.</p>
          </AgentConfigSection>
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
      <AgentArchiveDialog agentName={currentAgent.name} open={archiveOpen} onOpenChange={setArchiveOpen} onConfirm={archiveCurrent} />
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
    <div className="grid gap-2">
      <div className="flex h-8 flex-wrap items-center gap-2">
        <FieldSelect
          label="Created"
          value={created}
          options={["All time", "Last 24 hours", "Last 7 days", "Last 30 days"]}
          onValueChange={setCreated}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Version"
          value={version}
          options={versionOptions}
          onValueChange={setVersion}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Deployment"
          value={deployment}
          options={deploymentOptions}
          onValueChange={setDeployment}
          triggerShellClassName={topFilterShellClassName}
        />
        <FieldSelect
          label="Status"
          value={status}
          options={["All", "Active", "Idle", "Archived"]}
          onValueChange={setStatus}
          triggerShellClassName={topFilterShellClassName}
        />
      </div>
      <DataTable
        className="-m-2 w-[1066px] overflow-x-auto p-2 [mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%-var(--fade-right,0px)),transparent)]"
        tableClassName="w-[1066px] border-separate border-spacing-0 whitespace-nowrap"
        rows={visibleSessions}
        getKey={(session) => session.id}
        columns={[
          {
            key: "id",
            header: "ID",
            width: "160px",
            render: (session) => (
              <div className="group/cid flex items-center gap-2">
                <span className="font-mono font-semibold">{shortId(session.id)}</span>
                <CopyIdButton value={session.id} />
              </div>
            )
          },
          {
            key: "name",
            header: "Name",
            width: "180px",
            render: (session) => (
              <Link className="block truncate font-medium hover:underline" to={`/sessions/${session.id}`}>
                {session.name}
              </Link>
            )
          },
          { key: "status", header: "Status", width: "130px", render: (session) => <Badge tone={sessionTone(session.status)}>{session.status}</Badge> },
          { key: "version", header: "Version", width: "160px", render: () => <span className="font-mono">{agentVersion}</span> },
          { key: "tokens", header: "Tokens in / out", width: "140px", render: (session) => <span className="text-ink">{session.tokens}</span> },
          { key: "created", header: "Created", width: "200px", render: (session) => <span className="text-muted">{agentSessionCreatedLabel(session)}</span> }
        ]}
        actionsWidth="56px"
        renderActions={(session) => <SessionRowActions session={session} onArchive={() => setArchivingSession(session)} />}
        emptyRowClassName="h-[317px]"
        emptyState={
          <div className="flex translate-y-10 flex-col items-center justify-center text-center">
            <div className="text-sm leading-5 text-ink [font-weight:550]">No sessions yet</div>
            <div className="mt-1 text-sm leading-5 text-[#898781]">Run this agent to create a session.</div>
          </div>
        }
      />
      <div className="mt-3 flex gap-2">
        <PaginationButton direction="previous" aria-label="Previous page" disabled />
        <PaginationButton direction="next" aria-label="Next page" disabled />
      </div>
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
          actionsHeaderAlign="right"
          columns={[
            {
              key: "id",
              header: "ID",
              width: "160px",
              render: (deployment) => (
                <div className="group/cid flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono font-semibold">{shortId(deployment.id)}</span>
                  <CopyIdButton value={deployment.id} />
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
        <div className="flex h-[268px] flex-col items-center justify-center py-12 text-center">
          <div aria-hidden="true" className="mb-2 flex h-16 w-16 items-center justify-center text-ink">
            <Boxes className="h-14 w-14 stroke-[1.6]" />
          </div>
          <p className="text-lg leading-7 text-ink [font-weight:550]">No deployments</p>
          <p className="mt-1 text-sm leading-5 text-[#898781]">Deploy this agent to run it on a schedule, via webhook, or manually.</p>
          <Button variant="secondary" className="mt-4 h-8 w-[174px] gap-1.5 rounded-[8px] bg-white/50 px-0 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)] [font-weight:550]" onClick={() => setDialogOpen(true)}>
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
        initialEnvironmentId="env_01UTaKkbFknSkQNEsZjUARMh"
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
    system: [
      "You are a research agent. Given a question or topic:",
      "",
      "1. Break it into 3-5 concrete sub-questions that cover the topic.",
      "2. For each sub-question, run targeted web searches and prefer primary sources, official documentation, standards, papers, or other authoritative references.",
      "3. Read sources carefully and extract specific claims, data points, and short attributed evidence.",
      "4. Synthesize a report that answers the original question, organized by sub-question, with citations for non-obvious claims.",
      "5. Close with a confidence and gaps section that calls out uncertainty, source disagreement, and follow-up research needed."
    ].join("\n")
  },
  {
    name: "Structured extractor",
    description: "Parses unstructured text into a typed JSON schema.",
    system: [
      "You extract structured data from unstructured input. Given raw material and a target JSON schema:",
      "",
      "1. Read the schema first and identify required fields, optional fields, enum values, and formatting constraints.",
      "2. Scan the source input field by field. Prefer explicit values over inference, and use null for genuinely missing required values instead of guessing.",
      "3. Normalize extracted values as needed: trim whitespace, coerce dates to ISO 8601, normalize currencies and IDs, and map synonyms to canonical enum values.",
      "4. Return only a JSON object or array that validates against the schema. Do not include prose or markdown fences.",
      "5. If the source is ambiguous, choose the most conservative interpretation and include extraction notes only when the schema allows them."
    ].join("\n")
  },
  {
    name: "Field monitor",
    description: "Scans software blogs for a topic and writes a weekly what-changed brief.",
    system: [
      "You track a fast-moving technical field. Given a topic and a lookback window, defaulting to 7 days:",
      "",
      "1. Search high-signal sources for posts, papers, and discussions in the window that match the topic.",
      "2. Cluster findings by theme rather than source. Name each cluster by the claim or shift it represents.",
      "3. For each cluster, write a one-paragraph synthesis, list the strongest sources, and add a practical so-what line for builders.",
      "4. Separately list people or teams whose posts drove the most useful discussion this window.",
      "5. Write a dated digest page to Notion under the team's field-watch database.",
      "",
      "Be ruthless about signal. A production post about what broke is signal; a paper that restates a known result with a new benchmark is usually noise."
    ].join("\n")
  },
  {
    name: "Support agent",
    description: "Answers customer questions from your docs and knowledge base, and escalates when needed.",
    system: [
      "You are a customer support agent. For each inbound question:",
      "",
      "1. Search the product docs and knowledge base in Notion for an answer. Quote the relevant passage and link to the source — never paraphrase policy from memory.",
      "2. Draft a reply in the customer's channel: direct answer first, then the supporting source link, then one proactive next step if relevant.",
      "3. If you can't answer with ≥80% confidence, don't guess — post a handoff message to the internal escalation Slack channel with the full question, what you searched, what you found, and your best hypothesis. Tell the customer a human is taking a look.",
      "",
      "Match the customer's tone. Be warm but don't pad. One emoji max."
    ].join("\n")
  },
  {
    name: "Incident commander",
    description: "Triages a Sentry alert, opens a Linear incident ticket, and runs the Slack war room.",
    system: [
      "You are an on-call incident commander. When handed a Sentry issue ID or an error fingerprint:",
      "",
      "1. Pull the full event payload, stack trace, release tag, and affected-user count from Sentry.",
      "2. Grep the repo for the top frame's file path and surrounding commits (last 72h).",
      "3. Open a Linear incident ticket with severity, suspected blast radius, and your rollback recommendation.",
      "4. Post a threaded status to the incident Slack channel: what broke, who's looking, ETA for next update.",
      "5. Every 15 minutes, re-check Sentry event volume and update the thread until the user closes the incident.",
      "",
      "Be decisive. If you're >70% confident it's a specific deploy, say so and recommend the revert."
    ].join("\n")
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
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [startingPointOpen, setStartingPointOpen] = useState(true);
  const [startingPointMode, setStartingPointMode] = useState<"describe" | "template">("describe");
  const [selectedTemplate, setSelectedTemplate] = useState(agentStartingTemplates[0]);
  const [format, setFormat] = useState<"YAML" | "JSON">("YAML");
  const [configYaml, setConfigYaml] = useState(defaultAgentYaml());
  const jsonConfig = useMemo(() => JSON.stringify(agentConfigFromYaml(configYaml), null, 2), [configYaml]);
  const startingPointPanelId = "create-agent-starting-point-panel";
  const startingPointPanelHeight = startingPointOpen ? (startingPointMode === "template" ? 160 : 160) : 0;

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
    setStartingPointOpen(true);
    setStartingPointMode("describe");
    setSelectedTemplate(agentStartingTemplates[0]);
    setConfigYaml(defaultAgentYaml());
    navigate(`/agents/${agent.id}`);
  }

  return (
    <ConsoleDialog
      title="Create agent"
      description="Start from a template or describe what you need."
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="flex w-[720px] max-w-[calc(100vw-32px)] flex-col !max-h-[calc(100dvh-2rem)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      descriptionClassName="mt-1 text-sm leading-5 text-[#52514e]"
      closeButtonClassName="h-[31px] w-[31px] !gap-1.5 !rounded-[8px] !px-0 [font-weight:550]"
      closeLabel="Close"
      overlayClassName="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
    >
      <div className="flex h-[calc(65vh+84px)] max-h-[calc(100dvh-99px)] flex-col overflow-y-auto px-6 pb-6 pt-3">
        <button
          aria-controls={startingPointPanelId}
          aria-expanded={startingPointOpen}
          className="mb-[11px] flex h-5 w-full items-center gap-1.5 rounded-[8px] text-sm text-[#52514e]"
          type="button"
          onClick={() => setStartingPointOpen((current) => !current)}
        >
          <CdsIconGlyph glyph="" className={`h-4 w-4 shrink-0 text-[#52514e] text-[16px] [font-weight:533.25] transition-transform ${startingPointOpen ? "rotate-90" : ""}`} />
          <span className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="whitespace-nowrap text-ink [font-weight:580]">Starting point</span>
            <span className="flex min-w-0 gap-2 text-[#898781]" style={{ opacity: startingPointOpen ? 0 : 1 }}>
              <span>·</span>
              <span>{selectedTemplate.name}</span>
            </span>
          </span>
        </button>
        <div
          id={startingPointPanelId}
          className="overflow-hidden transition-[height] duration-150 ease-out"
          data-open={startingPointOpen ? "" : undefined}
          style={{ height: startingPointPanelHeight, transitionDuration: "0s" }}
        >
          <div className={startingPointMode === "template" ? "h-[160px] overflow-hidden" : ""}>
            <div className="relative grid h-8 grid-cols-2 rounded-[8px] bg-[rgba(11,11,11,0.05)] p-px text-sm" role="radiogroup" aria-label="Starting point">
              <div
                className={`absolute bottom-px top-px w-[calc(50%-1px)] rounded-[7px] bg-white shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1),0_1px_2px_rgba(0,0,0,0.05)] transition-[left] duration-150 ${
                  startingPointMode === "template" ? "left-1/2" : "left-px"
                }`}
                aria-hidden="true"
              />
              <button
                aria-checked={startingPointMode === "describe"}
                className={`relative z-[1] h-[30px] rounded-[6px] px-3 ${startingPointMode === "describe" ? "text-ink" : "text-muted"}`}
                role="radio"
                type="button"
                onClick={() => setStartingPointMode("describe")}
              >
                Describe your agent
              </button>
              <button
                aria-checked={startingPointMode === "template"}
                className={`relative z-[1] h-[30px] rounded-[6px] px-3 ${startingPointMode === "template" ? "text-ink" : "text-muted"}`}
                role="radio"
                type="button"
                onClick={() => setStartingPointMode("template")}
              >
                Template
              </button>
            </div>
            {startingPointMode === "describe" ? (
              <div className="mt-[12px] min-h-[116px] rounded-[8px] border border-[#d4d0c8] bg-white px-3 pb-3 pt-3">
                <textarea
                  className="h-[45px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-[22.75px] outline-none placeholder:text-muted"
                  aria-label="Describe your agent"
                  placeholder="Summarizes new GitHub PRs and posts a digest to Slack."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <div className="mt-[10px] flex justify-end">
                  <Button
                    variant="secondary"
                    className="h-[27px] w-[82px] !gap-1.5 rounded-control !border-line !bg-white !px-[10px] text-sm [font-weight:550] hover:!bg-fill"
                    disabled={!description.trim()}
                    onClick={generateFromDescription}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid h-[245px] auto-rows-min grid-cols-3 gap-3 bg-white">
                {agentStartingTemplates.map((template, index) => (
                  <button
                    key={template.name}
                    className={`flex w-full cursor-pointer flex-col items-start overflow-hidden rounded-[8px] bg-white p-3 text-left text-sm transition hover:bg-fill ${index >= 3 ? "h-[138px]" : "h-[95px]"} ${selectedTemplate.name === template.name ? "border-[1.5px] border-black/20" : "border-[0.5px]"}`}
                    style={selectedTemplate.name === template.name ? undefined : { borderColor: "rgba(11, 11, 11, 0.1)" }}
                    type="button"
                    onClick={() => selectTemplate(template)}
                  >
                    <span className="text-sm leading-5 text-ink">{template.name}</span>
                    <span className="mt-0.5 text-xs leading-4 text-muted">{template.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-[17px] flex min-h-0 flex-1 flex-col">
          <h2 className="mb-[11px] text-sm leading-5 [font-weight:580]">Agent config</h2>
          <div className="min-h-[180px] flex-1 overflow-hidden rounded-cds border border-line bg-white">
            <div className="flex h-[43px] items-center justify-between pb-0 pl-3 pr-2 pt-0">
              <div className="flex h-[27px] -translate-x-px text-sm leading-5" role="tablist" aria-label="Agent config format">
                <button
                  className={`h-[27px] w-[59px] rounded-full px-[10px] [font-weight:550] ${format === "YAML" ? "bg-fill text-ink" : "text-muted"}`}
                  role="tab"
                  aria-selected={format === "YAML"}
                  onClick={() => setFormat("YAML")}
                >
                  YAML
                </button>
                <button
                  className={`h-[27px] w-[58px] rounded-full px-[10px] [font-weight:550] ${format === "JSON" ? "bg-fill text-ink" : "text-muted"}`}
                  role="tab"
                  aria-selected={format === "JSON"}
                  onClick={() => setFormat("JSON")}
                >
                  JSON
                </button>
              </div>
              <CopyIconButton value={format === "YAML" ? configYaml : jsonConfig} ariaLabel="Copy code" className="h-[27px] w-[27px] !gap-1.5 translate-x-px rounded-control !px-0 [font-weight:550]" />
            </div>
            {format === "YAML" ? (
              <div className="relative h-[calc(100%-43px)] min-h-0">
                <span className="sr-only">Tab inserts indentation. Press Escape then Tab to move focus out of the editor.</span>
                <HighlightedConfigTextarea
                  aria-label="Agent config YAML. Tab inserts indentation. Press Escape then Tab to move focus out of the editor."
                  value={configYaml}
                  onChange={(event) => setConfigYaml(event.target.value)}
                  language="YAML"
                />
              </div>
            ) : (
              <div className="h-[calc(100%-43px)] min-h-0">
                <CodeBlockWithLineNumbers source={jsonConfig} language="JSON" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-[15px] flex justify-end">
          <Button className="h-[31px] w-[110px] !gap-1.5 translate-x-px !rounded-[8px] !px-0 [font-weight:550]" onClick={submit}>Create agent</Button>
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
      contentClassName="h-[670px] w-[720px] max-w-[calc(100vw-32px)] !max-h-[calc(100dvh-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-8 w-8 !rounded-[8px] !px-0"
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
            <CopyIconButton value={format === "YAML" ? configYaml : jsonConfig} ariaLabel="Copy code" className="!h-7 !w-7 !gap-1.5 rounded-[7px] !px-0 [font-weight:550]" iconClassName="h-4 w-4 text-current" />
          </div>
          <div className="relative flex-1 overflow-auto px-3 pb-3 pt-[13px] text-ink">
            <p className="sr-only">Tab inserts indentation. Press Escape then Tab to move focus out of the editor.</p>
            {format === "YAML" ? (
              <HighlightedConfigTextarea
                className="h-[475px] px-0 py-0"
                value={configYaml}
                onChange={(event) => setConfigYaml(event.target.value)}
                language="YAML"
              />
            ) : (
              <div className="h-[475px]">
                <CodeBlockWithLineNumbers source={jsonConfig} language="JSON" className="py-0 pl-3" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="h-8 w-[139px] !rounded-[8px] px-3 [font-weight:550]" onClick={submit}>Save new version</Button>
        </div>
      </div>
    </ConsoleDialog>
  );
}

function CreateSessionResourceMenu({ onAdd, onOpenChange }: { onAdd: (kind: SessionResourceKind) => void; onOpenChange?: (open: boolean) => void }) {
  return (
    <CdsDropdownMenu.Root onOpenChange={onOpenChange}>
      <CdsDropdownMenu.Trigger asChild>
        <button
          type="button"
          data-cds="Button"
          className="cds-focus inline-flex h-[27px] w-[121px] items-center justify-center gap-1.5 justify-self-start rounded-[8px] bg-transparent px-3 text-sm text-ink outline-none [font-weight:550] hover:bg-fill"
        >
          <CdsIconGlyph glyph="" className="-ml-1 h-5 w-5 text-ink text-[20px] [font-weight:433.25]" />
          <span>Resource</span>
          <CdsIconGlyph glyph="" className="h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-[190px] rounded-[12px] bg-white p-1 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          {sessionResourceKinds.map((kind) => (
            <CdsDropdownMenu.Item
              key={kind}
              className="flex h-8 w-full cursor-pointer items-center whitespace-nowrap rounded-[8px] px-2.5 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-fill"
              onSelect={() => onAdd(kind)}
            >
              {kind}
            </CdsDropdownMenu.Item>
          ))}
        </CdsDropdownMenu.Content>
      </CdsDropdownMenu.Portal>
    </CdsDropdownMenu.Root>
  );
}

function CreateSessionResourceCard({ kind, onRemove }: { kind: SessionResourceKind; onRemove: () => void }) {
  const fieldClass = "grid gap-[5px]";
  const labelClass = "text-sm leading-[20px] text-[#52514e] [font-weight:430]";
  const inputClass = "h-[35px] rounded-[8px] border border-line bg-white px-3 text-sm leading-5 text-ink outline-none placeholder:text-[#898781] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35";
  const resourceButtonClass = "flex h-[35px] items-center justify-between rounded-[8px] border border-line bg-white px-3 text-sm leading-5 text-ink outline-none hover:bg-fill";

  return (
    <div className="rounded-[8px] border border-line bg-white/50 px-3 pb-3 pt-2">
      <div className="mb-3 flex h-7 items-center justify-between">
        <div className="flex items-center gap-2 text-sm leading-5 text-ink [font-weight:550]">
          <span>{kind}</span>
        </div>
        <button type="button" aria-label="Remove resource" className="grid h-[27px] w-[27px] place-items-center rounded-[8px] text-ink hover:bg-fill" onClick={onRemove}>
          <CdsIconGlyph glyph="" className="h-4 w-4 text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {kind === "File" ? (
        <div className="grid gap-3">
          <div className={fieldClass}>
            <span className={labelClass}>File ID *</span>
            <input className={inputClass} placeholder="file_abc123..." />
          </div>
          <div className={fieldClass}>
            <span className={labelClass}>Mount Path *</span>
            <input className={inputClass} placeholder="/uploads/myfile.txt" />
            <span className="text-xs leading-4 text-[#52514e]">Must start with /uploads/</span>
          </div>
        </div>
      ) : kind === "GitHub Repository" ? (
        <div className="grid gap-3">
          <div className={fieldClass}>
            <span className={labelClass}>URL *</span>
            <input className={inputClass} placeholder="https://github.com/owner/repo" />
          </div>
          <div className={fieldClass}>
            <span className={labelClass}>Authorization Token *</span>
            <input className={inputClass} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldClass}>
              <span className={labelClass}>Checkout</span>
              <button type="button" className={resourceButtonClass}>
                <span>None</span>
              </button>
            </div>
          </div>
          <div className={fieldClass}>
            <span className={labelClass}>Mount Path</span>
            <input className={inputClass} placeholder="/workspace/repo-name (default)" />
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className={fieldClass}>
            <div className="flex items-center justify-between">
              <span className={labelClass}>Memory store *</span>
              <DialogTextLink href="/memory-stores">Manage memory stores</DialogTextLink>
            </div>
            <button type="button" role="combobox" aria-label="Memory store" className={resourceButtonClass}>
              <span className="text-[#898781] [font-weight:430]">Select a memory store</span>
              <CdsIconGlyph glyph="" className="h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
            </button>
          </div>
          <div className={fieldClass}>
            <span className={labelClass}>Access</span>
            <button type="button" className={resourceButtonClass}>
              <span>Read &amp; write</span>
            </button>
          </div>
          <div className={fieldClass}>
            <span className={labelClass}>Instructions (optional)</span>
            <textarea className="h-[65px] resize-none rounded-[8px] border border-line bg-white px-3 py-2 text-sm leading-5 text-ink outline-none placeholder:text-[#898781] focus-visible:ring-2 focus-visible:ring-[#c6613f]/35" placeholder="Tell the agent what this store contains and when to use it." />
          </div>
        </div>
      )}
    </div>
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
  const [vaults, setVaults] = useState<string[]>([]);
  const [vaultAcknowledged, setVaultAcknowledged] = useState(false);
  const [resources, setResources] = useState<SessionResourceKind[]>([]);
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const [openPicker, setOpenPicker] = useState<"agent" | "environment" | "vault" | null>(null);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const dialogBodyRef = useRef<HTMLDivElement>(null);
  const canCreate = Boolean(agentId && environmentId && (!vaults.length || vaultAcknowledged));
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const dialogHeightClass = resources.length ? "h-[706px]" : resourceMenuOpen ? "h-[650px]" : "h-[606px]";

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setAgentId(defaultSessionAgentId);
    setEnvironmentId(defaultSessionEnvironmentId);
    setVaults(defaultSessionVaultId ? [defaultSessionVaultId] : []);
    setVaultAcknowledged(false);
    setResources([]);
    setOpenPicker(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const resetDialogScroll = () => {
      dialogBodyRef.current?.scrollTo({ top: 0 });
    };
    requestAnimationFrame(resetDialogScroll);
    window.setTimeout(resetDialogScroll, 0);
    window.setTimeout(resetDialogScroll, 80);
  }, [open, resourceMenuOpen, resources.length]);

  async function submit() {
    if (!canCreate) return;
    const session = await createSession({
      title,
      agentId,
      environmentId,
      vaults,
      resources
    });
    onCreated(session);
    onOpenChange(false);
    setTitle("");
    setAgentId("");
    setEnvironmentId("");
    setVaults([]);
    setVaultAcknowledged(false);
    setResources([]);
  }

  return (
    <>
      <ConsoleDialog
        title="Create session"
        description="Set up an instance of your agent in its environment."
        open={open}
        onOpenChange={onOpenChange}
        contentClassName={`flex flex-col ${dialogHeightClass} !max-h-[calc(100dvh-32px)] w-[706px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]`}
        headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
        titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
        descriptionClassName="mt-1 text-sm text-[#52514e]"
        closeButtonClassName="h-[31px] w-[31px] !gap-1.5 !rounded-[8px] !px-0 [font-weight:550]"
        closeLabel="Close"
        overlayClassName="fixed inset-0 z-40 bg-black/40"
      >
        <div ref={dialogBodyRef} data-testid="create-session-scroll-body" className="min-h-0 flex-1 overflow-y-auto px-6 pb-0 pt-[10px]">
          <div className="grid gap-4">
            <label className={`grid gap-[7px] ${fieldLabelClass}`}>
              Title
              <TextInput
                className="h-8 border-0 bg-white/50 !rounded-[8px] px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
                placeholder="Optional – name this run"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabelClass}>Agent</label>
                <DialogTextLink href="/agents">Manage agents</DialogTextLink>
              </div>
              <CreateSessionAgentPicker
                value={agentId}
                open={openPicker === "agent"}
                onOpenChange={(nextOpen) => setOpenPicker(nextOpen ? "agent" : null)}
                onValueChange={setAgentId}
                onCreateNewAgent={() => setCreateAgentOpen(true)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabelClass}>Environment</label>
                <DialogTextLink href="/environments">Manage environments</DialogTextLink>
              </div>
              <CreateSessionEnvironmentPicker
                value={environmentId}
                open={openPicker === "environment"}
                onOpenChange={(nextOpen) => setOpenPicker(nextOpen ? "environment" : null)}
                onValueChange={setEnvironmentId}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabelClass}>Credential vaults</label>
                <DialogTextLink href="/vaults">Manage credential vaults</DialogTextLink>
              </div>
              <CreateSessionVaultPicker
                value={vaults}
                open={openPicker === "vault"}
                onOpenChange={(nextOpen) => setOpenPicker(nextOpen ? "vault" : null)}
                onValueChange={(nextVaults) => {
                  setVaults(nextVaults);
                  setVaultAcknowledged(false);
                }}
              />
            </div>
            {vaults.length ? (
              <label className="ml-3 mr-3 mt-2 mb-[13px] flex min-h-[39px] cursor-pointer items-start gap-3 text-left text-sm leading-5 text-ink">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-white shadow-[inset_0_0_0_1px_rgba(11,11,11,0.18)]">
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={vaultAcknowledged}
                    onChange={(event) => setVaultAcknowledged(event.target.checked)}
                  />
                  {vaultAcknowledged ? <CdsIconGlyph glyph="" className="h-4 w-4 text-[#184f95] text-[16px] [font-weight:700]" /> : null}
                </span>
                <span>I own or am authorized to use this vault. I understand this means this agent can assume the identity granted by this vault.</span>
              </label>
            ) : null}
            <div className="grid gap-[7px]">
              <label className={fieldLabelClass}>Resources</label>
              <p className="text-[13px] leading-[18px] text-[#898781]">Mount files, GitHub repositories, or memory stores into the session.</p>
              {resources.length ? (
                <div className="grid gap-3 pt-1">
                  {resources.map((resource, index) => (
                    <CreateSessionResourceCard
                      key={`${resource}-${index}`}
                      kind={resource}
                      onRemove={() => setResources((current) => current.filter((_, resourceIndex) => resourceIndex !== index))}
                    />
                  ))}
                </div>
              ) : null}
              <CreateSessionResourceMenu
                onAdd={(kind) => {
                  setResources((current) => [...current, kind]);
                }}
                onOpenChange={(nextOpen) => {
                  setResourceMenuOpen(nextOpen);
                  if (nextOpen) setOpenPicker(null);
                }}
              />
            </div>
          </div>
          <div className="sticky bottom-0 -mx-6 mt-[37px] flex justify-end bg-white px-6 pb-[23px] pt-0">
            <Button className="h-[31px] w-[122px] !gap-1.5 !rounded-[8px] !px-3 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create session</Button>
          </div>
        </div>
      </ConsoleDialog>
      <CreateAgentDialog
        open={createAgentOpen}
        onOpenChange={setCreateAgentOpen}
        onCreated={(agent) => {
          setAgentId(agent.id);
          setCreateAgentOpen(false);
        }}
      />
    </>
  );
}

function DialogTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      data-cds="TextLink"
      className="group/tl inline-flex items-baseline gap-0 rounded-[2px] text-xs leading-4 text-[#184f95] no-underline outline-none focus-visible:shadow-[0_0_0_2px_rgba(11,11,11,0.18)]"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="underline underline-offset-[3px] decoration-[color-mix(in_srgb,currentColor,transparent_60%)] transition group-hover/tl:decoration-current group-focus-visible/tl:decoration-current">
        {children}
      </span>
      <CdsIconGlyph glyph="" className="h-4 w-4 self-center text-current text-[16px] [font-weight:533.25]" />
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}

function CreateSessionAgentPicker({
  value,
  open,
  onOpenChange,
  onValueChange,
  onCreateNewAgent
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onCreateNewAgent: () => void;
}) {
  const selected = sessionAgentOptions.find((option) => option.value === value);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = sessionAgentOptions.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const focusSearch = () => searchInputRef.current?.focus();
    const frame = window.requestAnimationFrame(focusSearch);
    const timer = window.setTimeout(focusSearch, 40);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <Select.Root
      value={value || undefined}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={(nextValue) => {
        onValueChange(nextValue);
        onOpenChange(false);
      }}
    >
      <div className={createSessionSelectShellClass}>
        <Select.Trigger
          data-cds="Button"
          className={createSessionSelectTriggerClass}
        >
          <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-muted [font-weight:430]"}`}>{selected?.name ?? "Select an agent"}</span>
          <Select.Icon className="shrink-0">
            <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
          </Select.Icon>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={7}
          data-cds="ComboboxPopover"
          className="z-50 flex max-h-[320px] w-[672px] flex-col overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] shrink-0 items-center border-b border-line px-4 py-2">
            <input
              ref={searchInputRef}
              className={createSessionSearchInputClass}
              aria-label="Search agents"
              autoFocus
              placeholder="Search agents"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDownCapture={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <Select.Viewport className="max-h-[230px] overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex min-h-[48px] w-full select-none items-center gap-2 rounded-[8px] px-3 py-1 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-fill"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Select.ItemText>
                    <span className="block truncate">{option.name}</span>
                  </Select.ItemText>
                  <span className="truncate text-xs leading-4 text-[#898781]">{option.updated}</span>
                </div>
                <Select.ItemIndicator>
                  <Check className="h-4 w-4 shrink-0 text-[#898781]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <div className="mt-[5px] shrink-0 p-1">
            <button
              type="button"
              className="flex min-h-[32px] w-full items-center gap-2 rounded-[8px] px-3 text-left text-sm leading-5 text-ink outline-none hover:bg-fill focus-visible:bg-fill"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onOpenChange(false);
                onCreateNewAgent();
              }}
            >
              <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:433.25]" />
              <span>Create new agent</span>
            </button>
          </div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function CreateSessionEnvironmentPicker({
  value,
  open,
  onOpenChange,
  onValueChange
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const selected = sessionEnvironmentOptions.find((option) => option.value === value);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = sessionEnvironmentOptions.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const focusSearch = () => searchInputRef.current?.focus();
    const frame = window.requestAnimationFrame(focusSearch);
    const timer = window.setTimeout(focusSearch, 40);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <Select.Root
      value={value || undefined}
      open={open}
      onOpenChange={onOpenChange}
      onValueChange={(nextValue) => {
        onValueChange(nextValue);
        onOpenChange(false);
      }}
    >
      <div className={createSessionSelectShellClass}>
        <Select.Trigger
          data-cds="Button"
          className={createSessionSelectTriggerClass}
        >
          <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-muted [font-weight:430]"}`}>{selected?.name ?? "Select an environment"}</span>
          <Select.Icon className="shrink-0">
            <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
          </Select.Icon>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          data-cds="ComboboxPopover"
          className="z-50 max-h-[238px] w-[672px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] items-center border-b border-line px-4 py-2">
            <input
              ref={searchInputRef}
              className={createSessionSearchInputClass}
              aria-label="Search environments"
              autoFocus
              placeholder="Search environments"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDownCapture={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <Select.Viewport className="max-h-[192px] overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex min-h-[48px] w-full select-none items-center gap-2 rounded-[8px] px-3 py-1 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-fill"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Select.ItemText>
                    <span className="block truncate">{option.name}</span>
                  </Select.ItemText>
                  <span className="truncate text-xs leading-4 text-[#898781]">
                    {option.updated}
                    <span className="mx-1.5">·</span>
                    {option.type}
                  </span>
                </div>
                <Select.ItemIndicator>
                  <Check className="h-4 w-4 shrink-0 text-[#898781]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
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
  const lockedAgentId = mode === "edit" && deployment ? deployment.agentId : initialAgentId;
  const lockedAgentName = mode === "edit" && deployment ? deployment.agentName : initialAgentName;
  const lockedAgentVersion = mode === "edit" && deployment ? deployment.agentVersion : initialAgentVersion;
  const pickerEnvironmentId = mode === "edit" && deployment ? deployment.environmentId : initialEnvironmentId;
  const pickerEnvironmentName = mode === "edit" && deployment ? deployment.environmentName : initialEnvironmentName;
  const scopedAgent = Boolean(lockedAgentId);
  const dialogHeightClass = mode === "edit" ? "h-[calc(100dvh-32px)]" : trigger === "Schedule" ? "h-auto" : "h-[718px]";

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
      contentClassName={`${dialogHeightClass} w-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]`}
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      descriptionClassName="mt-1 text-sm text-[#52514e]"
      closeButtonClassName="h-8 w-8 !rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="max-h-[calc(100dvh-116px)] overflow-y-auto px-6 pb-0 pt-4">
        <div className="grid gap-5">
          <label className={`grid gap-2 ${fieldLabelClass}`}>
            Name
            <TextInput
              className="h-8 border-0 bg-white/50 !rounded-[8px] px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="Nightly inbox triage"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {scopedAgent ? (
            <div className="grid grid-cols-[300px_160px] gap-3">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className={fieldLabelClass}>Agent</label>
                  <DialogTextLink href={`/agents/${lockedAgentId}`}>View agent</DialogTextLink>
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
                  <DialogTextLink href="/agents">Manage agents</DialogTextLink>
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
                <DialogTextLink href="/agents">Manage agents</DialogTextLink>
              </div>
              <DeploymentAgentPicker value={agentId} onValueChange={selectAgent} wide />
            </div>
          )}
          <label className={`grid gap-2 ${fieldLabelClass}`}>
            Initial message
            <textarea
              className="cds-focus h-14 resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="Summarize today's support tickets and post to #digest"
              value={initialMessage}
              onChange={(event) => setInitialMessage(event.target.value)}
            />
            <span className="text-[13px] font-normal leading-[18px] text-muted">Sent to the agent at the start of every run.</span>
          </label>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>Environment</label>
              <DialogTextLink href="/environments">Manage environments</DialogTextLink>
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
              <label className={fieldLabelClass}>
                Credential vaults<span className="ml-1.5 text-muted [font-weight:430]">(optional)</span>
              </label>
              <DialogTextLink href="/vaults">Manage credential vaults</DialogTextLink>
            </div>
            <DeploymentVaultPicker value={vault} onValueChange={setVault} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className={fieldLabelClass}>
                Memory stores<span className="ml-1.5 text-muted [font-weight:430]">(optional)</span>
              </label>
              <DialogTextLink href="/memory-stores">Manage memory stores</DialogTextLink>
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
        <div className="mt-5 flex justify-end">
          <Button className={`h-8 !rounded-[8px] px-0 [font-weight:550] ${mode === "edit" ? "w-[51px]" : "w-[71px]"}`} onClick={submit} disabled={!canCreate}>{mode === "edit" ? "Save" : "Create"}</Button>
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

const deploymentPickerShellClass = "h-8 w-[472px] rounded-[8px] bg-white/50 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]";

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
  const [search, setSearch] = useState("");
  const selected = deploymentAgentOptions.find((option) => option.value === value);
  const filteredOptions = deploymentAgentOptions.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div data-cds="Field" className={`relative ${wide ? "w-[472px]" : "w-[300px]"}`}>
      <div className={`${deploymentPickerShellClass} ${wide ? "" : "!w-[300px]"}`}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment agent"
          className={`flex h-8 min-w-0 items-center gap-1.5 rounded-none bg-transparent p-0 pl-2 text-left text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#c6613f]/35 ${wide ? "w-[464px]" : "w-[292px]"}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">
            <span className={selected ? "" : "font-normal text-muted [font-weight:430]"}>{selected?.name ?? "Select an agent"}</span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 max-h-[320px] w-[472px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] items-center border-b border-line px-4 py-2">
            <input
              className={createSessionSearchInputClass}
              aria-label="Search deployment agents"
              placeholder="Search agents by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <div role="listbox" className="grid max-h-[275px] gap-0 overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex min-h-[48px] w-full items-center justify-between rounded-[8px] px-3 py-1 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="truncate text-[13px] leading-[18px] text-muted">{option.updated}</span>
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
  const [search, setSearch] = useState("");
  const options = [
    { value: initialEnvironmentId || defaultDeploymentEnvironmentId, name: initialEnvironmentName || "managed-ssh-debug-env", updated: "Jun 16", host: "Cloud" },
    { value: "env_01LiiuDCwZBtqZd5EYMk9D9x", name: "123", updated: "Jun 16", host: "Self-hosted" },
    { value: "env_01AzQWp3SXQEATgdCFUNwteR", name: "myenv", updated: "Jun 16", host: "Self-hosted" },
    { value: "env_01UNo9NMB1ZQLKCZk21qryb8", name: "world-cup-digest-env", updated: "Jun 16", host: "Cloud" }
  ];
  const dedupedOptions = options.filter((option, index, all) => all.findIndex((item) => item.value === option.value) === index);
  const filteredOptions = dedupedOptions.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));
  const selected = value ? dedupedOptions.find((option) => option.value === value) : undefined;

  return (
    <div data-cds="Field" className="relative">
      <div className={deploymentPickerShellClass}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment environment"
          className="flex h-8 w-[464px] min-w-0 items-center gap-1.5 rounded-none bg-transparent p-0 pl-2 text-left text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">
            <span className={selected ? "" : "font-normal text-muted [font-weight:430]"}>{selected?.name ?? "Select an environment"}</span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 max-h-[238px] w-[472px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] items-center border-b border-line px-4 py-2">
            <input
              className={createSessionSearchInputClass}
              aria-label="Search deployment environments"
              placeholder="Search environments by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <div role="listbox" className="grid max-h-[192px] gap-0 overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex min-h-[48px] w-full items-center justify-between rounded-[8px] px-3 py-1 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm leading-4 text-ink">{option.name}</span>
                  <span className="inline-flex items-center gap-1.5 truncate text-[13px] leading-[18px] text-muted">
                    <span>{option.updated}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex h-4 shrink-0 items-center rounded-[6px] bg-fill px-1.5 text-[10px] leading-[12px] text-[#52514e] [font-weight:550]">{option.host}</span>
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

const credentialVaultPickerOptions = [
  { value: "test_secret", name: "test_secret", updated: "Jun 16", summary: "", credentialIcons: 5 },
  { value: "Temporary vault", name: "Temporary vault", updated: "7 days ago", summary: "No credentials", credentialIcons: 0 }
];
const deploymentCredentialVaultPickerOptions = [
  { value: "Temporary vault", name: "Temporary vault", updated: "7 days ago", summary: "No credentials", credentialIcons: 0 },
  { value: "test_secret", name: "test_secret", updated: "Jun 16", summary: "", credentialIcons: 5 }
];

function CreateSessionVaultPicker({
  value,
  open,
  onOpenChange,
  onValueChange
}: {
  value: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredOptions = credentialVaultPickerOptions.filter((option) => `${option.name} ${option.value}`.toLowerCase().includes(search.toLowerCase()));
  const selectedOptions = credentialVaultPickerOptions.filter((option) => value.includes(option.value));
  const selectedLabel = selectedOptions.length > 1 ? `${selectedOptions.length} vaults selected` : selectedOptions[0]?.name;

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const focusSearch = () => searchInputRef.current?.focus();
    const frame = window.requestAnimationFrame(focusSearch);
    const timer = window.setTimeout(focusSearch, 40);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [onOpenChange, open]);

  function toggleVault(nextValue: string) {
    if (value.includes(nextValue)) {
      onValueChange(value.filter((item) => item !== nextValue));
      return;
    }
    onValueChange([...value, nextValue]);
  }

  return (
    <div ref={containerRef} data-cds="Field" className="relative">
      <div className={createSessionSelectShellClass}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select credential vaults"
          className="flex h-8 min-w-0 flex-1 items-center justify-between rounded-none border-0 bg-transparent pl-2 pr-0 text-left text-sm font-normal text-ink outline-none hover:bg-black/[0.03]"
          onClick={() => onOpenChange(!open)}
        >
          <span className={`truncate ${selectedLabel ? "" : "text-muted [font-weight:430]"}`}>{selectedLabel ?? "Select one or more vaults"}</span>
          {selectedLabel ? null : <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />}
        </button>
        {selectedLabel ? (
          <span className="ml-1.5 flex h-8 w-[31px] shrink-0 items-center justify-center">
            <button
              type="button"
              aria-label="Clear selection"
              className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[3px] text-ink outline-none hover:bg-fill"
              onClick={() => onValueChange([])}
            >
              <CdsIconGlyph glyph="" className="h-5 w-5 text-[20px] [font-weight:433.25]" />
            </button>
          </span>
        ) : null}
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 max-h-[238px] w-full overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <input
            ref={searchInputRef}
            className="-mx-1 -mt-1 mb-1 block h-[37px] w-[calc(100%+8px)] shrink-0 border-0 border-b border-line bg-transparent px-4 py-2 text-sm leading-5 text-ink outline-none placeholder:text-[#898781]"
            aria-label="Search credential vaults"
            autoFocus
            placeholder="Search vaults by name or exact ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDownCapture={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          />
          <div role="listbox" className="grid max-h-[92px] gap-0 overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value.includes(option.value)}
                className="flex min-h-[46px] w-full items-center gap-2 rounded-[8px] px-2 py-1 text-left outline-none hover:bg-fill data-[highlighted]:bg-fill"
                onClick={() => toggleVault(option.value)}
              >
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] ${value.includes(option.value) ? "bg-[#2b73d2] text-white shadow-none" : "bg-white text-transparent shadow-[inset_0_0_0_1px_rgba(11,11,11,0.18)]"}`} aria-hidden>
                  <CdsIconGlyph glyph="" className="h-4 w-4 text-[16px] [font-weight:700]" />
                </span>
                <CredentialVaultOptionContent option={option} />
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
  const [search, setSearch] = useState("");
  const options = deploymentCredentialVaultPickerOptions;
  const filteredOptions = options.filter((option) => `${option.name} ${option.value}`.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative">
      <div className={deploymentPickerShellClass}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Add credential vault"
          className="flex h-8 w-[464px] min-w-0 items-center gap-1.5 rounded-none bg-transparent p-0 pl-2 text-left text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">
            <span className={`flex items-center gap-2 ${selected ? "" : "font-normal text-muted [font-weight:430]"}`}>
              {selected ? <Shield className="h-4 w-4 shrink-0 text-muted" /> : <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-[16px] [font-weight:533.25]" />}
              <span className="truncate">{selected?.name ?? "Add vault"}</span>
            </span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute left-0 top-[38px] z-50 max-h-[137px] w-[472px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] items-center border-b border-line px-4 py-2">
            <input
              className={createSessionSearchInputClass}
              aria-label="Search credential vaults"
              placeholder="Search vaults by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <div role="listbox" className="grid max-h-[92px] gap-0 overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className="flex min-h-[46px] w-full items-center justify-between rounded-[8px] px-3 py-1 text-left outline-none hover:bg-fill"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <CredentialVaultOptionContent option={option} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CredentialVaultOptionContent({ option }: { option: (typeof credentialVaultPickerOptions)[number] }) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate text-sm leading-5 text-ink">{option.name}</span>
        <span className="truncate text-[13px] leading-4 text-muted">{option.updated}</span>
      </span>
      <span className="inline-flex shrink-0 items-center justify-end text-sm leading-5 text-muted">
        {option.credentialIcons > 0
          ? Array.from({ length: option.credentialIcons }, (_, index) => (
              <span key={index} className="-ml-2 grid h-6 w-6 place-items-center overflow-hidden rounded-full border-[0.5px] border-line bg-white first:ml-0">
                {index === 2 || index === 3 ? (
                  <span className={`h-3.5 w-3.5 rounded-full ${index === 2 ? "bg-[#dce9ff]" : "bg-[#ffe0ce]"}`} />
                ) : (
                  <CdsIconGlyph glyph="" className="h-3.5 w-3.5 text-[#52514e] text-[14px] [font-weight:628.5]" />
                )}
              </span>
            ))
          : <span className="text-xs leading-4">{option.summary}</span>}
      </span>
    </span>
  );
}

function DeploymentMemoryStorePicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = [
    { value: "123", name: "123", description: "No description", access: "Read & write" },
    { value: "zzz", name: "zzz", description: "No description", access: "Read & write" },
    { value: "world cup", name: "world cup", description: "No description", access: "Read & write" },
    { value: "leo_test", name: "leo_test", description: "123", access: "Read & write" }
  ];
  const filteredOptions = options.filter((option) => `${option.name} ${option.value}`.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative grid gap-2">
      {selected ? (
        <div className={`${deploymentPickerShellClass} flex items-center justify-between px-2 text-sm`}>
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
      <div className={deploymentPickerShellClass}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Add memory store"
          className="flex h-8 w-[464px] min-w-0 items-center gap-1.5 rounded-none bg-transparent p-0 pl-2 text-left text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate">
            <span className="flex items-center gap-2 font-normal text-muted [font-weight:430]">
              <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-[16px] [font-weight:533.25]" />
              <span className="truncate">Add memory store</span>
            </span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute bottom-[37px] left-0 z-50 max-h-[229px] w-[472px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="combobox" aria-expanded="true" className="-mx-1 -mt-1 mb-1 flex h-[37px] w-[calc(100%+8px)] items-center border-b border-line px-4 py-2">
            <input
              className={createSessionSearchInputClass}
              aria-label="Search memory stores"
              placeholder="Search memory stores by name or exact ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
          <div role="listbox" className="grid max-h-[184px] gap-0 overflow-y-auto overflow-x-hidden">
            {filteredOptions.map((option) => (
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
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm leading-5 text-ink">{option.name}</span>
                  <span className="truncate text-[13px] leading-4 text-muted">{option.description}</span>
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
    { value: "Manual", description: "Run on demand from the dashboard or API", glyph: "" },
    { value: "Schedule", description: "Run automatically on a cron schedule", glyph: "" }
  ];
  const selected = options.find((option) => option.value === value);

  return (
    <div data-cds="Field" className="relative">
      <div className={deploymentPickerShellClass}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select deployment trigger"
          className="flex h-8 w-[464px] min-w-0 items-center gap-1.5 rounded-none bg-transparent p-0 pl-2 text-left text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#c6613f]/35"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="inline-flex min-w-0 flex-1 items-center gap-2 truncate">
            {selected ? <CdsIconGlyph glyph={selected.glyph} className="h-4 w-4 shrink-0 text-muted text-[16px] [font-weight:533.25]" /> : null}
            <span className={selected ? "" : "font-normal text-muted [font-weight:430]"}>{selected?.value ?? "Select a trigger"}</span>
          </span>
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
        </button>
      </div>
      {open ? (
        <div
          data-cds="Combobox"
          role="dialog"
          className="absolute bottom-[37px] left-0 z-50 w-[472px] rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]"
        >
          <div role="listbox" className="grid gap-0">
            {options.map((option) => {
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 py-1 text-left outline-none hover:bg-fill aria-selected:bg-black/[0.05]"
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-3">
                      <CdsIconGlyph glyph={option.glyph} className="mt-0.5 h-4 w-4 shrink-0 text-[#52514e] text-[16px] [font-weight:533.25]" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm leading-5 text-ink">{option.value}</span>
                        <span className="truncate text-[13px] leading-4 text-muted">{option.description}</span>
                      </span>
                    </span>
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
    runs: ["Sun, Jun 28, 2026, 9:00 AM", "Sun, Jul 5, 2026, 9:00 AM", "Sun, Jul 12, 2026, 9:00 AM", "Sun, Jul 19, 2026, 9:00 AM", "Sun, Jul 26, 2026, 9:00 AM"]
  },
  {
    value: "Monday",
    cron: 1,
    runs: ["Mon, Jun 29, 2026, 9:00 AM", "Mon, Jul 6, 2026, 9:00 AM", "Mon, Jul 13, 2026, 9:00 AM", "Mon, Jul 20, 2026, 9:00 AM", "Mon, Jul 27, 2026, 9:00 AM"]
  },
  {
    value: "Tuesday",
    cron: 2,
    runs: ["Tue, Jun 30, 2026, 9:00 AM", "Tue, Jul 7, 2026, 9:00 AM", "Tue, Jul 14, 2026, 9:00 AM", "Tue, Jul 21, 2026, 9:00 AM", "Tue, Jul 28, 2026, 9:00 AM"]
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
    runs: ["Sat, Jun 27, 2026, 9:00 AM", "Sat, Jul 4, 2026, 9:00 AM", "Sat, Jul 11, 2026, 9:00 AM", "Sat, Jul 18, 2026, 9:00 AM", "Sat, Jul 25, 2026, 9:00 AM"]
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
    "Wed, Jun 24, 2026, 9:00 AM",
    "Thu, Jun 25, 2026, 9:00 AM",
    "Fri, Jun 26, 2026, 9:00 AM",
    "Sat, Jun 27, 2026, 9:00 AM",
    "Sun, Jun 28, 2026, 9:00 AM"
  ],
  Weekdays: [
    "Wed, Jun 24, 2026, 9:00 AM",
    "Thu, Jun 25, 2026, 9:00 AM",
    "Fri, Jun 26, 2026, 9:00 AM",
    "Mon, Jun 29, 2026, 9:00 AM",
    "Tue, Jun 30, 2026, 9:00 AM"
  ],
  Weekly: deploymentWeekdayOptions[1].runs
};

const deploymentDailyOneAmRuns = [
  "Wed, Jun 24, 2026, 1:00 AM",
  "Thu, Jun 25, 2026, 1:00 AM",
  "Fri, Jun 26, 2026, 1:00 AM",
  "Sat, Jun 27, 2026, 1:00 AM",
  "Sun, Jun 28, 2026, 1:00 AM"
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
        <div className="mb-2 inline-flex items-center gap-1.5 text-[13px] leading-4 text-[#52514e] [font-weight:550]">
          Next 5 runs
          <button type="button" aria-label="About next runs" className="inline-flex cursor-help text-[#898781] hover:text-[#4e4a45]">
            <CdsIconGlyph glyph="" className="h-3 w-3 text-[12px] [font-weight:577.75]" />
          </button>
        </div>
        <div className="flex flex-col gap-1 text-sm text-[#4e4a45]">
          {nextRuns.map((run) => (
            <div key={run} className="flex h-5 items-center gap-2">
              <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-muted text-[16px] [font-weight:533.25]" />
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
  const helperClass = "text-[13px] font-normal leading-[18px] text-[#898781]";

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
      contentClassName="h-[429px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="relative -top-px mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="relative -top-px h-[31px] w-[31px] !rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-[27px]">
        <div className="grid gap-[15px]">
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] !rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
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
              triggerShellClassName="inline-flex h-[31px] w-full items-center rounded-[8px] bg-white/50 pr-2 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              triggerClassName="!h-[31px] w-full"
              contentPosition="popper"
              contentSideOffset={6}
              contentClassName="w-[462px] overflow-hidden !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
              itemClassName="!rounded-[8px] px-3"
            />
            <p className={helperClass}>This cannot be changed after creation.</p>
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Description</label>
            <textarea
              className="cds-focus h-[74px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="Optional description for this environment"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-4 flex justify-end gap-[7px] bg-white px-6 py-0">
          <Button variant="ghost" className="h-[31px] w-[70px] !rounded-[8px] px-0 [font-weight:550]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="h-[31px] w-[69px] !rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
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
      contentClassName={step === "vault" ? "h-[306px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]" : undefined}
      headerClassName={step === "vault" ? "flex items-start justify-between pl-6 pr-4 pt-4" : undefined}
      titleClassName={step === "vault" ? "mt-1 w-[431px] -translate-y-px text-[22px] leading-[26px] text-ink [font-weight:580]" : undefined}
      closeButtonClassName={step === "vault" ? "h-[31px] w-[31px] -translate-y-px !rounded-[8px] px-0" : undefined}
      closeLabel={step === "vault" ? "Close" : undefined}
    >
      {step === "vault" ? (
        <div className="px-6 pb-0 pt-[11px]">
          <div className="mb-4 flex h-[82px] gap-2 rounded-[12px] border-0 bg-[#f9dca4] px-4 py-3 text-sm leading-5 text-[#734500]">
            <CdsIconGlyph glyph="" className="h-5 w-5 shrink-0 text-[#734500] text-[20px] [font-weight:433.25]" />
            <p>
              Vaults are shared across this workspace. Credentials added to this vault will be usable by anyone with API key access.{" "}
              <span className="font-medium text-[#184f95]">Learn more here</span>
              <span> (opens in new tab).</span>
            </p>
          </div>
          <div className="grid gap-2">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] !rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="Production vault"
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
            />
            <span className={helperClass}>50 characters or fewer.</span>
          </div>
          <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
            <Button className="h-[31px] w-[84px] !rounded-[8px] px-0 [font-weight:550]" onClick={continueToCredential} disabled={!canContinue}>Continue</Button>
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
      contentClassName="h-[349px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      descriptionClassName="mt-1 text-sm text-[#52514e]"
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
    setTarget("");
  }, [authType]);

  async function submit() {
    if (!target.trim()) return;
    await onSubmit({ name, authType, target });
    setName("");
    setTarget("");
  }

  const targetLabel = authType === "Environment variable" ? "Environment variable" : "MCP server";
  const targetPlaceholder = authType === "Environment variable" ? "ENV_VAR_NAME" : "https://mcp.example.com";
  const canSubmit = target.trim().length > 0;
  const fieldLabelClass = "text-sm leading-none [font-weight:550]";
  const selectShellClass = "flex h-[31px] w-full items-center rounded-[8px] border-0 bg-white/50 pr-2 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]";
  const primaryLabel = authType === "MCP OAuth" ? submitLabel : "Add credential";

  return (
    <div className="px-6 pb-0 pt-[10px]">
      {title ? <p className="mb-5 text-sm leading-6 text-muted">{title}</p> : null}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className={`${fieldLabelClass} flex h-[22px] items-center gap-2`}>
            Name <span className="inline-flex h-[22px] items-center rounded-[5.5px] bg-fill px-2 text-xs leading-[15px] text-[#52514e] [font-weight:550]">Optional</span>
          </label>
          <TextInput
            className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
            placeholder="Example credential"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-[7px]">
          <label className={fieldLabelClass}>Type</label>
          <div className={selectShellClass}>
            <CredentialAuthTypeSelect value={authType} onValueChange={setAuthType} />
          </div>
        </div>
        <div className="grid gap-2">
          <label className={fieldLabelClass}>{targetLabel}</label>
          {authType === "MCP OAuth" || authType === "Bearer token" ? (
            <div className={selectShellClass}>
              <FieldSelect
                label=""
                showLabel={false}
                ariaLabel={targetLabel}
                value={target || targetPlaceholder}
                options={[targetPlaceholder]}
                onValueChange={(value) => setTarget(value === targetPlaceholder ? "" : value)}
                triggerClassName="!h-[31px] w-[455px] !gap-1.5 rounded-none !border-transparent !bg-transparent !pl-2 !pr-0 hover:!bg-transparent"
              />
            </div>
          ) : (
            <TextInput
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder={targetPlaceholder}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          )}
        </div>
      </div>
      <div className="sticky bottom-0 -mx-6 mt-4 flex justify-end gap-2 bg-white px-6 py-0">
        {secondaryLabel ? <Button variant="ghost" className="h-[31px] rounded-[8px] px-3 [font-weight:550]" onClick={onSecondary}>{secondaryLabel}</Button> : null}
        <Button className={`h-[31px] rounded-[8px] px-0 [font-weight:550] ${primaryLabel === "Add credential" ? "w-[121px]" : "w-[81px]"}`} onClick={submit} disabled={!canSubmit}>{primaryLabel}</Button>
      </div>
    </div>
  );
}

const credentialAuthTypeOptions = [
  {
    value: "MCP OAuth",
    description: "For MCP servers that support OAuth."
  },
  {
    value: "Bearer token",
    description: "For MCP servers that accept a long-lived API key or personal access token."
  },
  {
    value: "Environment variable",
    description: "For CLIs, SDKs, or direct API calls. The agent never sees the value."
  }
];

function CredentialAuthTypeSelect({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        data-cds="Button"
        aria-label="Credential type"
        className="cds-focus inline-flex h-[31px] w-[455px] items-center gap-1.5 rounded-none border border-transparent bg-transparent pl-2 pr-0 text-sm leading-5 text-ink outline-none hover:bg-transparent"
      >
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 whitespace-nowrap">
          <Select.Value />
        </span>
        <Select.Icon className="shrink-0">
          <CdsIconGlyph glyph="" className="mr-0.5 h-4 w-4 text-[#898781] text-[16px] [font-weight:533.25]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          data-cds="ComboboxPopover"
          className="z-50 w-[463px] overflow-hidden rounded-[12px] bg-white p-1 shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
        >
          <Select.Viewport>
            {credentialAuthTypeOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex min-h-12 w-full select-none items-center gap-2 rounded-[8px] px-3 py-1 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-fill data-[state=checked]:bg-[rgba(11,11,11,0.05)]"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Select.ItemText>
                    <span className="block truncate">{option.value}</span>
                  </Select.ItemText>
                  <span className="whitespace-normal break-words text-[13px] leading-[17.875px] text-[#898781]">{option.description}</span>
                </div>
                <Select.ItemIndicator>
                  <CdsIconGlyph glyph="" className="h-4 w-4 shrink-0 text-[#898781] text-[16px] [font-weight:533.25]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
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
      contentClassName="h-[337px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 w-[431px] text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] !rounded-[8px] px-0"
      closeLabel="Close"
    >
      <div className="px-6 pb-0 pt-3">
        <div>
          <div className="grid gap-[7px]">
            <label className={fieldLabelClass}>Name</label>
            <TextInput
              className="h-[31px] !rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="My memory store"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="mt-4 grid gap-2">
            <label className={fieldLabelClass}>Description (optional)</label>
            <textarea
              className="cds-focus h-[74px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 text-sm font-normal leading-5 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="What this store contains and how agents should use it"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <p className="mt-2 text-[13px] leading-[18px] text-[#898781]">Name and description are rendered in the agent system prompt when this store is attached.</p>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
          <Button className="h-[31px] w-[69px] !rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
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
              className="h-[31px] rounded-[8px] border-0 bg-white/50 px-3 font-normal shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              placeholder="/notes/ideas.md"
              value={path}
              onChange={(event) => setPath(event.target.value)}
            />
            <span className="text-[13px] leading-[18px] text-muted">Folders are derived from the slashes in your path.</span>
          </div>
          <div className="mt-[15px] grid gap-2">
            <label className={fieldLabelClass}>Content</label>
            <textarea
              className="cds-focus h-[251px] resize-none rounded-[8px] border-0 bg-white/50 px-3 py-2 font-mono text-sm font-normal leading-5 shadow-[inset_0_0_0_1px_rgba(11,11,11,0.1)]"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-[15px] flex justify-end bg-white px-6 py-0">
          <Button className="h-[31px] w-[69px] rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canCreate}>Create</Button>
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
      contentClassName="min-h-[265px] w-[510px] max-w-[calc(100vw-32px)] !rounded-[12px] border-0 !shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)]"
      headerClassName="flex items-start justify-between pl-6 pr-4 pt-4"
      titleClassName="mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]"
      closeButtonClassName="h-[31px] w-[31px] !rounded-[8px] px-0"
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
              <FolderPlus className="mx-auto mb-3 h-8 w-8 text-[#898781]" strokeWidth={1.5} />
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
          <Button className="h-[31px] w-[84px] !rounded-[8px] px-0 [font-weight:550]" onClick={submit} disabled={!canContinue}>Continue</Button>
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
          className="fixed left-1/2 top-1/2 z-50 flex h-[396px] w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <div className="mb-4 flex min-h-0 items-start gap-2">
            <div className="-mt-1 flex min-w-0 flex-1 flex-col gap-1">
              <Dialog.Title className="truncate text-[22px] leading-[26px] text-ink [font-weight:580]">{skill?.name ?? "Skill"}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="icon" className="-mr-2 -mt-2 h-8 w-8 rounded-[8px] px-0" aria-label="Close">
                <CdsIconGlyph glyph="" />
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
                        <CopyableIdText
                          value={version.version}
                          display={<span data-cds="Badge" className="inline-flex h-[22px] items-center rounded-[5.5px] bg-fill px-2 align-bottom font-mono text-xs leading-[15px] text-[#52514e] [font-weight:550]">{version.version}</span>}
                          className="relative cursor-pointer"
                          textClassName="relative inline-block max-w-full truncate align-bottom font-mono text-xs text-[#52514e]"
                        />
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
            {key ? <span className="text-[#b80a18]">{key}:</span> : null}
            <span className="text-[#008000]">{key ? rest : line}</span>
            {"\n"}
          </span>
        );
      })}
    </>
  );
}

function CodeJson({ source }: { source: string }) {
  const tokenPattern = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of source.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) {
      nodes.push(source.slice(cursor, start));
    }

    let className = "text-[#008000]";
    if (token.startsWith("\"") && source.slice(start + token.length).trimStart().startsWith(":")) {
      className = "text-[#b80a18]";
    } else if (!token.startsWith("\"")) {
      className = token === "null" ? "text-[#898781]" : "text-[#6f42c1]";
    }

    nodes.push(
      <span key={`${start}-${tokenIndex}`} className={className}>
        {token}
      </span>
    );
    cursor = start + token.length;
    tokenIndex += 1;
  }

  if (cursor < source.length) {
    nodes.push(source.slice(cursor));
  }

  return <>{nodes}</>;
}

function CodeGutter({ lineCount, scrollTop = 0 }: { lineCount: number; scrollTop?: number }) {
  return (
    <div
      className="w-10 shrink-0 select-none overflow-hidden border-r border-[rgba(11,11,11,0.08)] bg-[#fafaf8] py-3 text-right font-mono text-[13px] leading-[19px] text-muted"
      aria-hidden="true"
    >
      <div style={{ transform: `translateY(${-scrollTop}px)` }}>
        {Array.from({ length: Math.max(lineCount, 1) }, (_, index) => (
          <div key={index} className="px-2">{index + 1}</div>
        ))}
      </div>
    </div>
  );
}

/** Read-only code block (JSON preview) with a synced line-number gutter. */
function CodeBlockWithLineNumbers({ source, language, className = "px-[11px] py-3" }: { source: string; language: "YAML" | "JSON"; className?: string }) {
  const lineCount = source.split("\n").length;

  return (
    <div className="flex h-full min-h-0 overflow-auto">
      <CodeGutter lineCount={lineCount} />
      <pre className={`m-0 min-w-0 flex-1 whitespace-pre-wrap font-mono text-[13px] leading-[19px] text-ink ${className}`}>
        {language === "YAML" ? <CodeYaml source={source} /> : <CodeJson source={source} />}
      </pre>
    </div>
  );
}

function HighlightedConfigTextarea({
  value,
  onChange,
  language,
  className = "h-full px-[11px] py-3",
  showLineNumbers = true,
  ...props
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  language: "YAML" | "JSON";
  className?: string;
  showLineNumbers?: boolean;
} & Omit<ComponentProps<"textarea">, "value" | "onChange" | "children">) {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const textClassName = `absolute inset-0 font-mono text-[13px] leading-[19px] ${className}`;
  const lineCount = value.split("\n").length;

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      {showLineNumbers ? <CodeGutter lineCount={lineCount} scrollTop={scroll.top} /> : null}
      <div className="relative min-w-0 flex-1">
        <div className={`${textClassName} pointer-events-none overflow-hidden whitespace-pre-wrap text-ink`} aria-hidden="true">
          <pre
            className="m-0 min-h-full whitespace-pre-wrap break-words p-0 font-inherit text-inherit"
            style={{ transform: `translate(${-scroll.left}px, ${-scroll.top}px)` }}
          >
            {language === "YAML" ? <CodeYaml source={value} /> : <CodeJson source={value} />}
          </pre>
        </div>
        <textarea
          {...props}
          className={`${textClassName} z-10 resize-none overflow-auto border-0 bg-transparent font-mono text-transparent caret-[#0b0b0b] outline-none selection:bg-[#cde2fb] selection:text-[#0b0b0b]`}
          spellCheck={false}
          value={value}
          onChange={onChange}
          onScroll={(event) => setScroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop })}
        />
      </div>
    </div>
  );
}

function sessionTone(status: string): "neutral" | "green" | "blue" | "red" {
  if (status === "Archived") return "neutral";
  if (status === "Failed" || status === "Error" || status === "Cancelled") return "red";
  if (status === "Running" || status === "Active") return "green";
  if (status === "Queued" || status === "Created") return "blue";
  return "neutral";
}

function deploymentTone(status: string): "neutral" | "green" | "blue" | "red" | "warning" {
  if (status === "Failed") return "red";
  if (status === "Active" || status === "Running") return "green";
  if (status === "Queued" || status === "Ready") return "blue";
  if (status === "Paused") return "warning";
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

function EnvironmentActions({
  environment,
  onArchive,
  onDelete,
  triggerClassName = "ml-1"
}: {
  environment: Environment;
  onArchive: () => void;
  onDelete: () => void;
  triggerClassName?: string;
}) {
  const archived = environment.status === "Archived";

  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className={triggerClassName} aria-label="More actions">
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} w-[128px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-[70px] rounded-[8px] bg-transparent px-0 text-sm [font-weight:550] hover:bg-fill">
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} min-w-[128px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-[70px] rounded-[8px] bg-transparent px-0 text-sm [font-weight:550] hover:bg-fill">
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} w-[160px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => { copyText(credential.id); showToast("Copied to clipboard."); }}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className={cdsMenuSeparatorClass} />
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
            {archived ? "Archived" : "Archive"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} w-[145px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
            {archived ? "Archived" : "Archive store"}
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">{description}</Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-[70px] rounded-[8px] bg-transparent px-0 text-sm [font-weight:550] hover:bg-fill">
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className={`${cdsMenuContentClass} w-[160px]`} align="end" sideOffset={6}>
          <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => { copyText(record.id); showToast("Copied to clipboard."); }}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className={cdsMenuSeparatorClass} />
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className={`${cdsMenuContentClass} w-[160px]`} align="end" sideOffset={6}>
          <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => navigate(`/files/${file.id}`)}>
            <FileText className="h-4 w-4" />
            Open file
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => { copyText(file.id); showToast("Copied to clipboard."); }}>
            <Copy className="h-4 w-4" />
            Copy ID
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className={cdsMenuSeparatorClass} />
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">Archive session</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">
            This session won't accept new events and will be hidden. This can't be undone.
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

function SessionRowActions({ session, onArchive }: { session: Session; onArchive: () => void }) {
  const archived = session.status === "Archived";

  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" aria-label="More actions">
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} w-[160px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">Archive deployment?</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">
            Archived deployments stop firing scheduled runs. Run history is kept.
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

function DeploymentActions({
  deployment,
  onPause,
  onResume,
  onEdit,
  onArchive,
  triggerClassName = "ml-1"
}: {
  deployment: Deployment;
  onPause: () => void;
  onResume: () => void;
  onEdit: () => void;
  onArchive: () => void;
  triggerClassName?: string;
}) {
  const paused = deployment.status === "Paused";
  const archived = deployment.status === "Archived";
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className={triggerClassName} aria-label="More actions">
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className={`${cdsMenuContentClass} w-[128px]`} align="end" sideOffset={6}>
          {paused ? (
            <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={onResume} disabled={archived}>
              <MenuResumeIcon />
              Resume
            </CdsDropdownMenu.Item>
          ) : (
            <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={onPause} disabled={archived}>
              <Pause className="h-5 w-5 text-muted" />
              Pause
            </CdsDropdownMenu.Item>
          )}
          <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={onEdit} disabled={archived}>
            <MenuEditIcon />
            Edit
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
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
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} w-[160px]`}
          align="end"
          sideOffset={6}
        >
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onSendInterrupt}
          >
            <Pause className="h-4 w-4 text-muted" />
            Send interrupt
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onSendEvent}
          >
            <Terminal className="h-4 w-4 text-muted" />
            Send event…
          </CdsDropdownMenu.Item>
          <CdsDropdownMenu.Separator className={cdsMenuSeparatorClass} />
          <CdsDropdownMenu.Item
            className={cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
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
  agentName,
  open,
  onOpenChange,
  onConfirm
}: {
  agentName: string;
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[510px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[12px] bg-white p-6 text-sm text-ink shadow-[0_0_0_1px_rgba(11,11,11,0.1),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(11,11,11,0.08)] outline-none"
        >
          <Dialog.Title className="-mt-1 text-[22px] leading-[26px] text-ink [font-weight:580]">Archive agent</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm leading-5 text-[#52514e]">
            Are you sure you want to archive &quot;{agentName}&quot;? Archived agents can&rsquo;t be used to create new sessions.
          </Dialog.Description>
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-[70px] rounded-[8px] bg-transparent px-0 text-sm [font-weight:550] hover:bg-fill">
                Cancel
              </Button>
            </Dialog.Close>
            <Button className="h-8 w-[117px] rounded-[8px] bg-[#d03b3b] px-0 text-sm text-white [font-weight:550] hover:bg-[#b83232]" onClick={onConfirm}>
              Archive agent
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AgentRowActions({ agent, onArchive, onGuidedEdit }: { agent: Agent; onArchive: () => void; onGuidedEdit?: () => void }) {
  const archived = agent.status === "Archived";
  const navigate = useNavigate();
  return (
    <CdsDropdownMenu.Root>
      <CdsDropdownMenu.Trigger asChild>
        <Button variant="icon" className="!gap-1.5 [font-weight:550]" aria-label="More actions">
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content
          data-cds="Menu"
          className={`${cdsMenuContentClass} ${onGuidedEdit ? "w-[184px]" : "w-[148px]"}`}
          align="end"
          sideOffset={8}
        >
          {onGuidedEdit ? (
            <>
              <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => navigate(`/sessions?agentId=${agent.id}`)}>
                <MenuResumeIcon />
                Start session
              </CdsDropdownMenu.Item>
              <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={onGuidedEdit}>
                <span className="h-5 w-5 shrink-0" aria-hidden="true" />
                Guided edit
              </CdsDropdownMenu.Item>
              <CdsDropdownMenu.Item className={cdsMenuItemClass} onSelect={() => navigate(`/deployments?agentId=${agent.id}`)}>
                <CdsIconGlyph glyph="" className="h-5 w-5 text-current text-[20px] [font-weight:566.5]" />
                Create deployment
              </CdsDropdownMenu.Item>
              <CdsDropdownMenu.Separator className={cdsMenuSeparatorClass} />
            </>
          ) : null}
          <CdsDropdownMenu.Item
            className={onGuidedEdit && !archived ? cdsMenuDangerItemClass : cdsMenuItemClass}
            onSelect={onArchive}
            disabled={archived}
          >
            <MenuArchiveIcon />
            {archived ? "Archived" : onGuidedEdit ? "Archive" : "Archive agent"}
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
          <MoreActionsIcon />
        </Button>
      </CdsDropdownMenu.Trigger>
      <CdsDropdownMenu.Portal>
        <CdsDropdownMenu.Content data-cds="Menu" className={`${cdsMenuContentClass} w-[128px]`} align="end" sideOffset={6}>
          <CdsDropdownMenu.Item
            className={cdsMenuDangerItemClass}
            onSelect={onDelete}
          >
            <MenuDeleteIcon />
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
    folders.add(memoryFolder(memory.path));
  });
  return [...folders].sort();
}

function memoryFolder(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 1) return parts[0];
  const name = parts[0] || path;
  return name.match(/^[A-Za-z_-]+/)?.[0] || name;
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

function PageHeader({ title, description, action, titleClassName = "" }: { title: string; description: React.ReactNode; action?: React.ReactNode; titleClassName?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className={`truncate text-2xl leading-8 [font-weight:550] ${titleClassName}`}>{title}</h1>
        <p className="text-sm leading-5 text-[#898781]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function HeaderCreateButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className={`!gap-1.5 !rounded-[8px] !px-3 [font-weight:550] ${className}`} {...props}>
      <span className="inline-flex items-center gap-1">
        <CdsIconGlyph glyph="" className="-ml-1 h-5 w-5 text-current text-[20px] [font-weight:566.5]" />
        {children}
      </span>
    </Button>
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

function AgentConfigSection({
  title,
  children,
  headingClassName = "text-[#52514e] [font-weight:550]",
  separated = false
}: {
  title: string;
  children: React.ReactNode;
  headingClassName?: string;
  separated?: boolean;
}) {
  return (
    <section className={`${separated ? "border-t-[0.5px] border-[rgba(11,11,11,0.1)] pt-6" : "pt-4"} pb-6`}>
      <h2 className={`text-sm leading-5 ${headingClassName}`}>{title}</h2>
      {children}
    </section>
  );
}

function DeploymentDetailToken({ icon, children, to }: { icon: string; children: React.ReactNode; to?: string }) {
  const className = "relative z-10 inline-flex h-[25px] w-fit min-w-0 max-w-full self-start items-center gap-1.5 rounded-md border-[0.5px] border-line bg-transparent px-1.5 py-0.5 text-sm leading-5 text-[#52514e] no-underline outline-none transition-colors duration-100 hover:bg-fill hover:text-ink";
  const content = (
    <>
      <CdsIconGlyph glyph={icon} className="h-4 w-4 shrink-0 text-[#52514e] text-[16px] [font-weight:533.25]" />
      <span className="min-w-0 truncate">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={className} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

function DeploymentDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-sm leading-5 [font-weight:550]">{title}</h3>
      {children}
    </section>
  );
}

function EnvironmentDetailSection({ title, description, children, separated = false }: { title: string; description: string; children: React.ReactNode; separated?: boolean }) {
  return (
    <section className={`flex flex-col gap-3 ${separated ? "pt-6" : ""}`}>
      <div className="flex max-w-[800px] flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base leading-6 [font-weight:550]">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function EnvironmentEditSection({
  title,
  description,
  children,
  action,
  separated = false,
  className = ""
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  separated?: boolean;
  className?: string;
}) {
  return (
    <section className={`flex w-full flex-col gap-3 ${separated ? "pt-[25px]" : ""} ${className}`}>
      <div className="flex max-w-[800px] flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className={action ? "flex h-8 items-center justify-between" : ""}>
            <h2 className="text-base leading-6 [font-weight:550]">{title}</h2>
            {action}
          </div>
          <p className="text-sm text-muted">{description}</p>
        </div>
        {children}
      </div>
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
  const prefixEnd = id.indexOf("_") + 1;
  const prefix = prefixEnd > 0 ? id.slice(0, prefixEnd) : id.slice(0, 4);
  return `${prefix}…${id.slice(-6)}`;
}

function shortDeploymentDetailId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

function shortCredentialId(id: string) {
  if (id.length <= 15) return id;
  const prefixEnd = id.indexOf("_") + 1;
  const prefix = prefixEnd > 0 ? id.slice(0, prefixEnd) : id.slice(0, 4);
  return `${prefix}…${id.slice(-7)}`;
}

function shortRunTableId(id: string) {
  if (id.length <= 16) return id;
  const prefixEnd = id.indexOf("_") + 1;
  if (prefixEnd <= 0) return shortId(id);
  return `${id.slice(0, prefixEnd + 2)}…${id.slice(-6)}`;
}

function shortMemoryStoreId(id: string) {
  if (id.length <= 15) return id;
  return `${id.slice(0, 9)}…${id.slice(-7)}`;
}

function shortMemoryStoreDetailId(id: string) {
  if (id.length <= 15) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function shortMemoryRecordId(id: string) {
  if (id.length <= 11) return id;
  return `${id.slice(0, 4)}…${id.slice(-6)}`;
}

function shortUserId(id: string) {
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}…${id.slice(-4)}`;
}

function shortEnvironmentId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 10)}…${id.slice(-7)}`;
}

function shortEnvironmentDetailId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

function shortEnvironmentListId(id: string) {
  if (id.length <= 12) return id;
  const prefixEnd = id.indexOf("_") + 1;
  const prefix = prefixEnd > 0 ? id.slice(0, prefixEnd) : id.slice(0, 4);
  return `${prefix}…${id.slice(-7)}`;
}

function agentSessionCreatedLabel(session: Session) {
  const created = new Date(session.createdAt);
  if (Number.isNaN(created.getTime())) return session.createdLabel;
  return created.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function SearchClearButton({ onClear }: { onClear: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-mr-1.5 ml-1 h-[22px] w-[22px] shrink-0 !rounded-[6px] !px-0 !text-ink"
      aria-label="Clear search"
      onClick={onClear}
    >
      <CdsIconGlyph glyph={""} className="h-4 w-4 text-current text-[16px] [font-weight:533.25]" />
    </Button>
  );
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
  if (template.name === "Field monitor") {
    return `name: ${template.name}
description: ${template.description}
model: claude-sonnet-4-6
${yamlField("system", template.system)}
mcp_servers:
  - name: notion
    type: url
    url: https://mcp.notion.com/mcp
tools:
  - type: agent_toolset_20260401
  - type: mcp_toolset
    mcp_server_name: notion
    default_config:
      permission_policy:
        type: always_allow
metadata:
  template: field-monitor`;
  }

  if (template.name === "Support agent") {
    return `name: ${template.name}
description: ${template.description}
model: claude-sonnet-4-6
${yamlField("system", template.system)}
mcp_servers:
  - name: notion
    type: url
    url: https://mcp.notion.com/mcp
  - name: slack
    type: url
    url: https://mcp.slack.com/mcp
tools:
  - type: agent_toolset_20260401
  - type: mcp_toolset
    mcp_server_name: notion
    default_config:
      permission_policy:
        type: always_allow
  - type: mcp_toolset
    mcp_server_name: slack
    default_config:
      permission_policy:
        type: always_allow
metadata:
  template: support-agent`;
  }

  if (template.name === "Incident commander") {
    return `name: ${template.name}
description: ${template.description}
model: claude-opus-4-8
${yamlField("system", template.system)}
mcp_servers:
  - name: sentry
    type: url
    url: https://mcp.sentry.dev/mcp
  - name: linear
    type: url
    url: https://mcp.linear.app/mcp
  - name: slack
    type: url
    url: https://mcp.slack.com/mcp
  - name: github
    type: url
    url: https://api.githubcopilot.com/mcp/
tools:
  - type: agent_toolset_20260401
  - type: mcp_toolset
    mcp_server_name: sentry
    default_config:
      permission_policy:
        type: always_allow
  - type: mcp_toolset
    mcp_server_name: linear
    default_config:
      permission_policy:
        type: always_allow
  - type: mcp_toolset
    mcp_server_name: slack
    default_config:
      permission_policy:
        type: always_allow
  - type: mcp_toolset
    mcp_server_name: github
    default_config:
      permission_policy:
        type: always_allow
metadata:
  template: incident-commander`;
  }

  return `name: ${template.name === "Blank agent" ? "Untitled agent" : template.name}
description: ${template.description}
model: claude-sonnet-4-6
${yamlField("system", template.system)}
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

function yamlField(key: string, value: string) {
  if (!value.includes("\n")) return `${key}: ${value}`;
  return `${key}: |-\n${value.split("\n").map((line) => `  ${line}`).join("\n")}`;
}

function agentConfigFromYaml(source: string) {
  const modelId = yamlValue(source, "id", yamlValue(source, "model", "claude-sonnet-4-6"));
  const hasNotionMcp = source.includes("name: notion") && source.includes("https://mcp.notion.com/mcp");
  const hasSlackMcp = source.includes("name: slack") && source.includes("https://mcp.slack.com/mcp");
  const hasSentryMcp = source.includes("name: sentry") && source.includes("https://mcp.sentry.dev/mcp");
  const hasLinearMcp = source.includes("name: linear") && source.includes("https://mcp.linear.app/mcp");
  const hasGithubMcp = source.includes("name: github") && source.includes("https://api.githubcopilot.com/mcp/");
  const hasMcpToolset = source.includes("type: mcp_toolset");
  const mcpServers = [
    ...(hasNotionMcp
      ? [
          {
            name: "notion",
            type: "url",
            url: "https://mcp.notion.com/mcp"
          }
        ]
      : []),
    ...(hasSentryMcp
      ? [
          {
            name: "sentry",
            type: "url",
            url: "https://mcp.sentry.dev/mcp"
          }
        ]
      : []),
    ...(hasLinearMcp
      ? [
          {
            name: "linear",
            type: "url",
            url: "https://mcp.linear.app/mcp"
          }
        ]
      : []),
    ...(hasSlackMcp
      ? [
          {
            name: "slack",
            type: "url",
            url: "https://mcp.slack.com/mcp"
          }
        ]
      : []),
    ...(hasGithubMcp
      ? [
          {
            name: "github",
            type: "url",
            url: "https://api.githubcopilot.com/mcp/"
          }
        ]
      : [])
  ];
  const tools: Array<Record<string, unknown>> = [
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
  ];
  if (hasMcpToolset && hasNotionMcp) {
    tools.push({
      type: "mcp_toolset",
      mcp_server_name: "notion",
      default_config: {
        permission_policy: {
          type: "always_allow"
        }
      },
      configs: []
    });
  }
  if (hasMcpToolset && hasSentryMcp) {
    tools.push({
      type: "mcp_toolset",
      mcp_server_name: "sentry",
      default_config: {
        permission_policy: {
          type: "always_allow"
        }
      },
      configs: []
    });
  }
  if (hasMcpToolset && hasLinearMcp) {
    tools.push({
      type: "mcp_toolset",
      mcp_server_name: "linear",
      default_config: {
        permission_policy: {
          type: "always_allow"
        }
      },
      configs: []
    });
  }
  if (hasMcpToolset && hasSlackMcp) {
    tools.push({
      type: "mcp_toolset",
      mcp_server_name: "slack",
      default_config: {
        permission_policy: {
          type: "always_allow"
        }
      },
      configs: []
    });
  }
  if (hasMcpToolset && hasGithubMcp) {
    tools.push({
      type: "mcp_toolset",
      mcp_server_name: "github",
      default_config: {
        permission_policy: {
          type: "always_allow"
        }
      },
      configs: []
    });
  }

  const metadata = source.includes("template: support-agent")
    ? { template: "support-agent" }
    : source.includes("template: incident-commander")
      ? { template: "incident-commander" }
      : source.includes("template: field-monitor")
        ? { template: "field-monitor" }
        : {};

  return {
    name: yamlValue(source, "name", "Untitled agent"),
    description: yamlValue(source, "description", "A blank starting point with the core toolset."),
    model: {
      id: modelId,
      speed: "standard"
    },
    system: yamlValue(source, "system", "You are a general-purpose agent that can research, write code, run commands, and use connected tools to complete the user's task end to end."),
    mcp_servers: mcpServers,
    tools,
    skills: [],
    metadata
  };
}

function yamlValue(source: string, key: string, fallback: string) {
  const lines = source.split("\n");
  const lineIndex = lines.findIndex((item) => item.trim().startsWith(`${key}:`));
  if (lineIndex === -1) return fallback;
  const line = lines[lineIndex];
  if (!line) return fallback;
  const value = line.trim().slice(key.length + 1).trim();
  if (!value) return fallback;
  if (value === "|-" || value === "|") {
    const blockLines: string[] = [];
    for (const item of lines.slice(lineIndex + 1)) {
      if (item === "") {
        blockLines.push("");
        continue;
      }
      if (!item.startsWith(" ")) break;
      blockLines.push(item.replace(/^ {1,2}/, ""));
    }
    const block = blockLines.join("\n").trimEnd();
    return block || fallback;
  }
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
