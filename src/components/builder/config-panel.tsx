"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PluginRow, SavedPresetRow } from "@/lib/api-types";
import {
  EXCLUDE_OPTIONS,
  METRIC_FIELDS,
  PRESETS,
  RAILS_VERSIONS,
  RUBY_VERSIONS,
  STYLE_TOGGLES,
  type BuilderConfig,
  type MetricsConfig,
  type PresetKey,
  type TogglesConfig,
} from "@/lib/rubocop";

const WORKFLOW_FIELDS: {
  key: "newCops" | "suggestExtensions" | "legacyTodo" | "ciSecurity" | "specsFirstGate";
  label: string;
  help: string;
}[] = [
  { key: "newCops", label: "NewCops: enable", help: "Adopt cops introduced in minor upgrades" },
  {
    key: "suggestExtensions",
    label: "Extension suggestions",
    help: "Let RuboCop suggest missing plugins — noisy in CI",
  },
  {
    key: "legacyTodo",
    label: "Legacy baseline",
    help: "inherit_from .rubocop_todo.yml — freeze existing violations",
  },
  {
    key: "ciSecurity",
    label: "CI security job",
    help: "Brakeman + bundler-audit steps (gems added to the Gemfile)",
  },
  {
    key: "specsFirstGate",
    label: "Specs-First gate",
    help: "CI blocks app/ and lib/ changes without spec/ changes",
  },
];

export interface ConfigPanelProps {
  config: BuilderConfig;
  plugins: PluginRow[] | null;
  presets: SavedPresetRow[];
  presetName: string;
  saving: boolean;
  onPresetNameChange: (value: string) => void;
  onPatch: (partial: Partial<BuilderConfig>) => void;
  onMetric: (key: keyof MetricsConfig, value: number) => void;
  onToggle: (key: keyof TogglesConfig, value: boolean) => void;
  onPlugin: (key: string) => void;
  onExclude: (pattern: string) => void;
  onChoosePreset: (key: PresetKey) => void;
  onSavePreset: () => void;
  onLoadPreset: (preset: SavedPresetRow) => void;
  onDeletePreset: (preset: SavedPresetRow) => void;
}

function PluginCard({
  plugin,
  checked,
  onToggle,
}: {
  plugin: PluginRow;
  checked: boolean;
  onToggle: () => void;
}) {
  const optional = !plugin.defaultOn;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors",
        "hover:border-rose-300 dark:hover:border-rose-800",
        checked
          ? "border-rose-400 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/30"
          : optional
            ? "border-dashed"
            : "",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-0.5" />
      <span className="min-w-0">
        <span className="block truncate font-mono text-xs font-semibold">{plugin.key}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          {plugin.description}
        </span>
      </span>
    </label>
  );
}

