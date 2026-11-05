import { NextRequest, NextResponse } from "next/server";
import { generateAll } from "@/lib/generator";
import type { BuilderConfig } from "@/lib/rubocop";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BuilderConfig;
    if (!body || typeof body !== "object" || !body.metrics || !Array.isArray(body.plugins)) {
      return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
    }
    return NextResponse.json(generateAll(body));
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }
}
