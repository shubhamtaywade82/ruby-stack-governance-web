// Seed the governance catalog: cops, plugins, style-guide mappings, and agent skills.
// Run with: bun run db:seed  (or: bun run src/db/seed.ts)

import { db } from "@/lib/db";
import { COPS, PLUGINS, CORPUS_MAPPINGS, BETTERSPECS_MAPPINGS } from "@/data/cops";
import { SKILLS } from "@/data/skills";

async function main() {
  console.log("Seeding Stack Governance Studio catalog…");

  await db.mapping.deleteMany();
  await db.cop.deleteMany();
  await db.plugin.deleteMany();
  await db.skill.deleteMany();

  for (const plugin of PLUGINS) {
    await db.plugin.create({ data: plugin });
  }
  for (const cop of COPS) {
    await db.cop.create({ data: cop });
  }
  for (const mapping of CORPUS_MAPPINGS) {
    await db.mapping.create({ data: { ...mapping, source: "corpus" } });
  }
  for (const mapping of BETTERSPECS_MAPPINGS) {
    await db.mapping.create({ data: { ...mapping, source: "betterspecs" } });
  }
  for (const skill of SKILLS) {
    await db.skill.create({ data: skill });
  }

  console.log(
    `Seeded ${COPS.length} cops · ${PLUGINS.length} plugins · ` +
      `${CORPUS_MAPPINGS.length + BETTERSPECS_MAPPINGS.length} mappings · ` +
      `${SKILLS.length} skills.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
