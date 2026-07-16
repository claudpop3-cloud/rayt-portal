import Link from "next/link";
import { Check, X, Star } from "lucide-react";
import SopLeadForm, { type SopExtraField } from "@/components/SopLeadForm";
import { renderMarks } from "@/lib/marks";
import styles from "./CourseLanding.module.css";

export interface CourseCase { name: string; metric?: string; sub?: string; note: string }
export interface CourseStep { n?: string; t: string; d: string }
export interface CourseTariff {
  name: string;
  price: string;
  old?: string;
  installment?: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
  /** Внутренняя ссылка-тизер (напр. «Наставничество» → сопровождение). */
  href?: string;
  hrefLabel?: string;
}
export interface CourseFaq { q: string; a: string }
export interface CourseCard { t: string; d: string }

export interface CourseContent {
  product: string;
  hero: {
    badge: string;
    title: string;
    lead: string;
    facts: string[];
    ctaLabel: string;
  };
  selling: {
    title: string;
    rows?: { problem: string; solution: string }[];
    points?: { t: string; d: string }[];
    quote?: string;
    note?: string;
    headLeft?: string;
    headRight?: string;
  };
  path: { eyebrow: string; title: string; steps: CourseStep[] };
  program: { title: string; text: string; items?: string[] };
  author: { title: string; text: string };
  results: { title: string; note: string; cases: CourseCase[] };
  tariffs: { title: string; note?: string; items: CourseTariff[] };
  fits: { eyebrow: string; title: string; cards: CourseCard[] };
  faq: { items: CourseFaq[] };
  form: { title: string; sub: string; submitLabel: string; fields: SopExtraField[] };
}

