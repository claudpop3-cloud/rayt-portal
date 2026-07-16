import Link from "next/link";
import type { Metadata } from "next";
import {
  Library,
  LayoutTemplate,
  Users,
  Inbox,
  BarChart3,
} from "lucide-react";
import { getMaterials } from "@/lib/materials";
import { getLeads } from "@/lib/leads";
import { routes } from "@/lib/links";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Админка · Makeunion",
};

export default async function AdminDashboard() {
  const [materials, leads] = await Promise.all([getMaterials(), getLeads()]);

  const blocks = [
    {
      title: "Управление материалами",
      desc: "Добавление и редактирование материалов каталога «Разборы райта».",
      icon: <Library size={22} />,
      href: routes.adminMaterials,
      status: "ready" as const,
      meta: `${materials.length} материалов`,
    },
    {
      title: "Контент страниц",
      desc: "Без кода: видео, заголовки лендингов, цены сопровождения, тарифы курсов, ссылка на чат.",
      icon: <LayoutTemplate size={22} />,
      href: routes.adminContent,
      status: "ready" as const,
      meta: "Редактировать",
    },
    {
      title: "Управление пользователями",
      desc: "Доступы команды, роли и права.",
      icon: <Users size={22} />,
      status: "wip" as const,
    },
    {
      title: "Заявки с квизов",
      desc: "Единый список заявок из ИИ-разбора: контакт, ветка, ответы.",
      icon: <Inbox size={22} />,
      href: routes.adminLeads,
      status: "ready" as const,
      meta: leads.length ? `${leads.length} заявок` : "Пока нет заявок",
    },
    {
      title: "Аналитика квиза",
      desc: "Сколько прошли, ответы, отвал по шагам.",
      icon: <BarChart3 size={22} />,
      status: "wip" as const,
    },
  ];

  return (
    <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">Своя CMS</span>
        <h1>Админка портала</h1>
        <p className="soft">
          Управление порталом по карте проекта. Работают: материалы, заявки и контент
          страниц. Пользователи и аналитика квиза — в разработке.
        </p>
      </div>

      <div className={styles.grid}>
        {blocks.map((b) =>
          b.status === "ready" ? (
            <Link key={b.title} href={b.href!} className={`${styles.card} ${styles.ready}`}>
              <span className={styles.icon}>{b.icon}</span>
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3>{b.title}</h3>
                  <span className={styles.badgeReady}>Готово</span>
                </div>
                <p>{b.desc}</p>
                <span className={styles.metaRow}>
                  {b.meta} · Открыть →
                </span>
              </div>
            </Link>
          ) : (
            <div key={b.title} className={`${styles.card} ${styles.wip}`}>
              <span className={styles.icon}>{b.icon}</span>
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <h3>{b.title}</h3>
                  <span className={styles.badgeWip}>В разработке</span>
                </div>
                <p>{b.desc}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
