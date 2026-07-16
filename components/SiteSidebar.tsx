"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ClipboardCheck,
  Handshake,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { routes } from "@/lib/links";
import styles from "./SiteSidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  /** Обычная ссылка <a> без Next-prefetch (для защищённых роутов, напр. /admin —
   *  иначе фоновый prefetch ловит 401 и браузер показывает окно входа на всех страницах). */
  plain?: boolean;
}

const NAV: NavItem[] = [
  { label: "Каталог", href: routes.home, icon: <LayoutGrid size={19} /> },
  { label: "ИИ-разбор", href: routes.quiz, icon: <ClipboardCheck size={19} /> },
  { label: "Сопровождение", href: routes.sopSeller, icon: <Handshake size={19} /> },
  { label: "Курсы", href: routes.courses, icon: <GraduationCap size={19} /> },
];

export default function SiteSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  const isActive = (href: string) =>
    href === routes.home ? pathname === "/" : pathname.startsWith(href);

  const Logo = (
    <Link href={routes.home} className={styles.brand} onClick={close}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-rayt.png" alt="Райт" className={styles.logoImg} />
      <span className={styles.brandTag}>Makeunion</span>
    </Link>
  );

  return (
    <>
      {/* Мобильная верхняя панель */}
      <div className={styles.topbar}>
        {Logo}
        <button
          className={styles.burger}
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Затемнение под мобильным меню */}
      {open && <div className={styles.overlay} onClick={close} />}

      {/* Сайдбар */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.brandRow}>{Logo}</div>

        <nav className={styles.nav}>
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener"
                className={styles.item}
                onClick={close}
              >
                <span className={styles.itemIcon}>{item.icon}</span>
                {item.label}
              </a>
            ) : item.plain ? (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.item} ${isActive(item.href) ? styles.itemActive : ""}`}
                onClick={close}
              >
                <span className={styles.itemIcon}>{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.item} ${isActive(item.href) ? styles.itemActive : ""}`}
                onClick={close}
              >
                <span className={styles.itemIcon}>{item.icon}</span>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className={styles.spacer} />

        <Link
          href={routes.quiz}
          className={`btn btn-primary ${styles.cta}`}
          onClick={close}
        >
          Пройти ИИ-разбор →
        </Link>
      </aside>
    </>
  );
}
