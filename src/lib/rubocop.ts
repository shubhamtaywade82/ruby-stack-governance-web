// Shared contracts for the Stack Governance Studio builder.
// Safe to import from both client components and server routes.

export type PresetKey = "omakase" | "pragmatic" | "corpus" | "maximum";

export interface MetricsConfig {
  lineLength: number;
  methodLength: number;
  classLength: number;
  moduleLength: number;
  abcSize: number;
  cyclomatic: number;
  parameterLists: number;
  rspecExampleLength: number;
  rspecExpectations: number;
  rspecMemoized: number;
  rspecNested: number;
}

export interface TogglesConfig {
  documentation: boolean;
  frozenStringLiteral: boolean;
  strictRescue: boolean;
  contextWording: boolean;
  verifiedDoubles: boolean;
  messageSpies: boolean;
  filePathArguments: boolean;
  i18nTexts: boolean;
  singleQuotes: boolean;
}

export interface BuilderConfig {
  rubyVersion: string;
  railsVersion: string;
  preset: PresetKey;
  plugins: string[];
  excludes: string[];
  newCops: boolean;
  suggestExtensions: boolean;
  legacyTodo: boolean;
  ciSecurity: boolean;
  specsFirstGate: boolean;
  metrics: MetricsConfig;
  toggles: TogglesConfig;
}

export interface PresetMeta {
  key: PresetKey;
  label: string;
  tagline: string;
  description: string;
  metrics: MetricsConfig;
  toggles: TogglesConfig;
}

export const RUBY_VERSIONS = ["3.0", "3.1", "3.2", "3.3", "3.4"] as const;
export const RAILS_VERSIONS = ["6.1", "7.0", "7.1", "7.2", "8.0", "8.1"] as const;

export interface ExcludeOption {
  pattern: string;
  note: string;
  defaultOn: boolean;
}

export const EXCLUDE_OPTIONS: ExcludeOption[] = [
  { pattern: "bin/**/*", note: "Rails binstubs", defaultOn: true },
  { pattern: "db/schema.rb", note: "Generated schema dump", defaultOn: true },
  { pattern: "db/migrate/**/*", note: "Migrations are historical", defaultOn: true },
  { pattern: "db/seeds.rb", note: "Seed data", defaultOn: false },
  { pattern: "vendor/**/*", note: "Vendored gems", defaultOn: true },
  { pattern: "node_modules/**/*", note: "JS dependencies", defaultOn: true },
  { pattern: "tmp/**/*", note: "Scratch space", defaultOn: true },
  { pattern: "log/**/*", note: "Logfiles", defaultOn: false },
  { pattern: "config/initializers/**/*", note: "Third-party initializer noise", defaultOn: false },
  { pattern: "coverage/**/*", note: "SimpleCov artifacts", defaultOn: false },
];

export const CORE_PLUGIN_KEYS = [
  "rubocop-performance",
  "rubocop-rails",
  "rubocop-rspec",
  "rubocop-rspec_rails",
  "rubocop-factory_bot",
  "rubocop-capybara",
  "rubocop-rake",
] as const;

export const OPTIONAL_PLUGIN_KEYS = [
  "rubocop-graphql",
  "rubocop-thread_safety",
  "rubocop-yard",
  "rubocop-minitest",
  "rubocop-rails-omakase",
] as const;

export const PLUGIN_ORDER: string[] = [...CORE_PLUGIN_KEYS, ...OPTIONAL_PLUGIN_KEYS];

export interface MetricField {
  key: keyof MetricsConfig;
  label: string;
  cop: string;
  min: number;
  max: number;
  step: number;
  help: string;
}

export const METRIC_FIELDS: MetricField[] = [
  { key: "lineLength", label: "Line length", cop: "Layout/LineLength", min: 80, max: 160, step: 10, help: "Corpus: ≤ 100 columns · 120 is the modern consensus" },
  { key: "methodLength", label: "Method length", cop: "Metrics/MethodLength", min: 5, max: 30, step: 1, help: "Corpus: methods under 10 lines" },
  { key: "classLength", label: "Class length", cop: "Metrics/ClassLength", min: 50, max: 400, step: 10, help: "Corpus: classes under 250 LOC" },
  { key: "moduleLength", label: "Module length", cop: "Metrics/ModuleLength", min: 50, max: 400, step: 10, help: "Keep modules focused" },
  { key: "abcSize", label: "ABC size", cop: "Metrics/AbcSize", min: 10, max: 40, step: 1, help: "Assignment–Branch–Condition complexity" },
  { key: "cyclomatic", label: "Cyclomatic complexity", cop: "Metrics/CyclomaticComplexity", min: 5, max: 20, step: 1, help: "Branch paths per method" },
  { key: "parameterLists", label: "Arguments per method", cop: "Metrics/ParameterLists", min: 1, max: 8, step: 1, help: "Corpus: max 2 arguments" },
  { key: "rspecExampleLength", label: "RSpec example length", cop: "RSpec/ExampleLength", min: 3, max: 30, step: 1, help: "BetterSpecs: keep the it block short" },
  { key: "rspecExpectations", label: "Expectations per example", cop: "RSpec/MultipleExpectations", min: 1, max: 10, step: 1, help: "BetterSpecs: single expectation" },
  { key: "rspecMemoized", label: "Memoized helpers", cop: "RSpec/MultipleMemoizedHelpers", min: 1, max: 20, step: 1, help: "let / let! count per group" },
  { key: "rspecNested", label: "Nested groups", cop: "RSpec/NestedGroups", min: 1, max: 8, step: 1, help: "describe / context depth" },
];

export interface ToggleField {
  key: keyof TogglesConfig;
  label: string;
  cop: string;
  help: string;
}

