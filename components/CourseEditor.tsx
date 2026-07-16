"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseContent } from "@/components/CourseLanding";
import styles from "./LandingEditor.module.css";

type Status = "idle" | "saving" | "ok" | "error";

function StringList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className={styles.list}>
      {items.map((s, i) => (
        <div className={styles.listRow} key={i}>
          <input value={s} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className={styles.rm} onClick={() => onChange(items.filter((_, j) => j !== i))} title="Удалить">✕</button>
        </div>
      ))}
      <button type="button" className={styles.add} onClick={() => onChange([...items, ""])}>+ Добавить пункт</button>
    </div>
  );
}

export default function CourseEditor({ id, initial }: { id: string; initial: CourseContent }) {
  const router = useRouter();
  const [c, setC] = useState<CourseContent>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  const patch = (p: Partial<CourseContent>) => setC((s) => ({ ...s, ...p }));
  const hero = (p: Partial<CourseContent["hero"]>) => patch({ hero: { ...c.hero, ...p } });
  const selling = (p: Partial<CourseContent["selling"]>) => patch({ selling: { ...c.selling, ...p } });
  const path = (p: Partial<CourseContent["path"]>) => patch({ path: { ...c.path, ...p } });
  const program = (p: Partial<CourseContent["program"]>) => patch({ program: { ...c.program, ...p } });
  const author = (p: Partial<CourseContent["author"]>) => patch({ author: { ...c.author, ...p } });
  const results = (p: Partial<CourseContent["results"]>) => patch({ results: { ...c.results, ...p } });
  const tariffs = (p: Partial<CourseContent["tariffs"]>) => patch({ tariffs: { ...c.tariffs, ...p } });
  const fits = (p: Partial<CourseContent["fits"]>) => patch({ fits: { ...c.fits, ...p } });
  const form = (p: Partial<CourseContent["form"]>) => patch({ form: { ...c.form, ...p } });

  const rows = c.selling.rows ?? [];
  const points = c.selling.points ?? [];

  async function save() {
    if (status === "saving") return;
    setStatus("saving"); setMsg("");
    try {
      const res = await fetch(`/api/landing?id=${encodeURIComponent(id)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Не удалось сохранить");
      setStatus("ok"); setMsg("Сохранено. Изменения уже на лендинге."); router.refresh();
    } catch (e) { setStatus("error"); setMsg(e instanceof Error ? e.message : "Ошибка сети"); }
  }
  async function reset() {
    if (!window.confirm("Сбросить весь контент лендинга к значениям по умолчанию?")) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/landing?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка");
      setC(json.content as CourseContent); setStatus("ok"); setMsg("Сброшено к значениям по умолчанию."); router.refresh();
    } catch (e) { setStatus("error"); setMsg(e instanceof Error ? e.message : "Ошибка сети"); }
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.hintTop}>Подсветка слова в заголовках — <code>**звёздочки**</code>. Абзацы в тексте автора — пустой строкой.</p>

      {/* HERO */}
      <fieldset className={styles.group}>
        <legend>Hero</legend>
        <label>Бейдж</label>
        <input value={c.hero.badge} onChange={(e) => hero({ badge: e.target.value })} />
        <label>Заголовок</label>
        <textarea rows={2} value={c.hero.title} onChange={(e) => hero({ title: e.target.value })} />
        <label>Подзаголовок</label>
        <textarea rows={3} value={c.hero.lead} onChange={(e) => hero({ lead: e.target.value })} />
        <label>Факты (плашки)</label>
        <StringList items={c.hero.facts} onChange={(v) => hero({ facts: v })} placeholder="Факт" />
        <label>Текст кнопки</label>
        <input value={c.hero.ctaLabel} onChange={(e) => hero({ ctaLabel: e.target.value })} />
      </fieldset>

      {/* ПРОДАЮЩИЙ ЭКРАН */}
      <fieldset className={styles.group}>
        <legend>Продающий 2-й экран</legend>
        <label>Заголовок</label>
        <textarea rows={2} value={c.selling.title} onChange={(e) => selling({ title: e.target.value })} />
        <div className={styles.subTitle} style={{ marginTop: 12 }}>Таблица «где сливают / как закрывает» (для курса-селлера)</div>
        <div className={styles.row2}>
          <input placeholder="Заголовок левой колонки" value={c.selling.headLeft ?? ""} onChange={(e) => selling({ headLeft: e.target.value })} />
          <input placeholder="Заголовок правой колонки" value={c.selling.headRight ?? ""} onChange={(e) => selling({ headRight: e.target.value })} />
        </div>
        {rows.map((r, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Строка {i + 1}</span><button type="button" className={styles.rm} onClick={() => selling({ rows: rows.filter((_, j) => j !== i) })}>✕</button></div>
            <input placeholder="Проблема (где сливают)" value={r.problem} onChange={(e) => selling({ rows: rows.map((x, j) => (j === i ? { ...x, problem: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Как закрывает система" value={r.solution} onChange={(e) => selling({ rows: rows.map((x, j) => (j === i ? { ...x, solution: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => selling({ rows: [...rows, { problem: "", solution: "" }] })}>+ Строка таблицы</button>

        <div className={styles.subTitle} style={{ marginTop: 16 }}>Пункты (для курса-менеджера)</div>
        {points.map((p, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Пункт {i + 1}</span><button type="button" className={styles.rm} onClick={() => selling({ points: points.filter((_, j) => j !== i) })}>✕</button></div>
            <input placeholder="Заголовок" value={p.t} onChange={(e) => selling({ points: points.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Текст" value={p.d} onChange={(e) => selling({ points: points.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => selling({ points: [...points, { t: "", d: "" }] })}>+ Пункт</button>

        <label style={{ marginTop: 14 }}>Врезка-цитата (необязательно)</label>
        <textarea rows={2} value={c.selling.quote ?? ""} onChange={(e) => selling({ quote: e.target.value })} />
        <label>Приписка (необязательно)</label>
        <textarea rows={2} value={c.selling.note ?? ""} onChange={(e) => selling({ note: e.target.value })} />
      </fieldset>

      {/* ПУТЬ */}
      <fieldset className={styles.group}>
        <legend>Путь / карьерный путь</legend>
        <div className={styles.row2}>
          <input placeholder="Надзаголовок" value={c.path.eyebrow} onChange={(e) => path({ eyebrow: e.target.value })} />
          <input placeholder="Заголовок" value={c.path.title} onChange={(e) => path({ title: e.target.value })} />
        </div>
        {c.path.steps.map((s, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Шаг {i + 1}</span><button type="button" className={styles.rm} onClick={() => path({ steps: c.path.steps.filter((_, j) => j !== i) })}>✕</button></div>
            <input placeholder="Заголовок шага" value={s.t} onChange={(e) => path({ steps: c.path.steps.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Описание" value={s.d} onChange={(e) => path({ steps: c.path.steps.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => path({ steps: [...c.path.steps, { t: "", d: "" }] })}>+ Шаг</button>
      </fieldset>

      {/* ПРОГРАММА */}
      <fieldset className={styles.group}>
        <legend>Программа</legend>
        <label>Заголовок</label>
        <input value={c.program.title} onChange={(e) => program({ title: e.target.value })} />
        <label>Текст</label>
        <textarea rows={2} value={c.program.text} onChange={(e) => program({ text: e.target.value })} />
        <label>Теги-модули</label>
        <StringList items={c.program.items ?? []} onChange={(v) => program({ items: v })} placeholder="Модуль" />
      </fieldset>

      {/* АВТОР */}
      <fieldset className={styles.group}>
        <legend>Кто ведёт (автор)</legend>
        <label>Заголовок блока</label>
        <input value={c.author.title} onChange={(e) => author({ title: e.target.value })} />
        <label>Текст (абзацы — пустой строкой; **слово** — подсветка)</label>
        <textarea rows={6} value={c.author.text} onChange={(e) => author({ text: e.target.value })} />
      </fieldset>

      {/* РЕЗУЛЬТАТЫ */}
      <fieldset className={styles.group}>
        <legend>Результаты (кейсы)</legend>
        <label>Заголовок</label>
        <input value={c.results.title} onChange={(e) => results({ title: e.target.value })} />
        {c.results.cases.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Кейс {i + 1}</span><button type="button" className={styles.rm} onClick={() => results({ cases: c.results.cases.filter((_, j) => j !== i) })}>✕</button></div>
            <div className={styles.row2}>
              <input placeholder="Цифра" value={it.metric ?? ""} onChange={(e) => results({ cases: c.results.cases.map((x, j) => (j === i ? { ...x, metric: e.target.value } : x)) })} />
              <input placeholder="Подпись цифры" value={it.sub ?? ""} onChange={(e) => results({ cases: c.results.cases.map((x, j) => (j === i ? { ...x, sub: e.target.value } : x)) })} />
            </div>
            <input placeholder="Описание" value={it.note} onChange={(e) => results({ cases: c.results.cases.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) })} />
            <input placeholder="Имя" value={it.name} onChange={(e) => results({ cases: c.results.cases.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => results({ cases: [...c.results.cases, { name: "", metric: "", sub: "", note: "" }] })}>+ Кейс</button>
        <label>Приписка</label>
        <textarea rows={2} value={c.results.note} onChange={(e) => results({ note: e.target.value })} />
      </fieldset>

      {/* ТАРИФЫ */}
      <fieldset className={styles.group}>
        <legend>Тарифы</legend>
        <label>Заголовок</label>
        <input value={c.tariffs.title} onChange={(e) => tariffs({ title: e.target.value })} />
        {c.tariffs.items.map((t, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Тариф {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => tariffs({ items: c.tariffs.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <input placeholder="Название" value={t.name} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
            <div className={styles.row3}>
              <input placeholder="Цена" value={t.price} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} />
              <input placeholder="Старая цена" value={t.old ?? ""} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, old: e.target.value } : x)) })} />
              <input placeholder="Рассрочка" value={t.installment ?? ""} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, installment: e.target.value } : x)) })} />
            </div>
            <div className={styles.row2}>
              <input placeholder="Бейдж (напр. Хит)" value={t.badge ?? ""} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, badge: e.target.value } : x)) })} />
              <label style={{ display: "flex", gap: 8, alignItems: "center", margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 14 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={!!t.highlight} onChange={(e) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, highlight: e.target.checked } : x)) })} />
                Выделенный (хит)
              </label>
            </div>
            <div style={{ marginTop: 8 }}>Что входит:</div>
            <StringList items={t.features} onChange={(v) => tariffs({ items: c.tariffs.items.map((x, j) => (j === i ? { ...x, features: v } : x)) })} placeholder="Пункт тарифа" />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => tariffs({ items: [...c.tariffs.items, { name: "", price: "", features: [] }] })}>+ Тариф</button>
        <label>Приписка под тарифами</label>
        <textarea rows={2} value={c.tariffs.note ?? ""} onChange={(e) => tariffs({ note: e.target.value })} />
      </fieldset>

      {/* КОМУ ПОДОЙДЁТ */}
      <fieldset className={styles.group}>
        <legend>Кому подойдёт / выберите путь</legend>
        <div className={styles.row2}>
          <input placeholder="Надзаголовок" value={c.fits.eyebrow} onChange={(e) => fits({ eyebrow: e.target.value })} />
          <input placeholder="Заголовок" value={c.fits.title} onChange={(e) => fits({ title: e.target.value })} />
        </div>
        {c.fits.cards.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Карточка {i + 1}</span><button type="button" className={styles.rm} onClick={() => fits({ cards: c.fits.cards.filter((_, j) => j !== i) })}>✕</button></div>
            <input placeholder="Заголовок" value={it.t} onChange={(e) => fits({ cards: c.fits.cards.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Описание" value={it.d} onChange={(e) => fits({ cards: c.fits.cards.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => fits({ cards: [...c.fits.cards, { t: "", d: "" }] })}>+ Карточка</button>
      </fieldset>

      {/* FAQ */}
      <fieldset className={styles.group}>
        <legend>Частые вопросы (FAQ)</legend>
        {c.faq.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}><span>Вопрос {i + 1}</span><button type="button" className={styles.rm} onClick={() => patch({ faq: { items: c.faq.items.filter((_, j) => j !== i) } })}>✕</button></div>
            <input placeholder="Вопрос" value={it.q} onChange={(e) => patch({ faq: { items: c.faq.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) } })} />
            <textarea rows={2} placeholder="Ответ" value={it.a} onChange={(e) => patch({ faq: { items: c.faq.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) } })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => patch({ faq: { items: [...c.faq.items, { q: "", a: "" }] } })}>+ Вопрос</button>
      </fieldset>

      {/* ФОРМА */}
      <fieldset className={styles.group}>
        <legend>Форма заявки (тексты)</legend>
        <label>Заголовок</label>
        <input value={c.form.title} onChange={(e) => form({ title: e.target.value })} />
        <label>Подзаголовок</label>
        <textarea rows={2} value={c.form.sub} onChange={(e) => form({ sub: e.target.value })} />
        <label>Текст кнопки</label>
        <input value={c.form.submitLabel} onChange={(e) => form({ submitLabel: e.target.value })} />
        <p className={styles.note}>Поля формы (квалификация) настраиваются в коде.</p>
      </fieldset>

      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={status === "saving"}>{status === "saving" ? "Сохраняю…" : "Сохранить"}</button>
        <button type="button" className="btn btn-secondary" onClick={reset} disabled={status === "saving"}>Сбросить к умолчанию</button>
        {msg ? <span className={status === "error" ? styles.err : styles.ok}>{msg}</span> : null}
      </div>
    </div>
  );
}
