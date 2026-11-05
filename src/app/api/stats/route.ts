import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [cops, plugins, mappings, presets, skills] = await Promise.all([
    db.cop.count(),
    db.plugin.count(),
    db.mapping.count(),
    db.savedPreset.count(),
    db.skill.count(),
  ]);
  return NextResponse.json({ cops, plugins, mappings, presets, skills });
}
