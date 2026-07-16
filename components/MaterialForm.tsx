"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { materialTypeLabels, type Category, type MaterialType } from "@/lib/types";
import styles from "./MaterialForm.module.css";

const TYPE_OPTIONS = Object.entries(materialTypeLabels) as [
  MaterialType,
  string
][];

export default function MaterialForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      title: data.get("title"),
      type: data.get("type"),
      category: data.get("category"),
      description: data.get("description"),
      contentUrl: data.get("contentUrl"),
      coverUrl: data.get("coverUrl"),
      body: data.get("body"),
      isFree: data.get("isFree") === "on",
    };

    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error ?? "Не удалось сохранить");
        return;
      }
      setStatus("ok");
      setMessage(`Материал «${json.material.title}» добавлен`);
      form.reset();
      // Обновляем список на этой странице и каталог
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Ошибка сети");
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="title">Заголовок *</label>
          <input id="title" name="title" required placeholder="Разбор магазина: посуда" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="type">Тип *</label>
          <select id="type" name="type" required defaultValue="article">
            {TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="category">Категория *</label>
          <select id="category" name="category" required defaultValue={categories[0]?.slug}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Краткое описание *</label>
        <textarea
          id="description"
          name="description"
          required
          rows={2}
          placeholder="1–2 предложения для карточки в каталоге"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="body">Текст материала</label>
        <textarea
          id="body"
          name="body"
          rows={4}
          placeholder="Полный текст (для статей и чек-листов). Необязательно."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contentUrl">Ссылка на материал</label>
          <input
            id="contentUrl"
            name="contentUrl"
            type="url"
            placeholder="https://… (видео, PDF, внешняя страница)"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="coverUrl">Ссылка на обложку</label>
          <input
            id="coverUrl"
            name="coverUrl"
            type="url"
            placeholder="https://… (если пусто — градиентная заглушка)"
          />
        </div>
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" name="isFree" defaultChecked />
        <span>Бесплатный материал (доступен без подписки)</span>
      </label>

      <div className={styles.actions}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Сохраняю…" : "Добавить материал"}
        </button>
        {message && (
          <span
            className={
              status === "error" ? styles.msgError : styles.msgOk
            }
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
