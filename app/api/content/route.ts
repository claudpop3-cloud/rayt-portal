import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent, type SiteContent } from "@/lib/siteContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/content — текущие настройки контента. */
export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

/** POST /api/content — сохранить настройки (частичный патч). */
export async function POST(request: Request) {
  let payload: Partial<SiteContent>;
  try {
    payload = (await request.json()) as Partial<SiteContent>;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }
  const content = await saveSiteContent(payload);
  return NextResponse.json({ ok: true, content }, { status: 200 });
}
