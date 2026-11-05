import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { CorpusSection } from "@/components/corpus-section";
import { BuilderSection } from "@/components/builder/builder-section";
import { CopExplorer } from "@/components/cop-explorer";
import { SkillsExplorer } from "@/components/skills-explorer";
import { MappingsSection } from "@/components/mappings-section";
import { AdoptionSection } from "@/components/adoption-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <CorpusSection />
        <BuilderSection />
        <CopExplorer />
        <SkillsExplorer />
        <MappingsSection />
        <AdoptionSection />
      </main>
      <SiteFooter />
    </div>
  );
}
