import type { Agent, CollectionName, CreateSessionInput, Resource, Session } from "./types";

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

export async function listCollection(collection: CollectionName): Promise<Resource[]> {
  const data = await getJSON<{ items: Resource[] }>(`/api/${collection}`);
  return data.items;
}
