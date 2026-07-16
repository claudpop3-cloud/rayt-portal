import styles from "./StubBanner.module.css";

/**
 * Плашка «раздел в разработке» — для понятных заготовок разделов,
 * которые в рамках тестовой недели не собираются полностью.
 */
export default function StubBanner({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <span className={styles.tag}>В разработке</span>
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
