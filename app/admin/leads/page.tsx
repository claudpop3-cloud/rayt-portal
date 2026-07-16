import Link from "next/link";
import type { Metadata } from "next";
import { getLeads } from "@/lib/leads";
import { routes } from "@/lib/links";
import styles from "./leads.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявки с квизов · Makeunion",
};

function formatDate(iso: string): string {
  // Стабильно без локали: YYYY-MM-DD HH:MM
  return iso.replace("T", " ").slice(0, 16);
}

export default async function AdminLeadsPage() {
  const leads = await getLeads();
  // Запись — заявка, если оставлен контакт (форма сопровождения/квиза) ИЛИ пройден квиз.
  // «Не завершено» — только брошенный старт квиза без контакта и без исхода.
  const withContact = leads.filter((l) => l.contacted).length;
  const quizDone = leads.filter((l) => l.resultId).length;
  const abandoned = leads.filter((l) => !l.contacted && !l.resultId).length;

  return (
    <div className="container">
      <div className={styles.head}>
        <div>
          <Link href={routes.admin} className={styles.inlineLink}>
            ← Админка
          </Link>
          <h1 style={{ marginTop: 10 }}>Заявки и прохождения</h1>
          <p className="soft">
            Единый список: заявки с лендингов сопровождения и квиза (контакт, ситуация,
            исход, ИИ-разбор) и брошенные старты квиза. Новые — сверху.
          </p>
        </div>
        <span className="badge badge-outline">
          {leads.length} записей · {withContact} заявок · {quizDone} прошли квиз ·{" "}
          {abandoned} не завершено
        </span>
      </div>

      <div className={styles.note}>
        Демо-режим: заявки пишутся в <code>data/leads.json</code>. Работает локально
        (<code>npm run dev</code>). На проде источником станет БД/CRM — интерфейс доступа
        изолирован в <code>lib/leads.ts</code>.
      </div>

      {leads.length === 0 ? (
        <div className={styles.empty}>
          Пока прохождений нет. Пройдите{" "}
          <Link href={routes.quiz} className={styles.inlineLink}>
            квиз
          </Link>{" "}
          до результата — прохождение появится здесь.
        </div>
      ) : (
        <div className={styles.list}>
          {leads.map((lead) => {
            if (!lead.resultId && !lead.contacted) {
              return (
                <div key={lead.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.noContact}>Тест начат, не завершён</span>
                    <span className={styles.date}>{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={lead.id} className={styles.item}>
              <div className={styles.itemHead}>
                {lead.contacted ? (
                  <>
                    <span className="badge">Заявка</span>
                    <span className={styles.name}>{lead.name}</span>
                    <span className={styles.contact}>{lead.contact}</span>
                  </>
                ) : (
                  <span className={styles.noContact}>Прохождение без контакта</span>
                )}
                {lead.result ? (
                  <span className="badge badge-outline">{lead.result}</span>
                ) : null}
                <span className={styles.date}>{formatDate(lead.createdAt)}</span>
              </div>

              {lead.situation ? (
                <p className={styles.situation}>«{lead.situation}»</p>
              ) : null}

              {lead.ai ? (
                <details className={styles.answers}>
                  <summary>ИИ-разбор</summary>
                  <div className={styles.ai}>
                    {lead.ai.headline ? <p className={styles.aiHead}>{lead.ai.headline}</p> : null}
                    {lead.ai.diagnosis ? (
                      <p>
                        <b>Диагноз:</b> {lead.ai.diagnosis}
                      </p>
                    ) : null}
                    {lead.ai.why && lead.ai.why.length ? (
                      <div>
                        <b>Почему путь подходит:</b>
                        <ul>
                          {lead.ai.why.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {lead.ai.firstStep ? (
                      <p>
                        <b>Первый шаг:</b> {lead.ai.firstStep}
                      </p>
                    ) : null}
                    {lead.ai.honest ? (
                      <p>
                        <b>Честно:</b> {lead.ai.honest}
                      </p>
                    ) : null}
                  </div>
                </details>
              ) : null}

              {Object.keys(lead.answers).length ? (
                <details className={styles.answers}>
                  <summary>
                    {lead.resultId ? "Ответы квиза" : "Анкета заявки"} (
                    {Object.keys(lead.answers).length})
                  </summary>
                  <dl>
                    {Object.entries(lead.answers).map(([q, a]) => (
                      <div key={q} className={styles.qa}>
                        <dt>{q}</dt>
                        <dd>{a}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
