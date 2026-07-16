import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMaterialBySlug, getCategoryTitle } from "@/lib/materials";
import { routes } from "@/lib/links";
import { materialTypeLabels } from "@/lib/types";
import styles from "./material.module.css";

// Данные читаются из JSON на каждый запрос — чтобы добавленные через админку
// материалы появлялись без пересборки.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const material = await getMaterialBySlug(slug);
  if (!material) return { title: "Материал не найден · Makeunion" };
  return {
    title: `${material.title} · Makeunion`,
    description: material.description,
  };
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const material = await getMaterialBySlug(slug);
  if (!material) notFound();

  const categoryTitle = await getCategoryTitle(material.category);

  return (
    <article className="container-narrow">
      <div className={styles.top}>
        <Link href={routes.home} className={styles.back}>
          ← Все материалы
        </Link>
      </div>

      <div className={styles.meta}>
        <span className="badge">{materialTypeLabels[material.type]}</span>
        <span className={styles.category}>{categoryTitle}</span>
        {!material.isFree && (
          <span className="badge badge-outline">Только в закрытом канале</span>
        )}
      </div>

      <h1 className={styles.title}>{material.title}</h1>
      <p className={styles.desc}>{material.description}</p>

      <div
        className={styles.cover}
        style={
          material.coverUrl
            ? { backgroundImage: `url(${material.coverUrl})` }
            : undefined
        }
      >
        {!material.coverUrl && (
          <span className={styles.coverMark}>{material.title.charAt(0)}</span>
        )}
      </div>

      {material.body && (
        <div className={styles.body}>
          {material.body.split("\n").map((line, i) =>
            line.trim() ? <p key={i}>{line}</p> : null
          )}
        </div>
      )}

      {material.contentUrl && (
        <div className={styles.actions}>
          <a
            href={material.contentUrl}
            target="_blank"
            rel="noopener"
            className="btn btn-primary"
          >
            Открыть материал →
          </a>
        </div>
      )}
    </article>
  );
}
