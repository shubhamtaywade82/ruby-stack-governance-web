import { load as yamlLoad } from "js-yaml";

/**
 * ruby-stack-governance-web is a VIEW over the ruby-stack-governance corpus.
 * The corpus is the single home for every ratchet, artifact, and limit (Law 1).
 * This module reads it live, anonymously (the source repo is public), at request
 * time — nothing here is copied or restated. If a value drifts in the source, it
 * drifts here too, by design.
 *
 * Source of truth: https://github.com/shubhamtaywade82/ruby-stack-governance
 */

export const CORPUS_SOURCE = {
  owner: "shubhamtaywade82",
  repo: "ruby-stack-governance",
  branch: "main",
} as const;

const RAW_BASE = `https://raw.githubusercontent.com/${CORPUS_SOURCE.owner}/${CORPUS_SOURCE.repo}/${CORPUS_SOURCE.branch}`;
const COMMITS_URL = `https://api.github.com/repos/${CORPUS_SOURCE.owner}/${CORPUS_SOURCE.repo}/commits/${CORPUS_SOURCE.branch}`;

export interface Ratchet {
  metric: string;
  scope: string;
  current: string | number;
  next: string | number;
  next_due: string;
  target: string | number;
  target_due: string;
  home: string;
}

export interface ArtifactEntry {
  id: string;
  title: string;
  stacks: string[];
  layer: string;
  file: string;
  mirror?: boolean;
  mirror_target?: boolean;
  skills_slug?: string;
  skill_description?: string;
  globs?: string;
}

export interface CorpusManifest {
  artifacts: ArtifactEntry[];
}

export interface CorpusSource {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  commitMessage: string;
  commitDate: string;
  url: string;
}

export interface Corpus {
  source: CorpusSource;
  ratchets: Ratchet[];
  manifest: CorpusManifest;
  fetchedAt: string;
}

interface GithubCommit {
  sha: string;
  commit?: {
    message?: string;
    author?: { date?: string };
  };
}

let cache: { t: number; data: Corpus } | null = null;
const TTL_MS = 60_000;

export async function getCorpus(): Promise<Corpus> {
  if (cache && Date.now() - cache.t < TTL_MS) return cache.data;

  // raw.githubusercontent.com serves the corpus files without auth or User-Agent.
  const [ratchetsRes, manifestRes] = await Promise.all([
    fetch(`${RAW_BASE}/docs/ratchets.yml`, {
      next: { revalidate: 60 },
      headers: { Accept: "text/plain" },
    }),
    fetch(`${RAW_BASE}/docs/artifacts/MANIFEST.yml`, {
      next: { revalidate: 60 },
      headers: { Accept: "text/plain" },
    }),
  ]);

  const failed = [
    ratchetsRes.ok ? null : `ratchets=${ratchetsRes.status}`,
    manifestRes.ok ? null : `manifest=${manifestRes.status}`,
  ].filter(Boolean);

  if (failed.length > 0) {
    throw new Error(`corpus fetch failed: ${failed.join(", ")}`);
  }

  // Commit metadata is best-effort: GitHub's REST API requires a User-Agent
  // header and is anonymous-rate-limited (60/hr). If it fails, we still serve
  // the corpus (raw succeeded) with an empty sha rather than 502.
  let head: GithubCommit | null = null;
  try {
    const headRes = await fetch(COMMITS_URL, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ruby-stack-governance-web",
      },
    });
    if (headRes.ok) head = (await headRes.json()) as GithubCommit;
  } catch {
    head = null;
  }

  const [ratchetsText, manifestText] = await Promise.all([
    ratchetsRes.text(),
    manifestRes.text(),
  ]);

  const ratchets = (yamlLoad(ratchetsText) as Ratchet[] | null) ?? [];
  const manifest =
    (yamlLoad(manifestText) as CorpusManifest | null) ?? { artifacts: [] };

  const data: Corpus = {
    source: {
      owner: CORPUS_SOURCE.owner,
      repo: CORPUS_SOURCE.repo,
      branch: CORPUS_SOURCE.branch,
      sha: head?.sha ?? "",
      commitMessage: head?.commit?.message?.split("\n")[0] ?? "",
      commitDate: head?.commit?.author?.date ?? "",
      url: `https://github.com/${CORPUS_SOURCE.owner}/${CORPUS_SOURCE.repo}`,
    },
    ratchets,
    manifest,
    fetchedAt: new Date().toISOString(),
  };

  cache = { t: Date.now(), data };
  return data;
}

export interface CorpusCoverage {
  mirrored: number;
  scheduled: number;
  internal: number;
  total: number;
  /** skills_corpus_coverage ratchet value (current % of scheduled artifacts mirrored). */
  currentPct: number;
  targetPct: number;
}

export function coverageFromManifest(manifest: CorpusManifest): CorpusCoverage {
  let mirrored = 0;
  let scheduled = 0;
  for (const a of manifest.artifacts) {
    if (a.mirror) mirrored += 1;
    if (a.mirror_target) scheduled += 1;
  }
  const total = manifest.artifacts.length;
  // coverage ratchet: mirrored vs (mirrored + scheduled); matches docs/ratchets.yml.
  const denom = mirrored + scheduled || 1;
  const currentPct = Math.round((mirrored / denom) * 100);
  return { mirrored, scheduled, internal: total - mirrored - scheduled, total, currentPct, targetPct: 100 };
}
