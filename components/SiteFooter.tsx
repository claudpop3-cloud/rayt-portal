import Link from "next/link";
import { routes } from "@/lib/links";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-rayt.png" alt="Райт" className={styles.logoImg} />
            <span className={styles.logoTag}>Makeunion</span>
          </div>
          <p className="muted">
            Портал по Ozon и маркетплейсам: материалы, квиз, сопровождение и курсы —
            в одном месте.
          </p>
        </div>

        <div className={styles.linksCol}>
          <span className={styles.colTitle}>Разделы</span>
          <Link href={routes.home}>Каталог материалов</Link>
          <Link href={routes.courses}>Курсы</Link>
          <Link href={routes.quiz}>Квиз</Link>
        </div>

        <div className={styles.linksCol}>
          <span className={styles.colTitle}>Сопровождение</span>
          <Link href={routes.sopSeller}>Селлеру</Link>
          <Link href={routes.sopManager}>Менеджеру</Link>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span className="muted">
          © {new Date().getFullYear()} Makeunion. Демо-портал тестовой недели.
        </span>
      </div>
    </footer>
  );
}
