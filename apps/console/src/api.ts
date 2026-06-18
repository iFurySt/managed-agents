import type {
  Agent,
  CollectionName,
  CreateDeploymentInput,
  CreateEnvironmentInput,
  CreateMemoryInput,
  CreateMemoryStoreInput,
  CreateSessionInput,
  CreateSkillPackageInput,
  CreateVaultCredentialInput,
  CreateVaultInput,
  CreateWorkspaceFileInput,
  Deployment,
  DeploymentRun,
  Environment,
  MemoryRecord,
  MemoryStore,
  Resource,
  Session,
  SkillPackage,
  UpdateAgentInput,
  UpdateEnvironmentInput,
  Vault,
  VaultCredential,
  WorkspaceFile
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function patchJSON<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function deleteJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function listAgents(params: { q?: string; status?: string; created?: string } = {}): Promise<Agent[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.created && params.created !== "All time") search.set("created", params.created);
  const query = search.toString();
  const data = await getJSON<{ items: Agent[] }>(`/api/agents${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getAgent(id: string): Promise<Agent> {
  return getJSON<Agent>(`/api/agents/${id}`);
}

export async function createAgent(input: Partial<Agent>): Promise<Agent> {
  return postJSON<Agent>("/api/agents", input);
}

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  return patchJSON<Agent>(`/api/agents/${id}`, input);
}

export async function archiveAgent(id: string): Promise<Agent> {
  return postJSON<Agent>(`/api/agents/${id}/archive`, {});
}

export async function listSessions(params: { q?: string; status?: string; agentId?: string; deploymentId?: string; created?: string } = {}): Promise<Session[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.agentId && params.agentId !== "All") search.set("agentId", params.agentId);
  if (params.deploymentId && params.deploymentId !== "All") search.set("deploymentId", params.deploymentId);
  if (params.created && params.created !== "All time") search.set("created", params.created);
  const query = search.toString();
  const data = await getJSON<{ items: Session[] }>(`/api/sessions${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getSession(id: string): Promise<Session> {
  return getJSON<Session>(`/api/sessions/${id}`);
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  return postJSON<Session>("/api/sessions", input);
}

export async function cancelSession(id: string): Promise<Session> {
  return postJSON<Session>(`/api/sessions/${id}/cancel`, {});
}

export async function createSessionMessage(id: string, message: string): Promise<Session> {
  return postJSON<Session>(`/api/sessions/${id}/messages`, { message });
}

export async function listDeployments(params: { q?: string; status?: string; agentId?: string } = {}): Promise<Deployment[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.agentId && params.agentId !== "All") search.set("agentId", params.agentId);
  const query = search.toString();
  const data = await getJSON<{ items: Deployment[] }>(`/api/deployments${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getDeployment(id: string): Promise<Deployment> {
  return getJSON<Deployment>(`/api/deployments/${id}`);
}

export async function createDeployment(input: CreateDeploymentInput): Promise<Deployment> {
  return postJSON<Deployment>("/api/deployments", input);
}

export async function runDeployment(id: string): Promise<DeploymentRun> {
  return postJSON<DeploymentRun>(`/api/deployments/${id}/run`, {});
}

export async function pauseDeployment(id: string): Promise<Deployment> {
  return postJSON<Deployment>(`/api/deployments/${id}/pause`, {});
}

export async function resumeDeployment(id: string): Promise<Deployment> {
  return postJSON<Deployment>(`/api/deployments/${id}/resume`, {});
}

export async function archiveDeployment(id: string): Promise<Deployment> {
  return postJSON<Deployment>(`/api/deployments/${id}/archive`, {});
}

export async function listEnvironments(params: { q?: string; status?: string } = {}): Promise<Environment[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  const query = search.toString();
  const data = await getJSON<{ items: Environment[] }>(`/api/environments${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getEnvironment(id: string): Promise<Environment> {
  return getJSON<Environment>(`/api/environments/${id}`);
}

export async function createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
  return postJSON<Environment>("/api/environments", input);
}

export async function updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<Environment> {
  return patchJSON<Environment>(`/api/environments/${id}`, input);
}

export async function archiveEnvironment(id: string): Promise<Environment> {
  return postJSON<Environment>(`/api/environments/${id}/archive`, {});
}

export async function listVaults(params: { q?: string; status?: string } = {}): Promise<Vault[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  const query = search.toString();
  const data = await getJSON<{ items: Vault[] }>(`/api/vaults${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getVault(id: string): Promise<Vault> {
  return getJSON<Vault>(`/api/vaults/${id}`);
}

export async function createVault(input: CreateVaultInput): Promise<Vault> {
  return postJSON<Vault>("/api/vaults", input);
}

export async function archiveVault(id: string): Promise<Vault> {
  return postJSON<Vault>(`/api/vaults/${id}/archive`, {});
}

export async function deleteVault(id: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/vaults/${id}`);
}

export async function createVaultCredential(id: string, input: CreateVaultCredentialInput): Promise<VaultCredential> {
  return postJSON<VaultCredential>(`/api/vaults/${id}/credentials`, input);
}

export async function archiveVaultCredential(vaultId: string, credentialId: string): Promise<VaultCredential> {
  return postJSON<VaultCredential>(`/api/vaults/${vaultId}/credentials/${credentialId}/archive`, {});
}

export async function deleteVaultCredential(vaultId: string, credentialId: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/vaults/${vaultId}/credentials/${credentialId}`);
}

export async function listMemoryStores(params: { q?: string; status?: string; created?: string } = {}): Promise<MemoryStore[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.created && params.created !== "All time") search.set("created", params.created);
  const query = search.toString();
  const data = await getJSON<{ items: MemoryStore[] }>(`/api/memory-stores${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getMemoryStore(id: string): Promise<MemoryStore> {
  return getJSON<MemoryStore>(`/api/memory-stores/${id}`);
}

export async function createMemoryStore(input: CreateMemoryStoreInput): Promise<MemoryStore> {
  return postJSON<MemoryStore>("/api/memory-stores", input);
}

export async function archiveMemoryStore(id: string): Promise<MemoryStore> {
  return postJSON<MemoryStore>(`/api/memory-stores/${id}/archive`, {});
}

export async function deleteMemoryStore(id: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/memory-stores/${id}`);
}

export async function createMemory(id: string, input: CreateMemoryInput): Promise<MemoryRecord> {
  return postJSON<MemoryRecord>(`/api/memory-stores/${id}/memories`, input);
}

export async function deleteMemory(storeId: string, memoryId: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/memory-stores/${storeId}/memories/${memoryId}`);
}

export async function listFiles(params: { q?: string; kind?: string; status?: string } = {}): Promise<WorkspaceFile[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.kind && params.kind !== "All") search.set("kind", params.kind);
  if (params.status && params.status !== "All") search.set("status", params.status);
  const query = search.toString();
  const data = await getJSON<{ items: WorkspaceFile[] }>(`/api/files${query ? `?${query}` : ""}`);
  return data.items;
}

export async function getFile(id: string): Promise<WorkspaceFile> {
  return getJSON<WorkspaceFile>(`/api/files/${id}`);
}

export async function createFile(input: CreateWorkspaceFileInput): Promise<WorkspaceFile> {
  return postJSON<WorkspaceFile>("/api/files", input);
}

export async function deleteFile(id: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/files/${id}`);
}

export async function listSkills(): Promise<SkillPackage[]> {
  const data = await getJSON<{ items: SkillPackage[] }>("/api/skills");
  return data.items;
}

export async function getSkill(id: string): Promise<SkillPackage> {
  return getJSON<SkillPackage>(`/api/skills/${id}`);
}

export async function createSkill(input: CreateSkillPackageInput): Promise<SkillPackage> {
  return postJSON<SkillPackage>("/api/skills", input);
}

export async function deleteSkill(id: string): Promise<{ deleted: boolean }> {
  return deleteJSON<{ deleted: boolean }>(`/api/skills/${id}`);
}

export async function listCollection(collection: CollectionName): Promise<Resource[]> {
  const data = await getJSON<{ items: Resource[] }>(`/api/${collection}`);
  return data.items;
}
