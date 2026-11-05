"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeView, type CodeLanguage } from "@/components/code-view";
import type { GeneratedFiles } from "@/lib/generator";
import type { BuilderConfig } from "@/lib/rubocop";

const TABS: { id: keyof GeneratedFiles; label: string; file: string; language: CodeLanguage }[] = [
  { id: "rubocopYml", label: ".rubocop.yml", file: ".rubocop.yml", language: "yaml" },
  { id: "gemfile", label: "Gemfile", file: "Gemfile", language: "ruby" },
  { id: "ciWorkflow", label: "lint.yml", file: "lint.yml", language: "yaml" },
  { id: "lintScript", label: "bin/lint", file: "lint", language: "bash" },
  { id: "setup", label: "Setup", file: "SETUP.txt", language: "bash" },
];

export function OutputPanel({
  files,
  loading,
  config,
}: {
  files: GeneratedFiles | null;
  loading: boolean;
  config: BuilderConfig;
}) {
  const [active, setActive] = useState<string>("rubocopYml");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  const code = files ? files[tab.id] : "";
  const lineCount = code ? code.replace(/\n$/, "").split("\n").length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${tab.file} copied to clipboard.`);
    } catch {
      toast.error("Clipboard is unavailable in this context.");
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tab.file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${tab.file}.`);
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Tabs value={active} onValueChange={setActive}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <TabsList className="h-auto w-full flex-wrap gap-0.5 sm:w-auto">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-1.5">
              {loading ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden /> compiling…
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" aria-hidden /> up to date
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={copy}
                disabled={!files}
              >
                <Copy className="size-3.5" aria-hidden /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={download}
                disabled={!files}
              >
                <Download className="size-3.5" aria-hidden /> Download
              </Button>
            </div>
          </div>

          <div className="border-b bg-muted/40 px-4 py-2 font-mono text-[11px] text-muted-foreground">
            Ruby {config.rubyVersion} · {config.plugins.length} plugins ·{" "}
            {config.excludes.length} excludes · {lineCount} lines · preset{" "}
            {config.preset}
          </div>

          {files === null ? (
            <div className="space-y-2 bg-zinc-950 p-5">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-4 bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="max-h-[72vh] overflow-y-auto scrollbar-slim bg-zinc-950">
              {TABS.map((t) => (
                <TabsContent key={t.id} value={t.id} className="mt-0">
                  <CodeView code={files[t.id]} language={t.language} />
                </TabsContent>
              ))}
            </div>
          )}
        </Tabs>
      </div>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        Commit <span className="font-mono">.rubocop.yml</span> at the repo root — the CI
        workflow and <span className="font-mono">bin/lint</span> assume it lives there.
      </p>
    </div>
  );
}
