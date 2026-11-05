import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rows = await db.mapping.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({
    corpus: rows.filter((r) => r.source === "corpus"),
    betterSpecs: rows.filter((r) => r.source === "betterspecs"),
  });
}
