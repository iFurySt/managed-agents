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

export type CollectionName =
  | "sessions"
  | "deployments"
  | "environments"
  | "vaults"
  | "memory-stores"
  | "files"
  | "skills";
