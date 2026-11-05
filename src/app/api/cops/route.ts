import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search")?.trim() ?? "";
  const department = sp.get("department")?.trim() ?? "";

  const where: Prisma.CopWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { summary: { contains: search } },
      { corpusNote: { contains: search } },
    ];
  }
  if (department && department !== "All") {
    where.department = department;
  }

  const [cops, total, groups] = await Promise.all([
    db.cop.findMany({ where, orderBy: [{ department: "asc" }, { name: "asc" }], take: 300 }),
    db.cop.count({ where }),
    db.cop.groupBy({ by: ["department"], _count: { _all: true }, orderBy: { department: "asc" } }),
  ]);

  return NextResponse.json({
    cops,
    total,
    departments: groups.map((g) => ({ name: g.department, count: g._count._all })),
  });
}
