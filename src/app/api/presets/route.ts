import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET() {
  const presets = await db.savedPreset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Preset name is required" }, { status: 400 });
    }
    if (typeof body?.config !== "object" || body.config === null) {
      return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
    }
    const config =
      typeof body.config === "string" ? body.config : JSON.stringify(body.config);
    const description =
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;

    const preset = await db.savedPreset.create({ data: { name, description, config } });
    return NextResponse.json({ preset }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
        ? "A preset with this name already exists"
        : "Failed to save preset";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
