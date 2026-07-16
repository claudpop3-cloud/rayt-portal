import { NextResponse } from "next/server";
import { upsertLead } from "@/lib/leads";
import type { AiAnalysis } from "@/lib/ai/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/lead — создать/обновить запись о прохождении квиза (демо-хранилище JSON).
 * Требуется id (одно прохождение = одна запись). Контакт необязателен: без него
 * запись — просто «прохождение», с ним — заявка.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const id = String(payload.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Нет id прохождения" }, { status: 400 });
  }

  try {
    const lead = await upsertLead({
      id,
      name: payload.name !== undefined ? String(payload.name) : undefined,
      contact: payload.contact !== undefined ? String(payload.contact) : undefined,
      result: payload.result !== undefined ? (payload.result ? String(payload.result) : null) : undefined,
      resultId:
        payload.resultId !== undefined ? (payload.resultId ? String(payload.resultId) : null) : undefined,
      answers: (payload.answers as Record<string, string>) ?? undefined,
      situation: payload.situation !== undefined ? String(payload.situation) : undefined,
      ai: payload.ai !== undefined ? (payload.ai as AiAnalysis | null) : undefined,
    });
    console.log(`[lead] upsert id=${lead.id} contacted=${lead.contacted} result=${lead.resultId}`);
    return NextResponse.json({ ok: true, id: lead.id, contacted: lead.contacted }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
