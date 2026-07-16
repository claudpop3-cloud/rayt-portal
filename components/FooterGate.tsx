"use client";

import { usePathname } from "next/navigation";

/** Скрывает публичный футер в админке (/admin/*) — там свой чистый вид. */
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return null;
  return <>{children}</>;
}
