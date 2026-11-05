import { Archive, ShieldCheck, Sparkles, Terminal, Wrench } from "lucide-react";

const STEPS = [
  {
    icon: Archive,
    title: "Freeze the legacy baseline",
    body: "Do not fix a mature codebase in one heroic PR. Generate a baseline that grandfathers existing violations, and enforce the strict rules on new code only.",
    code: "bundle exec rubocop --auto-gen-config",
    note: "inherit_from is already wired when the Legacy baseline toggle is on.",
  },
  {
    icon: Sparkles,
    title: "The Boy Scout rule",
    body: "If you touch a file, you clean the file. Refactor it out of .rubocop_todo.yml and up to the standard before the PR merges — the ratchet only moves forward.",
    code: null,
    note: null,
  },
  {
    icon: ShieldCheck,
    title: "Gate the pipeline",
    body: "CI fails on any offense. Auto-correction (-a / -A) is a local, reviewed act — never a CI step. Security and Specs-First jobs come along for the ride.",
    code: "bundle exec rubocop --format github",
    note: "Plus: brakeman -q -z, bundle-audit check --update, and the specs-first git diff gate.",
  },
  {
    icon: Terminal,
    title: "Standardize the local loop",
    body: "One command, every workstation: auto-correct what is safe, then verify the hard gate. Wire it into a pre-commit hook (lefthook or husky-equivalent).",
    code: "bin/lint",
    note: null,
  },
];

const TOOLCHAIN = [
  { name: "brakeman", desc: "static security scan — SQLi, XSS, mass assignment" },
  { name: "bundler-audit", desc: "known CVEs in the Gemfile.lock" },
  { name: "reek", desc: "code smells — long parameter lists, feature envy" },
  { name: "rubycritic", desc: "maintainability score — flog + flay aggregated" },
  { name: "mutant", desc: "mutation testing — proves specs cannot be cheated" },
  { name: "simplecov", desc: "coverage gate for the Specs-First approach" },
  { name: "bullet", desc: "N+1 query detection in dev and test" },
  { name: "vcr + webmock", desc: "deterministic HTTP — no live third-party calls" },
  { name: "rack-mini-profiler", desc: "per-request SQL and render cost in the browser" },
  { name: "lograge", desc: "single-line JSON request logs for observability" },
  { name: "marginalia", desc: "SQL comments tracing queries to controller actions" },
  { name: "annotate", desc: "schema and routes as living comments on models" },
];

export function AdoptionSection() {
  return (
    <section id="adoption" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            05 · Adoption
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            From generated file to enforced culture
          </h2>
          <p className="mt-3 text-muted-foreground">
            The rollout pattern that lets strict rules land on a legacy codebase without
            freezing delivery.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  <step.icon className="size-4.5" aria-hidden />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              {step.code ? (
                <code className="mt-3 block overflow-x-auto rounded-md bg-zinc-950 px-3 py-2 font-mono text-[11px] text-emerald-400">
                  {step.code}
                </code>
              ) : null}
              {step.note ? (
                <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                  {step.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Wrench className="size-4.5 text-rose-600 dark:text-rose-400" aria-hidden />
            Companion toolchain
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            RuboCop is the deterministic core. These companions cover the dimensions static
            style cannot — security, smells, mutation survival, performance.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLCHAIN.map((tool) => (
              <div
                key={tool.name}
                className="flex items-baseline gap-2.5 rounded-lg border bg-card px-3.5 py-3"
              >
                <span className="shrink-0 font-mono text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {tool.name}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {tool.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
