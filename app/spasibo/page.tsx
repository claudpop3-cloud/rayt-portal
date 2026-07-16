import type { Metadata } from "next";
import { ArrowRight, Clock, ShieldCheck, Wallet, UserCheck } from "lucide-react";
import { getSiteContent } from "@/lib/siteContent";
import VideoEmbed from "@/components/VideoEmbed";
import styles from "./spasibo.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявка принята — что дальше · Роман Райт",
  description:
    "Спасибо за заявку на сопровождение. Менеджер свяжется в течение рабочего дня. Пока ждёшь — зайди в закрытый чат предзаписи с реальными результатами.",
};

// Титры из раскадровки видео (tz-spasibo-golos) — ключевые цифры, читаются и без звука
const TITRES = [
  { icon: <UserCheck size={18} />, t: "Ведёт закреплённый за тобой менеджер, не Роман лично" },
  { icon: <Clock size={18} />, t: "Менеджер свяжется примерно за 1 рабочий день" },
  { icon: <Wallet size={18} />, t: "Закуп 150–200к · если до 100к — начни с курса" },
  { icon: <ShieldCheck size={18} />, t: "2,5 мес · только Китай · рентабельность ~50% · 7 дней возврат" },
];

export default async function SpasiboPage() {
  const sc = await getSiteContent();
  return (
    <div className={styles.page}>
      {/* Подтверждение */}
      <section className={styles.top}>
        <div className="container-narrow">
          <div className={`${styles.panel} rr-anim`}>
            <span className="badge">Заявка принята</span>
            <h1 className={styles.h1}>
              Заявка у меня. <em>Что дальше</em>
            </h1>
            <p className={styles.lead}>
              Спасибо, что оставил заявку. Этот шаг большинство откладывает на «потом».
            </p>
            <p className={styles.text}>
              С тобой свяжется менеджер <b>в течение 1 рабочего дня</b>. Спокойно разберём
              твою ситуацию и подберём, что подойдёт именно тебе: сопровождение или для
              начала обычный курс. Без давления, решение за тобой.
            </p>

            <a
              href={sc.chatUrl}
              target="_blank"
              rel="noopener"
              className={`btn btn-primary ${styles.chatBtn}`}
            >
              Зайти в закрытый чат <ArrowRight size={18} />
            </a>
            <p className={styles.chatNote}>
              Там реальные результаты с цифрами и анонсы свободных мест. Без спама.
            </p>
          </div>
        </div>
      </section>

      {/* Видео-приветствие */}
      <section className={styles.section}>
        <div className="container-narrow">
          <span className="eyebrow">За полторы минуты</span>
          <h2>Как всё устроено и к чему готовиться</h2>
          <div className={styles.videoRow}>
            <div className={styles.videoCard}>
              <VideoEmbed src={sc.video.spasibo} label="Видео-приветствие Романа" />
            </div>
            <ul className={styles.titres}>
              {TITRES.map((x, i) => (
                <li key={i}>
                  <span className={styles.titreIcon}>{x.icon}</span>
                  <span>{x.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.honest}>
            Результат в сопровождении даёт система и менеджер, который рядом каждый день.
            Получается у тех, кто готов делать. Если это про тебя – добро пожаловать.
          </p>
        </div>
      </section>
    </div>
  );
}
