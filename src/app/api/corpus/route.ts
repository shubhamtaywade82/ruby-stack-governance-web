import { NextResponse } from "next/server";
import { getCorpus } from "@/lib/corpus";

export const revalidate = 60;

export async function GET() {
  try {
    const corpus = await getCorpus();
    return NextResponse.json(corpus, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 502 }
    );
  }
}
