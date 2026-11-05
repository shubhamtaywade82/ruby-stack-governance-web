import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const plugins = await db.plugin.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });
  return NextResponse.json({ plugins });
}
