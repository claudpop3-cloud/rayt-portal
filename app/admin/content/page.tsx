import Link from "next/link";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/siteContent";
import { landingIds, LANDING_TITLES } from "@/lib/landingContent";
import { routes } from "@/lib/links";
import ContentForm from "@/components/ContentForm";
import styles from "../materials/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Контент страниц · Makeunion",
};

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <div className="container">
      <div className={styles.head}>
        <div>
          <Link href={routes.admin} className={styles.inlineLink}>
            ← Админка
          </Link>
          <h1 style={{ marginTop: 10 }}>
            Контент <em>страниц</em>
          </h1>
          <p className="soft">
            Без кода: видео, заголовки лендингов, цены сопровождения, тарифы курсов и
            ссылка на чат. Изменения применяются сразу на всех страницах воронки.
          </p>
        </div>
      </div>

      <div className={styles.note}>
        Демо-режим: настройки пишутся в <code>data/site-content.json</code>. Работает
        локально. На проде источником станет БД — интерфейс изолирован в{" "}
        <code>lib/siteContent.ts</code>.
      </div>

      <h2 style={{ fontSize: 20, margin: "0 0 14px" }}>Полный редактор лендинга</h2>
      <p className="soft" style={{ marginTop: -6, marginBottom: 16 }}>
        Все блоки: заголовки, кейсы, сравнение, шаги, гарантии, цена, FAQ — с добавлением и
        удалением пунктов.
      </p>
      <div className={styles.cards} style={{ marginBottom: 30 }}>
        {landingIds().map((id) => (
          <Link key={id} href={`/admin/content/${id}`} className={styles.courseCard}>
            <span className="badge">Лендинг</span>
            <h3>{LANDING_TITLES[id] ?? id}</h3>
            <span className={styles.link}>Редактировать все блоки →</span>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Быстрые правки</h2>
      <p className="soft" style={{ marginTop: 0, marginBottom: 16 }}>
        Видео на странице «Спасибо» и ссылка на закрытый чат. Заголовки, цены, тарифы и
        кейсы всех лендингов — в полных редакторах выше.
      </p>
      <ContentForm initial={content} />
    </div>
  );
}
