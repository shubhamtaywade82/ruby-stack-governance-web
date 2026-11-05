"use client";

import { useTheme } from "next-themes";
import { BookOpen, Github, Layers, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#builder", label: "Builder" },
  { href: "#cops", label: "Cop Explorer" },
  { href: "#skills", label: "Skills" },
  { href: "#mappings", label: "Mappings" },
  { href: "#adoption", label: "Adoption" },
];

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
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
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://docs.rubocop.org"
              target="_blank"
              rel="noreferrer"
              aria-label="RuboCop documentation"
            >
              <BookOpen className="size-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/rubocop/rubocop"
              target="_blank"
              rel="noreferrer"
              aria-label="RuboCop on GitHub"
            >
              <Github className="size-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="hidden size-4 dark:block" aria-hidden />
            <Moon className="size-4 dark:hidden" aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}
