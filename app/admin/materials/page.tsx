import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getMaterials } from "@/lib/materials";
import { routes } from "@/lib/links";
import { materialTypeLabels } from "@/lib/types";
import MaterialForm from "@/components/MaterialForm";
import DeleteMaterialButton from "@/components/DeleteMaterialButton";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Управление материалами · Makeunion",
};

export default async function AdminMaterialsPage() {
  const [materials, categories] = await Promise.all([
    getMaterials(),
    getCategories(),
  ]);
  const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));

  return (
    <div className="container">
      <div className={styles.head}>
        <div>
          <Link href={routes.admin} className={styles.inlineLink}>
            ← Админка
          </Link>
          <h1 style={{ marginTop: 10 }}>Управление материалами</h1>
          <p className="soft">
            Добавляйте материалы в каталог «Разборы райта». Новый материал сразу
            появляется на{" "}
            <Link href={routes.home} className={styles.inlineLink}>
              главной
            </Link>
            .
          </p>
        </div>
        <span className="badge badge-outline">{materials.length} материалов</span>
      </div>

      <div className={styles.note}>
        Демо-режим: материалы пишутся в <code>data/materials.json</code>. Работает
        локально (<code>npm run dev</code>). На проде источником станет БД (Prisma) —
        интерфейс доступа уже изолирован в <code>lib/materials.ts</code>.
      </div>

      <div className={styles.layout}>
        <section className={styles.formCol}>
          <h2 className={styles.colTitle}>Добавить материал</h2>
          <MaterialForm categories={categories} />
        </section>

        <section className={styles.listCol}>
          <h2 className={styles.colTitle}>Уже в каталоге</h2>
          <div className={styles.list}>
            {materials.map((m) => (
              <div key={m.id} className={styles.item}>
                <Link href={routes.material(m.slug)} className={styles.itemMain}>
                  <span className={styles.itemTitle}>{m.title}</span>
                  <span className={styles.itemMeta}>
                    {materialTypeLabels[m.type]} · {categoryTitle.get(m.category)}
                    {!m.isFree && " · закрытый"}
                  </span>
                </Link>
                <DeleteMaterialButton id={m.id} title={m.title} className={styles.delBtn} />
              </div>
            ))}
            {materials.length === 0 && (
              <p className="soft">Материалов пока нет — добавьте первый слева.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
