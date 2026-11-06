"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GeneratedFiles } from "@/lib/generator";
import type { BuilderConfig, MetricsConfig, PresetKey, TogglesConfig } from "@/lib/rubocop";
import { DEFAULT_CONFIG, applyPreset } from "@/lib/rubocop";
import type { PluginRow, SavedPresetRow } from "@/lib/api-types";
import { ConfigPanel } from "./config-panel";
import { OutputPanel } from "./output-panel";

export function BuilderSection() {
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<PluginRow[] | null>(null);
  const [presets, setPresets] = useState<SavedPresetRow[]>([]);
  const [presetName, setPresetName] = useState("");
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  const refreshPresets = useCallback(() => {
    fetch("/api/presets")
      .then((r) => r.json())
      .then((d) => {
        if (mounted.current) setPresets(d.presets ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetch("/api/plugins")
      .then((r) => r.json())
      .then((d) => {
        if (mounted.current) setPlugins(d.plugins ?? []);
      })
      .catch(() => {
        if (mounted.current) setPlugins([]);
      });
    refreshPresets();
    return () => {
      mounted.current = false;
    };
  }, [refreshPresets]);

  // Recompile the artifacts whenever the config changes (debounced).
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error("Generation failed.");
          return r.json();
        })
        .then((data: GeneratedFiles) => {
          setFiles(data);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [config]);

  const patch = useCallback((partial: Partial<BuilderConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const setMetric = useCallback((key: keyof MetricsConfig, value: number) => {
    setConfig((prev) => ({ ...prev, metrics: { ...prev.metrics, [key]: value } }));
  }, []);

  const setToggle = useCallback((key: keyof TogglesConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: value } }));
  }, []);

  const togglePlugin = useCallback((key: string) => {
    setConfig((prev) => ({
      ...prev,
      plugins: prev.plugins.includes(key)
        ? prev.plugins.filter((p) => p !== key)
        : [...prev.plugins, key],
    }));
  }, []);

  const toggleExclude = useCallback((pattern: string) => {
    setConfig((prev) => ({
      ...prev,
      excludes: prev.excludes.includes(pattern)
        ? prev.excludes.filter((e) => e !== pattern)
        : [...prev.excludes, pattern],
    }));
  }, []);

  const choosePreset = useCallback((key: PresetKey) => {
    setConfig((prev) => applyPreset(prev, key));
  }, []);

  const savePreset = useCallback(async () => {
    const name = presetName.trim();
    if (!name) {
      toast.error("Name your preset first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save preset.");
      toast.success(`Preset “${name}” saved.`);
      setPresetName("");
      refreshPresets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preset.");
    } finally {
      setSaving(false);
    }
  }, [presetName, config, refreshPresets]);

  const loadPreset = useCallback((row: SavedPresetRow) => {
    try {
      const parsed = JSON.parse(row.config) as Partial<BuilderConfig>;
      setConfig({ ...DEFAULT_CONFIG, ...parsed });
      toast.success(`Loaded “${row.name}”.`);
    } catch {
      toast.error("This preset is corrupted.");
    }
  }, []);

  const deletePreset = useCallback(
    async (row: SavedPresetRow) => {
      try {
        const res = await fetch(`/api/presets/${row.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success(`Deleted “${row.name}”.`);
        refreshPresets();
      } catch {
        toast.error("Failed to delete preset.");
      }
    },
    [refreshPresets],
  );

  return (
    <section id="builder" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            01 · Builder
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Configure the baseline, watch it compile
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every control recompiles the deliverables deterministically — targets, plugins,
            metric budgets and the corpus / BetterSpecs enforcement toggles.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <ConfigPanel
            config={config}
            plugins={plugins}
            presets={presets}
            presetName={presetName}
            saving={saving}
            onPresetNameChange={setPresetName}
            onPatch={patch}
            onMetric={setMetric}
            onToggle={setToggle}
            onPlugin={togglePlugin}
            onExclude={toggleExclude}
            onChoosePreset={choosePreset}
            onSavePreset={savePreset}
            onLoadPreset={loadPreset}
            onDeletePreset={deletePreset}
          />
          <OutputPanel files={files} loading={loading} config={config} />
        </div>
      </div>
    </section>
  );
}
