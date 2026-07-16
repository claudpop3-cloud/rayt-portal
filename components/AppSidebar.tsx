"use client";

import { usePathname } from "next/navigation";
import SiteSidebar from "./SiteSidebar";
import AdminSidebar from "./AdminSidebar";

/**
 * Выбирает меню по разделу: в админке (/admin/*) — служебное меню
 * (Заявки / Материалы / Контент), на публичных страницах — меню сайта.
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  return isAdmin ? <AdminSidebar /> : <SiteSidebar />;
}
