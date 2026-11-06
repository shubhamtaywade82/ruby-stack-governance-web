# Ruby Stack Governance — Web

The web **view** over the [`ruby-stack-governance`](https://github.com/shubhamtaywade82/ruby-stack-governance) corpus.

A Next.js 16 explorer for RuboCop cops, skills, presets, and — most importantly — the
**live governance corpus** (ratchets + artifact manifest), read at request time from the
source repo. This app holds no canonical data of its own; the corpus is the single home
(Law 1), and this UI is a view over it.

```
ruby-stack-governance (source of truth)          ruby-stack-governance-web (this repo)
─────────────────────────────────────            ───────────────────────────────────────
docs/ratchets.yml          ──┐
docs/artifacts/MANIFEST.yml ─┼──  GET /api/corpus  ──>  CorpusSection (live, attributed)
.github/.../workflows      ──┘                        @ <source commit sha>
```

## What's live vs. local

| Surface | Source | Why |
|---|---|---|
| **Ratchets** (10 metrics, current→next→target) | `docs/ratchets.yml` (live) | Single home for ratchet targets — Law 3 |
| **Artifact manifest** (A01–A24, layers, mirror status) | `docs/artifacts/MANIFEST.yml` (live) | Single home for artifact identity — Law 1 |
| **`skills_corpus_coverage`** | derived from manifest (live) | mirrored / (mirrored + scheduled) |
| Cop explorer / skills explorer / builder | local Prisma seed (`src/data/*.ts`) | curated UI presentation metadata (summaries, guide URLs) — not in the corpus |

The live reads happen server-side in [`src/lib/corpus.ts`](src/lib/corpus.ts) and are served
by [`/api/corpus`](src/app/api/corpus/route.ts). The source repo is public, so no token is
needed at runtime; fetches are anonymous with a 60s in-memory cache. Commit metadata
(`@ <sha>`) is best-effort (GitHub's anonymous REST API is rate-limited to 60/hr) — the view
degrades to a "live (commit metadata rate-limited)" pill rather than failing.

## Sections

1. **Hero** — what the system is.
2. **Corpus** — live ratchets + manifest with stack filters (ruby / rails / react / typescript / nodejs), attributed to the source commit.
3. **Builder** — compose a `.rubocop.yml` preset.
4. **Cop Explorer** — browse the RuboCop canon (departments, plugins, options).
5. **Skills Explorer** — Claude/Cursor skills mirrored from the corpus.
6. **Mappings** — map cops to skills.
7. **Adoption** — ratchet adoption ladder.

## Run

```sh
bun install
bun run db:push        # create the local SQLite DB (Prisma)
bun run db:seed        # seed cops + skills from src/data/*.ts
bun run dev            # http://localhost:3000
```

The corpus section works without the DB — it reads the source repo live.

## CI

```sh
bun run lint           # eslint .
bun run typecheck      # tsc --noEmit
```

Both run on push and PR (`.github/workflows/web.yml`).

## Relationship to the corpus repo

This repo is a **separate project** from `ruby-stack-governance`. The corpus repo is a Ruby
tooling + MCP system whose designed interface is an agent harness over stdio (layer 5), not
a browser. This repo is the human-facing view. They share the domain, not the codebase. See
the [architecture decision](https://github.com/shubhamtaywade82/ruby-stack-governance/blob/main/docs/LAWS.md)
in the source repo — "every artifact has exactly one home" is why this app reads instead of copies.
