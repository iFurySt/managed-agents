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

export async function listAgents(): Promise<Agent[]> {
  const data = await getJSON<{ items: Agent[] }>("/api/agents");
  return data.items;
}

export async function getAgent(id: string): Promise<Agent> {
  return getJSON<Agent>(`/api/agents/${id}`);
}

export async function createAgent(input: Partial<Agent>): Promise<Agent> {
  return postJSON<Agent>("/api/agents", input);
}

export async function listSessions(): Promise<Session[]> {
  const data = await getJSON<{ items: Session[] }>("/api/sessions");
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

export async function listDeployments(): Promise<Deployment[]> {
  const data = await getJSON<{ items: Deployment[] }>("/api/deployments");
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

export async function listEnvironments(): Promise<Environment[]> {
  const data = await getJSON<{ items: Environment[] }>("/api/environments");
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

export async function listVaults(): Promise<Vault[]> {
  const data = await getJSON<{ items: Vault[] }>("/api/vaults");
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

export async function listMemoryStores(): Promise<MemoryStore[]> {
  const data = await getJSON<{ items: MemoryStore[] }>("/api/memory-stores");
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

export async function listFiles(): Promise<WorkspaceFile[]> {
  const data = await getJSON<{ items: WorkspaceFile[] }>("/api/files");
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
