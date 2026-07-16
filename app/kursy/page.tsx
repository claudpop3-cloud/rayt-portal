import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/links";
import styles from "./stub.module.css";

export const metadata: Metadata = {
  title: "Курсы по Ozon · Makeunion",
};

export default function CoursesPage() {
  return (
    <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">Курсы</span>
        <h1>
          Обучение по <em>Ozon</em>
        </h1>
        <p className="soft">
          Два направления по авторской системе Романа Райта. Выбери своё – внутри
          программа, тарифы и заявка.
        </p>
      </div>

      <div className={styles.cards}>
        <Link href={routes.courseSeller} className={styles.courseCard}>
          <span className="badge">Селлер</span>
          <h3>Курс по Ozon для селлеров</h3>
          <p>
            Свой магазин с прибылью: подбор товара по юнит-экономике, реклама в плюс,
            нейросети в каждом модуле. 9 из 10 магазинов по системе выходят в плюс.
          </p>
          <span className={styles.link}>Открыть курс →</span>
        </Link>

        <Link href={routes.courseManager} className={styles.courseCard}>
          <span className="badge">Менеджер</span>
          <h3>Курс для менеджеров маркетплейсов</h3>
          <p>
            Профессия без своего товара: удалённый доход на Ozon, портфолио и первый клиент
            по гарантии за 2 месяца.
          </p>
          <span className={styles.link}>Открыть курс →</span>
        </Link>
      </div>
    </div>
  );
}
