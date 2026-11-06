"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Corpus } from "@/lib/corpus";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; corpus: Corpus };

const LAYER_TONE: Record<string, string> = {
  static: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  runtime: "border-amber-500/40 text-amber-700 dark:text-amber-400",
  process: "border-sky-500/40 text-sky-700 dark:text-sky-400",
  "agent-context": "border-violet-500/40 text-violet-700 dark:text-violet-400",
  "agent-interface": "border-violet-500/40 text-violet-700 dark:text-violet-400",
};

export function CorpusSection() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [stackFilter, setStackFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/corpus", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const corpus = (await res.json()) as Corpus;
      setState({ status: "ready", corpus });
    } catch (e) {
      setState({ status: "error", message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stackCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (state.status !== "ready") return counts;
    for (const a of state.corpus.manifest.artifacts) {
      for (const s of a.stacks) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return counts;
  }, [state]);

  const visibleArtifacts = useMemo(() => {
    if (state.status !== "ready") return [];
    if (stackFilter === "all") return state.corpus.manifest.artifacts;
    return state.corpus.manifest.artifacts.filter((a) =>
      a.stacks.includes(stackFilter)
    );
  }, [state, stackFilter]);

  const mirrored = state.status === "ready"
    ? state.corpus.manifest.artifacts.filter((a) => a.mirror).length
    : 0;
  const scheduled = state.status === "ready"
    ? state.corpus.manifest.artifacts.filter((a) => a.mirror_target).length
    : 0;
  const total = state.status === "ready"
    ? state.corpus.manifest.artifacts.length
    : 0;
  const coveragePct =
    mirrored + scheduled > 0
      ? Math.round((mirrored / (mirrored + scheduled)) * 100)
      : 0;

  return (
    <section
      id="corpus"
      className="border-y border-border bg-muted/30"
      aria-labelledby="corpus-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2
              id="corpus-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Corpus
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Live from{" "}
              <a
                className="font-medium text-foreground underline-offset-4 hover:underline"
                href="https://github.com/shubhamtaywade82/ruby-stack-governance"
                rel="noreferrer"
                target="_blank"
              >
                ruby-stack-governance
              </a>
              . This UI is a <strong>view</strong>, not a copy — ratchets and
              the artifact index are read at request time from the source repo.
            </p>
          </div>
          {state.status === "ready" &&
            (state.corpus.source.sha ? (
              <a
                className="group inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={`${state.corpus.source.url}/commit/${state.corpus.source.sha}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                @ {state.corpus.source.sha.slice(0, 7)}
                <span className="text-muted-foreground/70 group-hover:text-muted-foreground">
                  {state.corpus.source.commitMessage.slice(0, 48) || "commit"}
                </span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                live (commit metadata rate-limited)
              </span>
            ))}
        </div>

        {state.status === "loading" && <CorpusSkeleton />}

        {state.status === "error" && (
          <Card className="mt-6 border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Could not reach the corpus
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {state.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={load}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        )}

        {state.status === "ready" && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Artifacts" value={total} hint="A01–A24" />
              <StatCard label="Mirrored" value={mirrored} hint="live skills now" />
              <StatCard label="Scheduled (W8)" value={scheduled} hint="mirror_target: true" />
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardDescription>skills_corpus_coverage</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">
                    {coveragePct}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={coveragePct} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    ratchet → 100% (W8)
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Ratchets</CardTitle>
                <CardDescription>
                  Single home:{" "}
                  <code className="font-mono text-xs">docs/ratchets.yml</code>.
                  Ratchets only tighten (Law 2).
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="w-16">Scope</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Next</TableHead>
                        <TableHead className="text-right">Target</TableHead>
                        <TableHead>Home</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.corpus.ratchets.map((r) => (
                        <TableRow key={r.metric}>
                          <TableCell className="font-mono text-xs">
                            {r.metric}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {r.scope}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {String(r.current)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {String(r.next)}
                            <span className="ml-1 text-[10px]">{r.next_due}</span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {String(r.target)}
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              {r.target_due}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {r.home}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Artifact manifest</CardTitle>
                <CardDescription>
                  Single home:{" "}
                  <code className="font-mono text-xs">
                    docs/artifacts/MANIFEST.yml
                  </code>
                  . Identity only — content lives in each artifact file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="mb-4 flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label="Filter artifacts by stack"
                >
                  {["all", ...[...stackCounts.keys()]].map((stack) => {
                    const count =
                      stack === "all"
                        ? state.status === "ready"
                          ? state.corpus.manifest.artifacts.length
                          : 0
                        : (stackCounts.get(stack) ?? 0);
                    const active = stackFilter === stack;
                    return (
                      <button
                        key={stack}
                        type="button"
                        onClick={() => setStackFilter(stack)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? "border-foreground/60 bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {stack}
                        <span
                          className={`ml-1.5 tabular-nums ${
                            active ? "opacity-70" : "opacity-50"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleArtifacts.map((a) => (
                    <a
                      key={a.id}
                      className="group rounded-lg border border-border bg-background p-3 transition-colors hover:border-foreground/30 hover:bg-accent/40"
                      href={`${state.corpus.source.url}/blob/${state.corpus.source.branch}/${a.file}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {a.id}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${LAYER_TONE[a.layer] ?? ""}`}
                        >
                          {a.layer}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
                        {a.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {a.stacks.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                        {a.mirror && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                            mirrored
                          </span>
                        )}
                        {a.mirror_target && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            W8
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function CorpusSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardHeader className="pb-2 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-72" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
