"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CopRow } from "@/lib/api-types";

interface CopsResponse {
  cops: CopRow[];
  total: number;
  departments: { name: string; count: number }[];
}

export function CopExplorer() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [data, setData] = useState<CopsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (department !== "All") params.set("department", department);
      fetch(`/api/cops?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d: CopsResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, department]);

  const totalAll = useMemo(
    () => (data?.departments ?? []).reduce((acc, d) => acc + d.count, 0),
    [data],
  );

  return (
    <section id="cops" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            02 · Cop explorer
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            The full enforcement catalog
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every cop the baseline can enforce — searchable, with its department, options,
            defaults and corpus / BetterSpecs alignment.
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
                placeholder="Search cops — try “context”, “rescue”, “find_by”…"
                className="pl-9"
                aria-label="Search cops"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data
                ? `Showing ${data.cops.length} of ${data.total} cops`
                : "Loading catalog…"}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by department">
            <button
              type="button"
              onClick={() => setDepartment("All")}
              aria-pressed={department === "All"}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                department === "All"
                  ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
              )}
            >
              All {totalAll > 0 ? totalAll : ""}
            </button>
            {(data?.departments ?? []).map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => setDepartment(d.name)}
                aria-pressed={department === d.name}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  department === d.name
                    ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-background text-muted-foreground hover:border-rose-300 hover:text-foreground dark:hover:border-rose-800",
                )}
              >
                {d.name} {d.count}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="max-h-[560px] overflow-y-auto scrollbar-slim">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Cop</th>
                    <th className="hidden px-3 py-2.5 font-medium md:table-cell">Department</th>
                    <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Key options</th>
                    <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Aligned</th>
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
                  {data?.cops.map((cop) => (
                    <tr key={cop.id} className="border-t transition-colors hover:bg-muted/40">
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[13px] font-semibold text-rose-700 dark:text-rose-400">
                            {cop.name}
                          </span>
                          {cop.defaultState === "disabled" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground"
                            >
                              off by default
                            </Badge>
                          ) : null}
                          {cop.autoCorrect ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground"
                            >
                              autocorrects
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{cop.summary}</p>
                        {cop.guideUrl ? (
                          <a
                            href={cop.guideUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-block text-[10px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                          >
                            cop docs ↗
                          </a>
                        ) : null}
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {cop.department}
                        </Badge>
                      </td>
                      <td className="hidden px-3 py-2.5 font-mono text-[11px] text-muted-foreground lg:table-cell">
                        {cop.options || "—"}
                      </td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">
                        <div className="flex flex-col items-start gap-1 text-[10px]">
                          {cop.corpusNote ? (
                            <span
                              title={cop.corpusNote}
                              className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            >
                              corpus
                            </span>
                          ) : null}
                          {cop.betterNote ? (
                            <span
                              title={cop.betterNote}
                              className="rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            >
                              BetterSpecs
                            </span>
                          ) : null}
                          {!cop.corpusNote && !cop.betterNote ? (
                            <span className="text-muted-foreground">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data && data.cops.length === 0 ? (
                    <tr className="border-t">
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No cops match{" "}
                        <span className="font-medium text-foreground">
                          “{search || department}”
                        </span>
                        . Try a different term.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
