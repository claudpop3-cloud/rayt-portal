"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  FileText,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { routes } from "@/lib/links";
import styles from "./SiteSidebar.module.css";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV: AdminNavItem[] = [
  { label: "Обзор", href: routes.admin, icon: <LayoutDashboard size={19} />, exact: true },
  { label: "Заявки", href: routes.adminLeads, icon: <ClipboardList size={19} /> },
  { label: "Материалы", href: routes.adminMaterials, icon: <Package size={19} /> },
  { label: "Контент страниц", href: routes.adminContent, icon: <FileText size={19} /> },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const Brand = (
    <Link href={routes.admin} className={styles.brand} onClick={close}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-rayt.png" alt="Райт" className={styles.logoImg} />
      <span className={styles.brandTag}>Админка</span>
    </Link>
  );

  return (
    <>
      {/* Мобильная верхняя панель */}
      <div className={styles.topbar}>
        {Brand}
        <button
          className={styles.burger}
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && <div className={styles.overlay} onClick={close} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brandRow}>{Brand}</div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.item} ${isActive(item.href, item.exact) ? styles.itemActive : ""}`}
              onClick={close}
            >
              <span className={styles.itemIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.spacer} />

        {/* Возврат на публичный сайт — обычной ссылкой (полная навигация) */}
        <a href={routes.home} className={styles.item} onClick={close}>
          <span className={styles.itemIcon}>
            <ArrowLeft size={19} />
          </span>
          На сайт
        </a>
      </aside>
    </>
  );
}
