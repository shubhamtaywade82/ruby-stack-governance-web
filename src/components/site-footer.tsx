import { Layers } from "lucide-react";

const LINK_GROUPS = [
  {
    title: "Style guides",
    links: [
      { label: "Ruby Style Guide", href: "https://rubystyle.guide" },
      { label: "Rails Style Guide", href: "https://github.com/rubocop/rails-style-guide" },
      { label: "RSpec Style Guide", href: "https://github.com/rubocop/rspec-style-guide" },
      { label: "BetterSpecs", href: "https://www.betterspecs.org" },
    ],
  },
  {
    title: "RuboCop",
    links: [
      { label: "Documentation", href: "https://docs.rubocop.org" },
      { label: "Plugins guide", href: "https://docs.rubocop.org/rubocop/latest/plugins.html" },
      { label: "GitHub", href: "https://github.com/rubocop/rubocop" },
      { label: "rubocop-rails", href: "https://docs.rubocop.org/rubocop-rails/" },
    ],
  },
  {
    title: "Skill packs",
    links: [
      { label: "ruby-agent-skills", href: "https://github.com/shubhamtaywade82/ruby-agent-skills" },
      {
        label: "react-agent-skills",
        href: "https://github.com/shubhamtaywade82/react-agent-skills",
      },
      { label: "Agent Skills spec", href: "https://agentskills.io/specification" },
      { label: "skills CLI (npx)", href: "https://github.com/vercel-labs/skills" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white">
                <Layers className="size-4" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight">
                  Stack Governance
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Studio · Ruby · Rails · React
                </span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Deterministic, organization-wide governance for the full stack — RuboCop enforcement
              for Ruby and Rails, the agent-executable skill packs for every boundary of the
              stack, aligned to the community style guides, the governance training corpus and
              BetterSpecs. Regenerate, commit, gate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            Commit <span className="font-mono">.rubocop.yml</span> at the repo root and route the
            owning skill before you write — the single sources of truth for style and behavior.
          </p>
          <p className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-rose-600" aria-hidden />
            Stack Governance Studio
          </p>
        </div>
      </div>
    </footer>
  );
}
