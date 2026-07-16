import { Check, X } from "lucide-react";
import SopLeadForm, { type SopExtraField } from "@/components/SopLeadForm";
import VideoEmbed from "@/components/VideoEmbed";
import { renderMarks } from "@/lib/marks";
import styles from "./SopLanding.module.css";

export interface SopCase { name: string; metric: string; sub: string; note: string }
export interface SopStep { n: string; t: string; d: string }
export interface SopDiff { head: string; text: string }
export interface SopProfile { t: string; d: string }
export interface SopGuarantee { title: string; text: string }
export interface SopFaq { q: string; a: string }

export interface SopContent {
  product: string;
  hero: { badge: string; title: string; lead: string; videoUrl?: string };
  cases: { title: string; sub: string; items: SopCase[] };
  market: {
    title: string;
    text: string;
    withoutTitle: string;
    withTitle: string;
    withoutList: string[];
    withList: string[];
  };
  how: { title: string; steps: SopStep[]; outcome: string };
  diff: { title: string; items: SopDiff[] };
  author: { lead: string; text: string; sign: string };
  profiles: { title: string; items: SopProfile[]; note?: string };
  guarantee: { title: string; items: SopGuarantee[] };
  price: {
    old: string;
    now: string;
    installment: string;
    included: string[];
    button: string;
    just: string;
  };
  faq: { items: SopFaq[] };
  form: { title: string; sub: string; submitLabel: string; fields: SopExtraField[] };
}

export default function SopLanding({ c }: { c: SopContent }) {
  return (
    <div className={styles.page}>
      {/* 1. HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`${styles.heroText} rr-anim`}>
              <span className="badge">{c.hero.badge}</span>
              <h1 className={styles.h1}>{renderMarks(c.hero.title)}</h1>
              <p className={styles.lead}>{c.hero.lead}</p>
              <div className={styles.heroCta}>
                <a href="#zayavka" className="btn btn-primary">Оставить заявку</a>
                <a href="#how" className="btn btn-secondary">Как это работает</a>
              </div>
            </div>
            <div className={`${styles.videoCard} rr-anim-slow`}>
              <VideoEmbed src={c.hero.videoUrl} label="Видео-приветствие Романа" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. РЕЗУЛЬТАТЫ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Результаты учеников</span>
          <h2>{c.cases.title}</h2>
          <p className={styles.sub}>{c.cases.sub}</p>
          <div className={styles.caseGrid}>
            {c.cases.items.map((x) => (
              <div key={x.name} className={styles.caseCard}>
                <div className={styles.caseMetric}>{x.metric}</div>
                <div className={styles.caseSub}>{x.sub}</div>
                <div className={styles.caseNote}>{x.note}</div>
                <div className={styles.caseName}>{x.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ЧЕСТНО О РЫНКЕ + СРАВНЕНИЕ */}
      <section className={styles.section}>
        <div className="container-narrow">
          <span className="eyebrow">Честно</span>
          <h2>{c.market.title}</h2>
          <p className={styles.sub}>{c.market.text}</p>
        </div>
        <div className="container">
          <div className={styles.compare}>
            <div className={`${styles.compareCol} ${styles.bad}`}>
              <div className={styles.compareTitle}>{c.market.withoutTitle}</div>
              <ul>
                {c.market.withoutList.map((t) => (
                  <li key={t}><X size={17} /> <span>{t}</span></li>
                ))}
              </ul>
            </div>
            <div className={`${styles.compareCol} ${styles.good}`}>
              <div className={styles.compareTitle}>{c.market.withTitle}</div>
              <ul>
                {c.market.withList.map((t) => (
                  <li key={t}><Check size={17} /> <span>{t}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ЗА СЧЁТ ЧЕГО */}
      <section id="how" className={styles.section}>
        <div className="container">
          <span className="eyebrow">Как это работает</span>
          <h2>{c.how.title}</h2>
          <div className={styles.steps}>
            {c.how.steps.map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div>
                  <h3 className={styles.stepTitle}>{s.t}</h3>
                  <p className={styles.stepText}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.outcome}>{renderMarks(c.how.outcome)}</p>
        </div>
      </section>

      {/* 5. ОТЛИЧИЕ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Отличие</span>
          <h2>{c.diff.title}</h2>
          <div className={styles.threeCol}>
            {c.diff.items.map((d, i) => (
              <div
                key={d.head}
                className={`${styles.diffCard} ${i === c.diff.items.length - 1 ? styles.diffHi : ""}`}
              >
                <div className={styles.diffHead}>{d.head}</div>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. КТО ВЕДЁТ */}
      <section className={styles.section}>
        <div className="container-narrow">
          <div className={styles.author}>
            <span className="eyebrow">Кто тебя ведёт</span>
            <p className={styles.authorLead}>{c.author.lead}</p>
            <p>{renderMarks(c.author.text)}</p>
            <div className={styles.sign}>{c.author.sign}</div>
          </div>
        </div>
      </section>

      {/* 7. КОГО БЕРУ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Кому подойдёт</span>
          <h2>{c.profiles.title}</h2>
          <div className={styles.profiles}>
            {c.profiles.items.map((p) => (
              <div key={p.t} className={styles.profile}>
                <Check size={18} className={styles.profileIcon} />
                <div>
                  <div className={styles.profileTitle}>{p.t}</div>
                  <div className={styles.profileText}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
          {c.profiles.note ? <p className={styles.smallNote}>{c.profiles.note}</p> : null}
        </div>
      </section>

      {/* 8. ГАРАНТИЯ */}
      <section className={styles.section}>
        <div className="container">
          <span className="eyebrow">Гарантия</span>
          <h2>{c.guarantee.title}</h2>
          <div className={styles.threeCol}>
            {c.guarantee.items.map((g) => (
              <div key={g.title} className={styles.guarantee}>
                <div className={styles.guaranteeTitle}>{g.title}</div>
                <p>{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. СТОИМОСТЬ */}
      <section className={styles.section}>
        <div className="container-narrow">
          <div className={styles.price}>
            <span className="eyebrow">Стоимость</span>
            <div className={styles.priceRow}>
              <span className={styles.priceOld}>{c.price.old}</span>
              <span className={styles.priceNew}>{c.price.now}</span>
            </div>
            <div className={styles.priceInstallment}>{c.price.installment}</div>
            <ul className={styles.priceList}>
              {c.price.included.map((t) => (
                <li key={t}><Check size={17} /> <span>{t}</span></li>
              ))}
            </ul>
            <a href="#zayavka" className="btn btn-primary">{c.price.button}</a>
            <p className={styles.priceJust}>{c.price.just}</p>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
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
