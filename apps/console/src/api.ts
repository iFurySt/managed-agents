import type {
  Agent,
  CollectionName,
  CreateDeploymentInput,
  CreateEnvironmentInput,
  CreateSessionInput,
  Deployment,
  DeploymentRun,
  Environment,
  Resource,
  Session,
  UpdateEnvironmentInput
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

export async function listCollection(collection: CollectionName): Promise<Resource[]> {
  const data = await getJSON<{ items: Resource[] }>(`/api/${collection}`);
  return data.items;
}
