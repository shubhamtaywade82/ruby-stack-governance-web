import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const family = sp.get("family")?.trim() ?? "";
  const repo = sp.get("repo")?.trim() ?? "";

  const where: Prisma.SkillWhereInput = {};
  const packWhere: Prisma.SkillWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { triggers: { contains: search } },
    ];
    packWhere.OR = where.OR;
  }
  if (repo && repo !== "All") {
    where.repo = repo;
    packWhere.repo = repo;
  }
  if (family && family !== "All") where.family = family;

  const [skills, total, families, repos] = await Promise.all([
    db.skill.findMany({
      where,
      orderBy: [{ repo: "asc" }, { family: "asc" }, { name: "asc" }],
      take: 800,
    }),
    db.skill.count({ where }),
    db.skill.groupBy({
      by: ["family"],
      _count: { _all: true },
      where: packWhere,
      orderBy: { family: "asc" },
    }),
    db.skill.groupBy({
      by: ["repo"],
      _count: { _all: true },
      orderBy: { repo: "asc" },
    }),
  ]);

  return NextResponse.json({
    skills,
    total,
    families: families.map((f) => ({ name: f.family, count: f._count._all })),
    repos: repos.map((r) => ({ name: r.repo, count: r._count._all })),
  });
}
