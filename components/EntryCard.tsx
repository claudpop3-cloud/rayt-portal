import Link from "next/link";
import styles from "./EntryCard.module.css";

export interface EntryCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
  accent?: "pink" | "purple" | "red";
}

export default function EntryCard({
  icon,
  title,
  text,
  ctaLabel,
  href,
  external,
  accent = "pink",
}: EntryCardProps) {
  const cta = (
    <span className={styles.cta}>
      {ctaLabel} <span aria-hidden>→</span>
    </span>
  );

  const inner = (
    <>
      <span className={`${styles.icon} ${styles[accent]}`}>{icon}</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
      {cta}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={styles.card}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.card}>
      {inner}
    </Link>
  );
}
