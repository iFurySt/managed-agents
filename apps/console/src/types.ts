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

export type Environment = {
  id: string;
  name: string;
  status: string;
  type: string;
  description: string;
  networkingType: string;
  packageManager: string;
  packages: string;
  metadata: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEnvironmentInput = {
  name: string;
  hostingType: string;
  description: string;
};

export type UpdateEnvironmentInput = {
  name: string;
  description: string;
  networkingType: string;
  packageManager: string;
  packages: string[];
  metadata: string;
};

export type VaultCredential = {
  id: string;
  vaultId: string;
  name: string;
  authType: string;
  target: string;
  status: string;
  lastUsed: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type Vault = {
  id: string;
  name: string;
  status: string;
  description: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
  credentials?: VaultCredential[];
};

export type CreateVaultInput = {
  name: string;
};

export type CreateVaultCredentialInput = {
  name: string;
  authType: string;
  target: string;
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

export type DeploymentRun = {
  id: string;
  deploymentId: string;
  startedAt: string;
  startedLabel: string;
  trigger: string;
  result: string;
  agentVersion: string;
  sessionId: string;
  sessionStatus: string;
  createdAt: string;
};

export type Deployment = {
  id: string;
  name: string;
  status: string;
  agentId: string;
  agentName: string;
  agentVersion: string;
  environmentId: string;
  environmentName: string;
  vaults: string;
  memoryStores: string;
  trigger: string;
  schedule: string;
  timezone: string;
  initialMessage: string;
  nextRuns: string;
  lastRunLabel: string;
  createdLabel: string;
  createdAt: string;
  updatedAt: string;
  runs?: DeploymentRun[];
};

export type CreateDeploymentInput = {
  name: string;
  agentId: string;
  initialMessage: string;
  environmentId: string;
  vaults: string[];
  memoryStores: string[];
  trigger: string;
  schedule: string;
  timezone: string;
};

export type CollectionName =
  | "memory-stores"
  | "files"
  | "skills";
