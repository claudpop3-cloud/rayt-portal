import { NextResponse } from "next/server";
import {
  getLandingContent,
  saveLandingContent,
  resetLandingContent,
  getLandingDefault,
} from "@/lib/landingContent";
import type { SopContent } from "@/components/SopLanding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function idOf(request: Request): string {
  return new URL(request.url).searchParams.get("id")?.trim() || "";
}

/** GET /api/landing?id=… — полный контент лендинга. */
export async function GET(request: Request) {
  const content = await getLandingContent(idOf(request));
  if (!content) return NextResponse.json({ error: "Неизвестный лендинг" }, { status: 404 });
  return NextResponse.json({ content });
}

/** POST /api/landing?id=… — сохранить полный контент. */
export async function POST(request: Request) {
  const id = idOf(request);
  if (!getLandingDefault(id)) {
    return NextResponse.json({ error: "Неизвестный лендинг" }, { status: 404 });
  }
  let body: SopContent;
  try {
    body = (await request.json()) as SopContent;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }
  await saveLandingContent(id, body);
  return NextResponse.json({ ok: true }, { status: 200 });
}

/** DELETE /api/landing?id=… — сбросить к дефолту из кода. */
export async function DELETE(request: Request) {
  const id = idOf(request);
  if (!getLandingDefault(id)) {
    return NextResponse.json({ error: "Неизвестный лендинг" }, { status: 404 });
  }
  await resetLandingContent(id);
  const content = await getLandingContent(id);
  return NextResponse.json({ ok: true, content }, { status: 200 });
}
