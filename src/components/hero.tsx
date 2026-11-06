"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, FileCode2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeView } from "@/components/code-view";

const PREVIEW = `# Deterministic, organization-wide enforcement
plugins:
  - rubocop-rails
  - rubocop-rspec
  - rubocop-factory_bot

AllCops:
  TargetRubyVersion: 3.4
  NewCops: enable

Metrics/ParameterLists:
  Max: 2          # corpus: max 2 arguments

RSpec/ContextWording:
  Prefixes:
    - when
    - with
    - without`;

interface Stats {
  cops: number;
  plugins: number;
  mappings: number;
  presets: number;
  skills: number;
}

export function Hero() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: Stats) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-950/40" />
        <div className="absolute right-0 top-40 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/20" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="mb-5 gap-1.5 border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Deterministic · Ruby · Rails · React · Node
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Organization-wide stack enforcement,{" "}
            <span className="text-rose-600 dark:text-rose-400">generated in seconds</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
            Pick your Ruby and Rails targets, plugins and strictness — the studio emits a complete{" "}
            <span className="font-medium text-foreground">.rubocop.yml</span>, Gemfile group, CI
            gates and lint script. When the frontend is React, route the same discipline through
            the governed{" "}
            <span className="font-medium text-foreground">agent skill packs</span> — 230+ skills
            covering every boundary of the stack.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500"
            >
              <a href="#builder">
                Open the builder <ArrowDown className="size-4" aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#cops">Browse {stats ? `${stats.cops} cops` : "the catalog"}</a>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "cops cataloged", value: stats?.cops },
              { label: "agent skills", value: stats?.skills },
              { label: "plugin extensions", value: stats?.plugins },
              { label: "guide mappings", value: stats?.mappings },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-card p-3.5">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 font-mono text-2xl font-semibold">
                  {item.value === undefined ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl border bg-zinc-950 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
              <span className="size-2.5 rounded-full bg-rose-500/80" aria-hidden />
              <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
              <span className="size-2.5 rounded-full bg-emerald-500/80" aria-hidden />
              <span className="ml-3 font-mono text-xs text-zinc-400">.rubocop.yml</span>
            </div>
            <CodeView code={PREVIEW} language="yaml" />
          </div>
          <div className="absolute -bottom-4 -left-3 hidden rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:block">
            <ShieldCheck
              className="mr-1.5 inline size-3.5 text-rose-600"
              aria-hidden
            />
            CI gate · zero tolerance
          </div>
          <div className="absolute -top-4 -right-3 hidden rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:block">
            <FileCode2 className="mr-1.5 inline size-3.5 text-rose-600" aria-hidden />
            5 artifacts, one click
          </div>
        </motion.div>
      </div>
    </section>
  );
}