export default function CourseLanding({ c }: { c: CourseContent }) {
  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={`${styles.heroPanel} rr-anim`}>
            <span className="badge">{c.hero.badge}</span>
            <h1 className={styles.h1}>{renderMarks(c.hero.title)}</h1>
            <p className={styles.lead}>{c.hero.lead}</p>
            <div className={styles.facts}>
              {c.hero.facts.map((f) => (
                <span key={f} className={styles.fact}>{f}</span>
              ))}
            </div>
            <div className={styles.heroCta}>
              <a href="#tarify" className="btn btn-primary">{c.hero.ctaLabel}</a>
              <a href="#programma" className="btn btn-secondary">Посмотреть программу</a>
            </div>
          </div>
        </div>
      </section>

      {/* ПРОДАЮЩИЙ 2-Й ЭКРАН */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Честно</span>
          <h2>{c.selling.title}</h2>
          {c.selling.rows ? (
            <div className={styles.compareTable}>
              <div className={styles.compareHead}>
                <span>{c.selling.headLeft || "Где сливают"}</span>
                <span>{c.selling.headRight || "Как закрывает система"}</span>
              </div>
              {c.selling.rows.map((r) => (
                <div key={r.problem} className={styles.compareRow}>
                  <span className={styles.rowBad}><X size={16} /> {r.problem}</span>
                  <span className={styles.rowGood}><Check size={16} /> {r.solution}</span>
                </div>
              ))}
            </div>
          ) : null}
          {c.selling.points ? (
            <div className={styles.points}>
              {c.selling.points.map((p) => (
                <div key={p.t} className={styles.point}>
                  <div className={styles.pointTitle}>{p.t}</div>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          ) : null}
          {c.selling.quote ? <blockquote className={styles.quote}>{c.selling.quote}</blockquote> : null}
          {c.selling.note ? <p className={styles.note}>{c.selling.note}</p> : null}
        </div>
      </section>

      {/* ПУТЬ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">{c.path.eyebrow}</span>
          <h2>{c.path.title}</h2>
          <div className={styles.steps}>
            {c.path.steps.map((s, i) => (
              <div key={s.t} className={styles.step}>
                <div className={styles.stepNum}>{s.n || String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3 className={styles.stepTitle}>{s.t}</h3>
                  <p className={styles.stepText}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПРОГРАММА */}
      <section id="programma" className={styles.section}>
        <div className="container-narrow">
          <span className="eyebrow">Программа</span>
          <h2>{c.program.title}</h2>
          <p className={styles.sub}>{c.program.text}</p>
          {c.program.items ? (
            <div className={styles.tags}>
              {c.program.items.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* КТО ВЕДЁТ */}
      <section className={styles.section}>
        <div className="container-narrow">
          <div className={styles.author}>
            <span className="eyebrow">Кто вас учит и ведёт</span>
            <div className={styles.authorText}>
              {c.author.text.split("\n\n").map((p, i) => (
                <p key={i}>{renderMarks(p)}</p>
              ))}
            </div>
            <div className={styles.sign}>– Роман Райт, автор системы</div>
          </div>
        </div>
      </section>

      {/* РЕЗУЛЬТАТЫ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Результаты учеников</span>
          <h2>{c.results.title}</h2>
          <div className={styles.caseGrid}>
            {c.results.cases.map((x) => (
              <div key={x.name} className={styles.caseCard}>
                {x.metric ? <div className={styles.caseMetric}>{x.metric}</div> : null}
                {x.sub ? <div className={styles.caseSub}>{x.sub}</div> : null}
                <div className={styles.caseNote}>{x.note}</div>
                <div className={styles.caseName}>{x.name}</div>
              </div>
            ))}
          </div>
          <p className={styles.note}>{c.results.note}</p>
        </div>
      </section>

      {/* ТАРИФЫ */}
      <section id="tarify" className={styles.section}>
        <div className="container">
          <span className="eyebrow">Тарифы</span>
          <h2>{c.tariffs.title}</h2>
          <div className={styles.tariffs}>
            {c.tariffs.items.map((t) => (
              <div key={t.name} className={`${styles.tariff} ${t.highlight ? styles.tariffHi : ""}`}>
                {t.badge ? <span className={styles.tariffBadge}><Star size={13} /> {t.badge}</span> : null}
                <div className={styles.tariffName}>{t.name}</div>
                <div className={styles.tariffPriceRow}>
                  {t.old ? <span className={styles.tariffOld}>{t.old}</span> : null}
                  <span className={styles.tariffPrice}>{t.price}</span>
                </div>
                {t.installment ? <div className={styles.tariffInstallment}>{t.installment}</div> : null}
                <ul className={styles.tariffFeatures}>
                  {t.features.map((f) => (
                    <li key={f}><Check size={16} /> <span>{f}</span></li>
                  ))}
                </ul>
                <a href="#zayavka" className={`btn ${t.highlight ? "btn-primary" : "btn-secondary"} ${styles.tariffBtn}`}>
                  Выбрать тариф
                </a>
                {t.href ? (
                  <Link href={t.href} className={styles.tariffLink}>
                    {t.hrefLabel || "Подробнее"} →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          {c.tariffs.note ? <p className={styles.note}>{c.tariffs.note}</p> : null}
        </div>
      </section>

      {/* КОМУ ПОДОЙДЁТ / ВЫБЕРИТЕ ПУТЬ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">{c.fits.eyebrow}</span>
          <h2>{c.fits.title}</h2>
          <div className={styles.fitGrid}>
            {c.fits.cards.map((p) => (
              <div key={p.t} className={styles.fitCard}>
                <div className={styles.fitTitle}>{p.t}</div>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className="container-narrow">
          <span className="eyebrow">Частые вопросы</span>
          <h2>Отвечаю честно</h2>
          <div className={styles.faq}>
            {c.faq.items.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ФОРМА */}
      <section id="zayavka" className={styles.section}>
        <div className="container-narrow">
          <span className="eyebrow">Заявка</span>
          <h2>{c.form.title}</h2>
          <p className={styles.sub}>{c.form.sub}</p>
          <SopLeadForm
            product={c.product}
            submitLabel={c.form.submitLabel}
            extraFields={c.form.fields}
          />
        </div>
      </section>
    </div>
  );
}
