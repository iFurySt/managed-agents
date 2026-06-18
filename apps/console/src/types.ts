export type Agent = {
  id: string;
  name: string;
  model: string;
  status: string;
  description: string;
  systemPrompt: string;
  tools: string;
  skills: string;
  createdAt: string;
  updatedAt: string;
};

export type Resource = {
  id: string;
  kind: string;
  name: string;
  status: string;
  description: string;
  primary: string;
  secondary: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionEvent = {
  id: string;
  sessionId: string;
  role: string;
  kind: string;
  summary: string;
  status: string;
  tokens: string;
  cost: string;
  offset: string;
  createdAt: string;
};

export type Session = {
  id: string;
  name: string;
  status: string;
  agentId: string;
  agentName: string;
  environmentId: string;
  environmentName: string;
  deploymentId: string;
  vaults: string;
  resources: string;
  duration: string;
  tokens: string;
  cost: string;
  createdLabel: string;
  createdAt: string;
  updatedAt: string;
  events?: SessionEvent[];
};

export type CreateSessionInput = {
  title: string;
  agentId: string;
  environmentId: string;
  vaults: string[];
  resources: string[];
};

export type CollectionName =
  | "deployments"
  | "environments"
  | "vaults"
  | "memory-stores"
  | "files"
  | "skills";
