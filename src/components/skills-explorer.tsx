"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SkillRow } from "@/lib/api-types";

interface SkillsResponse {
  skills: SkillRow[];
  total: number;
  families: { name: string; count: number }[];
  repos: { name: string; count: number }[];
}

const REPO_LABEL: Record<string, string> = {
  "ruby-agent-skills": "Ruby · Rails",
  "react-agent-skills": "React · TypeScript",
  "node-agent-skills": "Node.js · TypeScript",
};

const REPO_URL: Record<string, string> = {
  "ruby-agent-skills": "https://github.com/shubhamtaywade82/ruby-agent-skills",
  "react-agent-skills": "https://github.com/shubhamtaywade82/react-agent-skills",
  "node-agent-skills": "https://github.com/shubhamtaywade82/node-agent-skills",
};

function repoShort(repo: string) {
  if (repo === "ruby-agent-skills") return "ruby";
  if (repo === "node-agent-skills") return "node";
  return "react";
}

export function SkillsExplorer() {
  const [search, setSearch] = useState("");
  const [repo, setRepo] = useState("All");
  const [family, setFamily] = useState("All");
  const [data, setData] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (repo !== "All") params.set("repo", repo);
      if (family !== "All") params.set("family", family);
      fetch(`/api/skills?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d: SkillsResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, repo, family]);

  const totalAll = useMemo(
    () => (data?.repos ?? []).reduce((acc, r) => acc + r.count, 0),
    [data],
  );

  return (
    <section id="skills" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            03 · Skill library
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Agent-executable skills, three governed packs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every skill from <span className="font-medium text-foreground">ruby-agent-skills</span>{" "}
            (Ruby · Rails · workflow),{" "}
            <span className="font-medium text-foreground">react-agent-skills</span> (React ·
            TypeScript · frontend) and{" "}
            <span className="font-medium text-foreground">node-agent-skills</span> (Node.js ·
            TypeScript · backend, incl. its adapter skills) — with routing triggers, families,
            deprecation succession and the pack defaults the agent must always consider.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills — try “active record”, “hooks”, “a11y”…"
                className="pl-9"
                aria-label="Search skills"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data
                ? `Showing ${data.skills.length} of ${data.total} skills`
                : "Loading skill packs…"}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by skill pack">
            <button
              type="button"
              onClick={() => {
                setRepo("All");
                setFamily("All");
              }}
              aria-pressed={repo === "All"}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                repo === "All"
                  ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
              )}
            >
              All packs {totalAll > 0 ? totalAll : ""}
            </button>
            {(data?.repos ?? []).map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setRepo((prev) => (prev === r.name ? "All" : r.name));
                  setFamily("All");
                }}
                aria-pressed={repo === r.name}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  repo === r.name
                    ? r.name === "ruby-agent-skills"
                      ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                      : r.name === "node-agent-skills"
                        ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border-violet-500 bg-violet-600 text-white hover:bg-violet-700"
                    : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
                )}
              >
                {REPO_LABEL[r.name] ?? r.name} {r.count}
              </button>
            ))}
          </div>

          <div
            className="flex max-h-[5.5rem] flex-wrap gap-1.5 overflow-y-auto pr-1 scrollbar-slim"
            role="group"
            aria-label="Filter by family"
            tabIndex={0}
          >
            <button
              type="button"
              onClick={() => setFamily("All")}
              aria-pressed={family === "All"}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                family === "All"
                  ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
              )}
            >
              All families
            </button>
            {(data?.families ?? []).map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setFamily((prev) => (prev === f.name ? "All" : f.name))}
                  aria-pressed={family === f.name}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    family === f.name
                      ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
                  )}
                >
                  {f.name} {f.count}
                </button>
              ))}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="max-h-[560px] overflow-y-auto scrollbar-slim">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Skill</th>
                    <th className="hidden px-3 py-2.5 font-medium md:table-cell">Family</th>
                    <th className="hidden px-3 py-2.5 font-medium xl:table-cell">Routes on</th>
                    <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Pack</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && data === null
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3" colSpan={4}>
                            <Skeleton className="h-8 w-full" />
                          </td>
                        </tr>
                      ))
                    : null}
                  {data?.skills.map((skill) => (
                    <tr
                      key={skill.id}
                      className={cn(
                        "border-t transition-colors hover:bg-muted/40",
                        skill.deprecated && "opacity-70",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "font-mono text-[13px] font-semibold",
                              skill.deprecated
                                ? "text-muted-foreground line-through decoration-rose-400/60"
                                : skill.repo === "ruby-agent-skills"
                                  ? "text-rose-700 dark:text-rose-400"
                                  : skill.repo === "node-agent-skills"
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-violet-700 dark:text-violet-400",
                            )}
                          >
                            {skill.name}
                          </span>
                          {skill.alwaysConsider ? (
                            <span
                              title="Pack default: the agent always considers this skill"
                              className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            >
                              always consider
                            </span>
                          ) : null}
                          {skill.deprecated ? (
                            <span
                              title={`Superseded by ${skill.supersededBy}`}
                              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              deprecated → {skill.supersededBy}
                            </span>
                          ) : null}
                          <a
                            href={`${REPO_URL[skill.repo]}/tree/main/skills/${skill.name}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${skill.name} on GitHub`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{skill.description}</p>
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {skill.family}
                        </Badge>
                      </td>
                      <td className="hidden max-w-md px-3 py-2.5 text-[11px] text-muted-foreground xl:table-cell">
                        <span className="line-clamp-2 font-mono">
                          {skill.triggers ? skill.triggers.split(",").slice(0, 8).join(" · ") : "—"}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            skill.repo === "ruby-agent-skills"
                              ? "border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-400"
                              : skill.repo === "node-agent-skills"
                                ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
                                : "border-violet-200 text-violet-700 dark:border-violet-900 dark:text-violet-400",
                          )}
                        >
                          {repoShort(skill.repo)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {data && data.skills.length === 0 ? (
                    <tr className="border-t">
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No skills match{" "}
                        <span className="font-medium text-foreground">
                          “{search || family !== "All" ? family : repo}”
                        </span>
                        . Try a different term.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-amber-500" aria-hidden />
            Skills follow the Agent Skills specification — a routed skill loads its change
            contract only when the task matches its triggers.
          </p>
        </div>
      </div>
    </section>
  );
}
