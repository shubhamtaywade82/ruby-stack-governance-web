// Shared API row shapes returned by the governance API routes.

export interface CopRow {
  id: string;
  name: string;
  department: string;
  plugin: string;
  summary: string;
  options: string | null;
  guideUrl: string | null;
  defaultState: string;
  autoCorrect: boolean;
  corpusNote: string | null;
  betterNote: string | null;
}

export interface PluginRow {
  id: string;
  key: string;
  gem: string;
  name: string;
  description: string;
  category: string;
  docsUrl: string | null;
  defaultOn: boolean;
}

export interface MappingRow {
  id: string;
  source: string;
  feedback: string;
  cop: string;
  config: string;
  note: string | null;
}

export interface SavedPresetRow {
  id: string;
  name: string;
  description: string | null;
  config: string;
  createdAt: string;
}

export interface SkillRow {
  id: string;
  name: string;
  family: string;
  repo: string;
  description: string;
  triggers: string | null;
  alwaysConsider: boolean;
  deprecated: boolean;
  supersededBy: string | null;
}
