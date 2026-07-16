"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SopLeadForm.module.css";

type Status = "idle" | "sending" | "ok" | "error";

function newRecordId(): string {
  return "sop-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/** Дополнительное квалифицирующее поле формы (из ТЗ лендинга). */
export interface SopExtraField {
  /** Ключ/подпись, под которым ответ сохранится в заявке (виден в админке). */
  key: string;
  type: "select" | "text";
  /** Варианты для select. */
  options?: string[];
  /** Плейсхолдер для text / первый пункт select. */
  placeholder?: string;
  /** Это поле — свободный текст «ситуации» (показывается цитатой в админке). */
  asSituation?: boolean;
}

export interface SopLeadFormProps {
  /** Метка продукта — попадает в заявку. */
  product: string;
  /** Квалифицирующие поля (сверх имя/e-mail/telegram). Из ТЗ — обычно 3. */
  extraFields?: SopExtraField[];
  title?: string;
  note?: string;
  submitLabel?: string;
  /** Куда вести после успешной заявки. По умолчанию — «Спасибо». */
  redirectTo?: string;
}

/**
 * Форма заявки на сопровождение (6 полей по ТЗ tz-sopform/sopmanager-final):
 * Имя · E-mail · Telegram · + квалифицирующие поля продукта.
 * Пишет в общую систему заявок (POST /api/lead → lib/leads). Квалифицирующие
 * ответы кладём в answers (видны в админке), свободный текст — в situation.
 */
export default function SopLeadForm({
  product,
  extraFields = [],
  title = "Оставить заявку",
  note = "Это заявка на разбор, не оплата. Менеджер свяжется примерно за рабочий день, разберёт ситуацию и подскажет, что подойдёт. Никто не давит.",
  submitLabel = "Оставить заявку",
  redirectTo = "/spasibo",
}: SopLeadFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const idRef = useRef<string>("");

  const setField = (key: string, val: string) =>
    setExtra((prev) => ({ ...prev, [key]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || status === "ok") return;
    if (!name.trim() || !telegram.trim()) {
      setError("Заполните имя и Telegram.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    if (!idRef.current) idRef.current = newRecordId();

    // Собираем квалифицирующие ответы в answers; свободный текст — в situation.
    const answers: Record<string, string> = {};
    if (email.trim()) answers["E-mail"] = email.trim();
    let situation = "";
    for (const f of extraFields) {
      const val = (extra[f.key] || "").trim();
      if (!val) continue;
      if (f.asSituation) situation = val;
      else answers[f.key] = val;
    }

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idRef.current,
          name: name.trim(),
          contact: telegram.trim(),
          result: product,
          situation,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Ошибка отправки");
      setStatus("ok");
      if (redirectTo) router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className={styles.done}>
        <h3 className={styles.doneTitle}>Заявка принята</h3>
        <p>
          {name.trim() ? `${name.trim()}, ` : ""}заявка у нас. Менеджер из моей команды
          свяжется примерно за рабочий день. Переношу на страницу «Спасибо»…
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h3 className={styles.title}>{title}</h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="sop-name">Имя</label>
          <input
            id="sop-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как тебя зовут"
            autoComplete="name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="sop-email">E-mail</label>
          <input
            id="sop-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mail.ru"
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="sop-tg">Telegram</label>
        <input
          id="sop-tg"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@username или +7…"
        />
      </div>

      {extraFields.map((f) => (
        <div className={styles.field} key={f.key}>
          <label htmlFor={`sop-${f.key}`}>{f.key}</label>
          {f.type === "select" ? (
            <select
              id={`sop-${f.key}`}
              value={extra[f.key] || ""}
              onChange={(e) => setField(f.key, e.target.value)}
            >
              <option value="" disabled>
                {f.placeholder || "Выбери вариант"}
              </option>
              {(f.options || []).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <textarea
              id={`sop-${f.key}`}
              value={extra[f.key] || ""}
              onChange={(e) => setField(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
            />
          )}
        </div>
      ))}

      {status === "error" ? <p className={styles.err}>{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Отправляю…" : submitLabel}
      </button>
      <p className={styles.note}>{note}</p>
    </form>
  );
}