export const STYLE_TOGGLES: ToggleField[] = [
  { key: "documentation", label: "Class & module docs", cop: "Style/Documentation", help: "Corpus mandates YARD (W5H) docs; many Rails teams disable" },
  { key: "frozenStringLiteral", label: "Magic comment", cop: "Style/FrozenStringLiteralComment", help: "frozen_string_literal comment on every file" },
  { key: "strictRescue", label: "Explicit rescues", cop: "Style/RescueStandardError", help: "Be specific about what you rescue — no bare rescue" },
  { key: "contextWording", label: "Context prefixes", cop: "RSpec/ContextWording", help: "Contexts start with when / with / without (BetterSpecs)" },
  { key: "verifiedDoubles", label: "Verified doubles", cop: "RSpec/VerifiedDoubles", help: "instance_double over double — never mock what you don't own" },
  { key: "messageSpies", label: "have_received spies", cop: "RSpec/MessageSpies", help: "allow first, then expect(obj).to have_received(:msg)" },
  { key: "filePathArguments", label: "Rails.root.join args", cop: "Rails/FilePath", help: "join('app', 'models') over string interpolation" },
  { key: "i18nTexts", label: "I18n locale texts", cop: "Rails/I18nLocaleTexts", help: "Static UI text belongs in en.yml, not in code" },
  { key: "singleQuotes", label: "Single-quoted strings", cop: "Style/StringLiterals", help: "Single quotes unless interpolation is needed" },
];

const ALL_TRUE: TogglesConfig = {
  documentation: true,
  frozenStringLiteral: true,
  strictRescue: true,
  contextWording: true,
  verifiedDoubles: true,
  messageSpies: true,
  filePathArguments: true,
  i18nTexts: true,
  singleQuotes: true,
};

export const PRESETS: PresetMeta[] = [
  {
    key: "omakase",
    label: "Omakase",
    tagline: "Rails-shaped defaults",
    description: "Rails 7.2-style relaxed baseline — minimal overrides, lowest friction.",
    metrics: {
      lineLength: 120,
      methodLength: 20,
      classLength: 300,
      moduleLength: 300,
      abcSize: 25,
      cyclomatic: 12,
      parameterLists: 5,
      rspecExampleLength: 15,
      rspecExpectations: 5,
      rspecMemoized: 15,
      rspecNested: 6,
    },
    toggles: {
      documentation: false,
      frozenStringLiteral: false,
      strictRescue: false,
      contextWording: false,
      verifiedDoubles: false,
      messageSpies: false,
      filePathArguments: false,
      i18nTexts: false,
      singleQuotes: true,
    },
  },
  {
    key: "pragmatic",
    label: "Pragmatic",
    tagline: "Balanced production default",
    description: "The modern consensus — 120 columns, 15-line methods, quiet where it doesn't pay.",
    metrics: {
      lineLength: 120,
      methodLength: 15,
      classLength: 200,
      moduleLength: 200,
      abcSize: 20,
      cyclomatic: 10,
      parameterLists: 5,
      rspecExampleLength: 20,
      rspecExpectations: 3,
      rspecMemoized: 10,
      rspecNested: 5,
    },
    toggles: {
      documentation: false,
      frozenStringLiteral: false,
      strictRescue: false,
      contextWording: false,
      verifiedDoubles: false,
      messageSpies: false,
      filePathArguments: true,
      i18nTexts: true,
      singleQuotes: true,
    },
  },
  {
    key: "corpus",
    label: "Corpus Strict",
    tagline: "Training-corpus alignment",
    description: "≤ 100 columns, ≤ 2 arguments, explicit rescues, verified doubles, BetterSpecs structure.",
    metrics: {
      lineLength: 100,
      methodLength: 15,
      classLength: 250,
      moduleLength: 250,
      abcSize: 20,
      cyclomatic: 10,
      parameterLists: 2,
      rspecExampleLength: 5,
      rspecExpectations: 1,
      rspecMemoized: 10,
      rspecNested: 5,
    },
    toggles: { ...ALL_TRUE },
  },
  {
    key: "maximum",
    label: "Maximum",
    tagline: "Zero tolerance",
    description: "Clean Code limits taken literally — 80 columns, 10-line methods, single expectation.",
    metrics: {
      lineLength: 80,
      methodLength: 10,
      classLength: 100,
      moduleLength: 100,
      abcSize: 15,
      cyclomatic: 6,
      parameterLists: 2,
      rspecExampleLength: 5,
      rspecExpectations: 1,
      rspecMemoized: 5,
      rspecNested: 3,
    },
    toggles: { ...ALL_TRUE },
  },
];

export const DEFAULT_CONFIG: BuilderConfig = {
  rubyVersion: "3.4",
  railsVersion: "8.1",
  preset: "corpus",
  plugins: [...CORE_PLUGIN_KEYS],
  excludes: EXCLUDE_OPTIONS.filter((o) => o.defaultOn).map((o) => o.pattern),
  newCops: true,
  suggestExtensions: false,
  legacyTodo: false,
  ciSecurity: true,
  specsFirstGate: true,
  metrics: { ...(PRESETS[2].metrics) },
  toggles: { ...(PRESETS[2].toggles) },
};

export function applyPreset(config: BuilderConfig, key: PresetKey): BuilderConfig {
  const preset = PRESETS.find((p) => p.key === key);
  if (!preset) return config;
  return {
    ...config,
    preset: key,
    metrics: { ...preset.metrics },
    toggles: { ...preset.toggles },
  };
}

export function presetLabel(key: string): string {
  return PRESETS.find((p) => p.key === key)?.label ?? key;
}
