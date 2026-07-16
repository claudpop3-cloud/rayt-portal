import { NextResponse } from "next/server";
import { analyzeQuiz } from "@/lib/ai/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/analyze — ИИ-разбор исхода квиза (OpenAI). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(`[analyze] resultId=${body.resultId}`);
    const result = await analyzeQuiz({
      resultId: String(body.resultId ?? ""),
      answers: (body.answers as Record<string, string>) ?? {},
      scores: (body.scores as Record<string, number>) ?? undefined,
      situation: body.situation ? String(body.situation) : "",
    });
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
