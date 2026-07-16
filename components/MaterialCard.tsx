import Link from "next/link";
import { routes } from "@/lib/links";
import { materialTypeLabels, type Material } from "@/lib/types";
import styles from "./MaterialCard.module.css";

export default function MaterialCard({
  material,
  categoryTitle,
}: {
  material: Material;
  categoryTitle: string;
}) {
  return (
    <Link href={routes.material(material.slug)} className={styles.card}>
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
        <span className={styles.type}>{materialTypeLabels[material.type]}</span>
        {!material.isFree && <span className={styles.locked}>Только в закрытом канале</span>}
      </div>

      <div className={styles.body}>
        <span className={styles.category}>{categoryTitle}</span>
        <h3 className={styles.title}>{material.title}</h3>
        <p className={styles.desc}>{material.description}</p>
        <span className={styles.more}>Открыть →</span>
      </div>
    </Link>
  );
}
