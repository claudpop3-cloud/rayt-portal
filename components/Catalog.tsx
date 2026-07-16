"use client";

import { useMemo, useState } from "react";
import MaterialCard from "./MaterialCard";
import type { Category, Material } from "@/lib/types";
import styles from "./Catalog.module.css";

export default function Catalog({
  materials,
  categories,
}: {
  materials: Material[];
  categories: Category[];
}) {
  const [active, setActive] = useState<string>("all");

  const categoryTitle = useMemo(() => {
    const map = new Map(categories.map((c) => [c.slug, c.title]));
    return (slug: string) => map.get(slug) ?? slug;
  }, [categories]);

  const visible = useMemo(
    () =>
      active === "all"
        ? materials
        : materials.filter((m) => m.category === active),
    [active, materials]
  );

  return (
    <div>
      <div className={styles.filters} role="tablist" aria-label="Категории">
        <button
          className={`${styles.chip} ${active === "all" ? styles.chipActive : ""}`}
          onClick={() => setActive("all")}
          role="tab"
          aria-selected={active === "all"}
        >
          Все материалы
          <span className={styles.count}>{materials.length}</span>
        </button>
        {categories.map((c) => {
          const count = materials.filter((m) => m.category === c.slug).length;
          if (count === 0) return null;
          return (
            <button
              key={c.slug}
              className={`${styles.chip} ${active === c.slug ? styles.chipActive : ""}`}
              onClick={() => setActive(c.slug)}
              role="tab"
              aria-selected={active === c.slug}
            >
              {c.title}
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="muted">В этой категории пока нет материалов.</p>
      ) : (
        <div className={styles.grid}>
          {visible.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              categoryTitle={categoryTitle(m.category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
