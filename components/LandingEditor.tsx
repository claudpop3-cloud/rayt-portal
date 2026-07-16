"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SopContent } from "@/components/SopLanding";
import styles from "./LandingEditor.module.css";

type Status = "idle" | "saving" | "ok" | "error";

/** Редактор строкового списка (add/remove). */
function StringList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className={styles.list}>
      {items.map((s, i) => (
        <div className={styles.listRow} key={i}>
          <input
            value={s}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" className={styles.rm} onClick={() => onChange(items.filter((_, j) => j !== i))} title="Удалить">✕</button>
        </div>
      ))}
      <button type="button" className={styles.add} onClick={() => onChange([...items, ""])}>+ Добавить пункт</button>
    </div>
  );
}

export default function LandingEditor({ id, initial }: { id: string; initial: SopContent }) {
  const router = useRouter();
  const [c, setC] = useState<SopContent>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  // Иммутабельные апдейтеры секций
  const patch = (p: Partial<SopContent>) => setC((s) => ({ ...s, ...p }));
  const hero = (p: Partial<SopContent["hero"]>) => patch({ hero: { ...c.hero, ...p } });
  const cases = (p: Partial<SopContent["cases"]>) => patch({ cases: { ...c.cases, ...p } });
  const market = (p: Partial<SopContent["market"]>) => patch({ market: { ...c.market, ...p } });
  const how = (p: Partial<SopContent["how"]>) => patch({ how: { ...c.how, ...p } });
  const diff = (p: Partial<SopContent["diff"]>) => patch({ diff: { ...c.diff, ...p } });
  const author = (p: Partial<SopContent["author"]>) => patch({ author: { ...c.author, ...p } });
  const profiles = (p: Partial<SopContent["profiles"]>) => patch({ profiles: { ...c.profiles, ...p } });
  const guarantee = (p: Partial<SopContent["guarantee"]>) => patch({ guarantee: { ...c.guarantee, ...p } });
  const price = (p: Partial<SopContent["price"]>) => patch({ price: { ...c.price, ...p } });
  const form = (p: Partial<SopContent["form"]>) => patch({ form: { ...c.form, ...p } });

  async function save() {
    if (status === "saving") return;
    setStatus("saving");
    setMsg("");
    try {
      const res = await fetch(`/api/landing?id=${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Не удалось сохранить");
      setStatus("ok");
      setMsg("Сохранено. Изменения уже на лендинге.");
      router.refresh();
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Ошибка сети");
    }
  }

  async function reset() {
    if (!window.confirm("Сбросить весь контент лендинга к значениям по умолчанию?")) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/landing?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка");
      setC(json.content as SopContent);
      setStatus("ok");
      setMsg("Сброшено к значениям по умолчанию.");
      router.refresh();
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Ошибка сети");
    }
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.hintTop}>
        Подсветка слова в заголовках — обернуть в <code>**звёздочки**</code>. Изменения
        применяются после «Сохранить».
      </p>

      {/* HERO */}
      <fieldset className={styles.group}>
        <legend>Hero</legend>
        <label>Бейдж</label>
        <input value={c.hero.badge} onChange={(e) => hero({ badge: e.target.value })} />
        <label>Заголовок</label>
        <textarea rows={2} value={c.hero.title} onChange={(e) => hero({ title: e.target.value })} />
        <label>Подзаголовок</label>
        <textarea rows={3} value={c.hero.lead} onChange={(e) => hero({ lead: e.target.value })} />
        <label>Видео (embed-ссылка, пусто = слот-заготовка)</label>
        <input value={c.hero.videoUrl ?? ""} onChange={(e) => hero({ videoUrl: e.target.value })} placeholder="https://…" />
      </fieldset>

      {/* КЕЙСЫ */}
      <fieldset className={styles.group}>
        <legend>Результаты (кейсы)</legend>
        <label>Заголовок блока</label>
        <input value={c.cases.title} onChange={(e) => cases({ title: e.target.value })} />
        <label>Подзаголовок</label>
        <textarea rows={2} value={c.cases.sub} onChange={(e) => cases({ sub: e.target.value })} />
        {c.cases.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Кейс {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => cases({ items: c.cases.items.filter((_, j) => j !== i) })}>✕ удалить</button>
            </div>
            <div className={styles.row2}>
              <input placeholder="Цифра (2,1 млн)" value={it.metric} onChange={(e) => cases({ items: c.cases.items.map((x, j) => (j === i ? { ...x, metric: e.target.value } : x)) })} />
              <input placeholder="Подпись цифры" value={it.sub} onChange={(e) => cases({ items: c.cases.items.map((x, j) => (j === i ? { ...x, sub: e.target.value } : x)) })} />
            </div>
            <input placeholder="Описание" value={it.note} onChange={(e) => cases({ items: c.cases.items.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) })} />
            <input placeholder="Имя" value={it.name} onChange={(e) => cases({ items: c.cases.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => cases({ items: [...c.cases.items, { name: "", metric: "", sub: "", note: "" }] })}>+ Добавить кейс</button>
      </fieldset>

      {/* РЫНОК / СРАВНЕНИЕ */}
      <fieldset className={styles.group}>
        <legend>Честно о рынке + сравнение</legend>
        <label>Заголовок</label>
        <textarea rows={2} value={c.market.title} onChange={(e) => market({ title: e.target.value })} />
        <label>Текст</label>
        <textarea rows={4} value={c.market.text} onChange={(e) => market({ text: e.target.value })} />
        <div className={styles.row2}>
          <div>
            <label>Заголовок «минус»-колонки</label>
            <input value={c.market.withoutTitle} onChange={(e) => market({ withoutTitle: e.target.value })} />
            <StringList items={c.market.withoutList} onChange={(v) => market({ withoutList: v })} placeholder="Пункт «без сопровождения»" />
          </div>
          <div>
            <label>Заголовок «плюс»-колонки</label>
            <input value={c.market.withTitle} onChange={(e) => market({ withTitle: e.target.value })} />
            <StringList items={c.market.withList} onChange={(v) => market({ withList: v })} placeholder="Пункт «с сопровождением»" />
          </div>
        </div>
      </fieldset>

      {/* КАК РАБОТАЕТ */}
      <fieldset className={styles.group}>
        <legend>Как это работает (шаги)</legend>
        <label>Заголовок</label>
        <input value={c.how.title} onChange={(e) => how({ title: e.target.value })} />
        {c.how.steps.map((s, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Шаг {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => how({ steps: c.how.steps.filter((_, j) => j !== i) })}>✕ удалить</button>
            </div>
            <div className={styles.row2}>
              <input placeholder="№ (01)" value={s.n} onChange={(e) => how({ steps: c.how.steps.map((x, j) => (j === i ? { ...x, n: e.target.value } : x)) })} />
              <input placeholder="Заголовок шага" value={s.t} onChange={(e) => how({ steps: c.how.steps.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
            </div>
            <textarea rows={2} placeholder="Описание" value={s.d} onChange={(e) => how({ steps: c.how.steps.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => how({ steps: [...c.how.steps, { n: "", t: "", d: "" }] })}>+ Добавить шаг</button>
        <label>Итог (outcome)</label>
        <textarea rows={2} value={c.how.outcome} onChange={(e) => how({ outcome: e.target.value })} />
      </fieldset>

      {/* ОТЛИЧИЕ */}
      <fieldset className={styles.group}>
        <legend>Отличие от курса/кураторов</legend>
        <label>Заголовок</label>
        <input value={c.diff.title} onChange={(e) => diff({ title: e.target.value })} />
        {c.diff.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Колонка {i + 1}{i === c.diff.items.length - 1 ? " (выделенная)" : ""}</span>
              <button type="button" className={styles.rm} onClick={() => diff({ items: c.diff.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <input placeholder="Заголовок" value={it.head} onChange={(e) => diff({ items: c.diff.items.map((x, j) => (j === i ? { ...x, head: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Текст" value={it.text} onChange={(e) => diff({ items: c.diff.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => diff({ items: [...c.diff.items, { head: "", text: "" }] })}>+ Добавить колонку</button>
      </fieldset>

      {/* АВТОР */}
      <fieldset className={styles.group}>
        <legend>Кто ведёт (автор)</legend>
        <label>Вступление (крупным)</label>
        <textarea rows={2} value={c.author.lead} onChange={(e) => author({ lead: e.target.value })} />
        <label>Текст</label>
        <textarea rows={3} value={c.author.text} onChange={(e) => author({ text: e.target.value })} />
        <label>Подпись</label>
        <input value={c.author.sign} onChange={(e) => author({ sign: e.target.value })} />
      </fieldset>

      {/* КОМУ ПОДОЙДЁТ */}
      <fieldset className={styles.group}>
        <legend>Кому подойдёт</legend>
        <label>Заголовок</label>
        <input value={c.profiles.title} onChange={(e) => profiles({ title: e.target.value })} />
        {c.profiles.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Пункт {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => profiles({ items: c.profiles.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <input placeholder="Заголовок" value={it.t} onChange={(e) => profiles({ items: c.profiles.items.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
            <input placeholder="Описание" value={it.d} onChange={(e) => profiles({ items: c.profiles.items.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => profiles({ items: [...c.profiles.items, { t: "", d: "" }] })}>+ Добавить пункт</button>
        <label>Приписка (необязательно)</label>
        <textarea rows={2} value={c.profiles.note ?? ""} onChange={(e) => profiles({ note: e.target.value })} />
      </fieldset>

      {/* ГАРАНТИЯ */}
      <fieldset className={styles.group}>
        <legend>Гарантия</legend>
        <label>Заголовок</label>
        <input value={c.guarantee.title} onChange={(e) => guarantee({ title: e.target.value })} />
        {c.guarantee.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Гарантия {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => guarantee({ items: c.guarantee.items.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <input placeholder="Заголовок" value={it.title} onChange={(e) => guarantee({ items: c.guarantee.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
            <textarea rows={2} placeholder="Текст" value={it.text} onChange={(e) => guarantee({ items: c.guarantee.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => guarantee({ items: [...c.guarantee.items, { title: "", text: "" }] })}>+ Добавить гарантию</button>
      </fieldset>

      {/* ЦЕНА */}
      <fieldset className={styles.group}>
        <legend>Стоимость</legend>
        <div className={styles.row3}>
          <div><label>Старая цена</label><input value={c.price.old} onChange={(e) => price({ old: e.target.value })} /></div>
          <div><label>Текущая цена</label><input value={c.price.now} onChange={(e) => price({ now: e.target.value })} /></div>
          <div><label>Рассрочка</label><input value={c.price.installment} onChange={(e) => price({ installment: e.target.value })} /></div>
        </div>
        <label>Что входит</label>
        <StringList items={c.price.included} onChange={(v) => price({ included: v })} placeholder="Пункт «что входит»" />
        <label>Текст кнопки</label>
        <input value={c.price.button} onChange={(e) => price({ button: e.target.value })} />
        <label>Обоснование под ценой</label>
        <textarea rows={3} value={c.price.just} onChange={(e) => price({ just: e.target.value })} />
      </fieldset>

      {/* FAQ */}
      <fieldset className={styles.group}>
        <legend>Частые вопросы (FAQ)</legend>
        {c.faq.items.map((it, i) => (
          <div className={styles.card} key={i}>
            <div className={styles.cardHead}>
              <span>Вопрос {i + 1}</span>
              <button type="button" className={styles.rm} onClick={() => patch({ faq: { items: c.faq.items.filter((_, j) => j !== i) } })}>✕</button>
            </div>
            <input placeholder="Вопрос" value={it.q} onChange={(e) => patch({ faq: { items: c.faq.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) } })} />
            <textarea rows={2} placeholder="Ответ" value={it.a} onChange={(e) => patch({ faq: { items: c.faq.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) } })} />
          </div>
        ))}
        <button type="button" className={styles.add} onClick={() => patch({ faq: { items: [...c.faq.items, { q: "", a: "" }] } })}>+ Добавить вопрос</button>
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
        <p className={styles.note}>Поля формы (квалификация) пока настраиваются в коде.</p>
      </fieldset>

      {/* ДЕЙСТВИЯ */}
      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Сохраняю…" : "Сохранить"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={reset} disabled={status === "saving"}>
          Сбросить к умолчанию
        </button>
        {msg ? <span className={status === "error" ? styles.err : styles.ok}>{msg}</span> : null}
      </div>
    </div>
  );
}
