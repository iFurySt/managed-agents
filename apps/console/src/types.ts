export type Agent = {
  id: string;
  name: string;
  model: string;
  status: string;
  description: string;
  systemPrompt: string;
  tools: string;
  skills: string;
  version: string;
  /** Full version history, newest first. Falls back to a single entry built from `version`/`createdAt` when absent. */
  versions?: { version: string; createdAt: string }[];
  configYaml: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateAgentInput = {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  configYaml: string;
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

export type MemoryRecord = {
  id: string;
  memoryStoreId: string;
  path: string;
  displayName?: string;
  status: string;
  size: string;
  content: string;
  authorId: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryStore = {
  id: string;
  name: string;
  status: string;
  description: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
  memories?: MemoryRecord[];
};

export type CreateMemoryStoreInput = {
  name: string;
  description: string;
};

export type CreateMemoryInput = {
  path: string;
  content: string;
};

export type WorkspaceFile = {
  id: string;
  name: string;
  status: string;
  kind: string;
  mediaType: string;
  size: string;
  checksum: string;
  description: string;
  content: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceFileInput = {
  name: string;
  mediaType: string;
  content: string;
  description: string;
};

export type SkillVersion = {
  id: string;
  skillId: string;
  version: string;
  releasedAt: string;
  latest: boolean;
  description: string;
  createdAt: string;
};

export type SkillPackage = {
  id: string;
  name: string;
  status: string;
  description: string;
  slug: string;
  owner: string;
  version: string;
  latestLabel: string;
  createdLabel: string;
  updatedLabel: string;
  createdAt: string;
  updatedAt: string;
  versions?: SkillVersion[];
};

export type CreateSkillPackageInput = {
  name: string;
  description: string;
  version: string;
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

export type UpdateDeploymentInput = CreateDeploymentInput;

export type CollectionName = never;
