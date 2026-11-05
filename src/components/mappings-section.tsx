"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MappingRow } from "@/lib/api-types";

const BEYOND = [
  {
    title: "Semantic naming",
    body: "RuboCop verifies snake_case, not intent. temp, arr, data and pro sail through every cop — only the PR checklist catches them.",
    quote: "“Local variable stick is inappropriately named.”",
  },
  {
    title: "Fat model, skinny controller",
    body: "No cop measures where business logic lives. Reviewers keep controllers HTTP-thin and move domain logic into models, services and decorators.",
    quote: "“Business logic is preferred to be written majorly in Models.”",
  },
  {
    title: "Exceptions are not control flow",
    body: "rescue NoMethodError standing in for an existence check masks bugs. Standardize on find_by / exists?, and reserve rescue for external failures.",
    quote: "“Exception Handler is inappropriately used…”",
  },
  {
    title: "W5H and YARD quality",
    body: "Style/Documentation proves a comment exists; rubocop-yard validates its syntax. Only review can grade the W5H content — What, Why, When, Where, Who, How.",
    quote: null,
  },
];

function MappingTable({
  title,
  rows,
  dotClass,
}: {
  title: string;
  rows: MappingRow[];
  dotClass: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className={cn("size-2 rounded-full", dotClass)} aria-hidden />
          {title}
        </h3>
        <Badge variant="secondary" className="font-mono text-[10px]">
          {rows.length} rules
        </Badge>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-slim">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/95 backdrop-blur">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Rule</th>
              <th className="px-3 py-2 font-medium">Enforcing cop</th>
              <th className="px-4 py-2 font-medium">Config</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t align-top transition-colors hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <p className="text-xs leading-snug">{m.feedback}</p>
                  {m.note ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{m.note}</p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  {m.cop}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                  {m.config}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MappingsSection() {
  const [data, setData] = useState<{ corpus: MappingRow[]; betterSpecs: MappingRow[] } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mappings")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="mappings" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            04 · Mappings
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Every rule, traced to its cop
          </h2>
          <p className="mt-3 text-muted-foreground">
            The deterministic mapping from mentor feedback and BetterSpecs guidelines to the
            exact cop and config line that enforces them.
          </p>
        </div>

        {data === null ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <MappingTable
              title="Training corpus → cops"
              rows={data.corpus}
              dotClass="bg-amber-400"
            />
            <MappingTable
              title="BetterSpecs → cops"
              rows={data.betterSpecs}
              dotClass="bg-emerald-400"
            />
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-lg font-semibold tracking-tight">
            Beyond static analysis — the PR-review checklist
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            RuboCop cannot parse architectural intent. These four corpus mandates stay
            human-enforced in pull requests.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BEYOND.map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-4">
                <h4 className="text-sm font-semibold">{item.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                {item.quote ? (
                  <p className="mt-3 border-l-2 border-rose-300 pl-2 text-[11px] italic text-muted-foreground dark:border-rose-800">
                    {item.quote}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
