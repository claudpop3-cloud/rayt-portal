import { NextResponse } from "next/server";

/**
 * ВРЕМЕННЫЙ диагностический эндпоинт: показывает состояние ADMIN_USER/ADMIN_PASSWORD
 * в production-рантайме БЕЗ утечки значений (только длины и булевы сравнения).
 * Удалить сразу после диагностики.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const u = process.env.ADMIN_USER;
  const p = process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    hasUser: typeof u === "string",
    hasPass: typeof p === "string",
    userLen: u ? u.length : 0,
    passLen: p ? p.length : 0,
    userTrimLen: u ? u.trim().length : 0,
    passTrimLen: p ? p.trim().length : 0,
    userIsRoma: u?.trim() === "roma",
    passIsRayt2026: p?.trim() === "Rayt2026",
    // первый и последний код-пойнт логина — чтобы поймать кириллицу/невидимые символы
    userCodes: u ? [...u].map((c) => c.codePointAt(0)) : [],
    nodeEnv: process.env.NODE_ENV,
  });
}