export function ConfigPanel(props: ConfigPanelProps) {
  const { config, plugins, presets } = props;
  const activePreset = PRESETS.find((p) => p.key === config.preset);
  const railsSelected = config.plugins.includes("rubocop-rails");

  return (
    <div className="space-y-4">
      {/* ── Targets ─────────────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Targets</CardTitle>
          <CardDescription className="text-xs">
            Lock versions deterministically — prevents false positives during upgrades.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ruby-version" className="text-xs">
              Ruby
            </Label>
            <Select
              value={config.rubyVersion}
              onValueChange={(v) => props.onPatch({ rubyVersion: v })}
            >
              <SelectTrigger id="ruby-version" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RUBY_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rails-version" className="text-xs">
              Rails{" "}
              <span className="text-muted-foreground">(rubocop-rails)</span>
            </Label>
            <Select
              value={config.railsVersion}
              onValueChange={(v) => props.onPatch({ railsVersion: v })}
              disabled={!railsSelected}
            >
              <SelectTrigger id="rails-version" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RAILS_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Preset ──────────────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Strictness preset</CardTitle>
          <CardDescription className="text-xs">
            Sets every metric and toggle below; fine-tune afterwards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const isActive = config.preset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => props.onChoosePreset(p.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    isActive
                      ? "border-rose-500 bg-rose-50/70 ring-1 ring-rose-500/40 dark:border-rose-800 dark:bg-rose-950/40 dark:ring-rose-800/60"
                      : "hover:border-rose-300 hover:bg-rose-50/40 dark:hover:border-rose-800 dark:hover:bg-rose-950/20",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{p.label}</span>
                    {isActive ? (
                      <Check className="size-3.5 text-rose-600 dark:text-rose-400" aria-hidden />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                    {p.tagline}
                  </span>
                </button>
              );
            })}
          </div>
          {activePreset ? (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {activePreset.description}
            </p>
          ) : null}

          <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3">
            <div className="flex gap-2">
              <Input
                value={props.presetName}
                onChange={(e) => props.onPresetNameChange(e.target.value)}
                placeholder="Team preset name…"
                className="h-8 text-xs"
                aria-label="Preset name"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={props.onSavePreset}
                disabled={props.saving}
                className="h-8 shrink-0"
              >
                <Plus className="size-3.5" aria-hidden /> Save
              </Button>
            </div>
            {presets.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                No team presets yet — save the current configuration for reuse.
              </p>
            ) : (
              <ul className="max-h-32 space-y-1 overflow-y-auto scrollbar-slim">
                {presets.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1.5 text-xs"
                  >
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => props.onLoadPreset(p)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground"
                        onClick={() => props.onDeletePreset(p)}
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="size-3" aria-hidden />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Plugins ─────────────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Plugin extensions</CardTitle>
          <CardDescription className="text-xs">
            Modern <span className="font-mono">plugins:</span> directive (RuboCop ≥ 1.72).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plugins === null ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {plugins
                  .filter((p) => p.defaultOn)
                  .map((p) => (
                    <PluginCard
                      key={p.key}
                      plugin={p}
                      checked={config.plugins.includes(p.key)}
                      onToggle={() => props.onPlugin(p.key)}
                    />
                  ))}
              </div>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Optional — enable if applicable
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {plugins
                  .filter((p) => !p.defaultOn)
                  .map((p) => (
                    <PluginCard
                      key={p.key}
                      plugin={p}
                      checked={config.plugins.includes(p.key)}
                      onToggle={() => props.onPlugin(p.key)}
                    />
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Metrics ─────────────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Metric budgets</CardTitle>
          <CardDescription className="text-xs">
            Corpus: methods under 10 lines, classes under 250 LOC, max 2 arguments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {METRIC_FIELDS.map((field) => {
            const value = config.metrics[field.key];
            return (
              <div key={field.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <Label className="text-xs font-medium">{field.label}</Label>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {field.cop}
                    </span>
                  </div>
                  <span className="rounded-md bg-rose-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    {value}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onValueChange={(v) => props.onMetric(field.key, v[0] ?? value)}
                  aria-label={field.label}
                />
                <p className="mt-1 text-[10px] text-muted-foreground">{field.help}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Style enforcement toggles ───────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Enforcement toggles</CardTitle>
          <CardDescription className="text-xs">
            Corpus and BetterSpecs rules that flip cops on or off.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STYLE_TOGGLES.map((field) => (
            <div key={field.key} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Label
                  htmlFor={`toggle-${field.key}`}
                  className="text-xs font-medium"
                >
                  {field.label}
                </Label>
                <p className="text-[10px] leading-snug text-muted-foreground">
                  <span className="font-mono">{field.cop}</span> — {field.help}
                </p>
              </div>
              <Switch
                id={`toggle-${field.key}`}
                checked={config.toggles[field.key]}
                onCheckedChange={(v) => props.onToggle(field.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Workflow & CI ───────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Workflow & CI</CardTitle>
          <CardDescription className="text-xs">
            Legacy adoption strategy and pipeline gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {WORKFLOW_FIELDS.map((field) => (
            <div key={field.key} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Label htmlFor={`workflow-${field.key}`} className="text-xs font-medium">
                  {field.label}
                </Label>
                <p className="text-[10px] leading-snug text-muted-foreground">{field.help}</p>
              </div>
              <Switch
                id={`workflow-${field.key}`}
                checked={config[field.key]}
                onCheckedChange={(v) =>
                  props.onPatch({ [field.key]: v } as Partial<BuilderConfig>)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Global excludes ─────────────────────────────────────────────── */}
      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Global excludes</CardTitle>
          <CardDescription className="text-xs">
            AllCops Exclude — generated code and vendored noise stay out of every cop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXCLUDE_OPTIONS.map((opt) => {
              const checked = config.excludes.includes(opt.pattern);
              return (
                <label
                  key={opt.pattern}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 transition-colors",
                    "hover:border-rose-300 dark:hover:border-rose-800",
                    checked &&
                      "border-rose-400 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/30",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => props.onExclude(opt.pattern)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[11px]">{opt.pattern}</span>
                    <span className="block text-[10px] text-muted-foreground">{opt.note}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
