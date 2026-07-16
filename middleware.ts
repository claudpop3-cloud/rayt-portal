import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Basic-Auth на админку (/admin/*). Логин/пароль берутся из окружения
 * ADMIN_USER / ADMIN_PASSWORD (задаются в .env.local; на проде — в переменных
 * окружения Vercel). Дефолт admin/admin — только для локального запуска,
 * ОБЯЗАТЕЛЬНО поменяйте пароль в проде.
 * Публичные роуты (квиз, лендинги, /api/lead для форм) не затрагиваются.
 */
export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin";

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    } catch {
      // некорректный заголовок — попросим авторизацию ниже
    }
  }

  // Фоновый prefetch защищённой ссылки (напр. пункта «Админка» в меню) не должен
  // вызывать окно Basic-Auth на публичных страницах — отвечаем 401 без
  // WWW-Authenticate, тогда браузер не показывает диалог входа.
  const purpose =
    req.headers.get("sec-purpose") || req.headers.get("purpose") || "";
  if (req.headers.get("next-router-prefetch") === "1" || purpose.includes("prefetch")) {
    return new NextResponse(null, { status: 401 });
  }

  return new NextResponse("Требуется авторизация", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
}

export const config = {
  // Админка + мутирующее API материалов (после входа в /admin браузер сам
  // подставляет Basic-креды в fetch к тому же origin). /api/lead и /api/analyze
  // остаются публичными — их дёргают формы на сайте.
  matcher: ["/admin", "/admin/:path*", "/api/materials", "/api/content", "/api/landing"],
};
