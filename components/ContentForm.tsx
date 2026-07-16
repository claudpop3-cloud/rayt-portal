"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/siteContent";
import styles from "./ContentForm.module.css";

type Status = "idle" | "saving" | "ok" | "error";

/**
 * Быстрые правки глобальных вещей, не входящих в полные редакторы лендингов:
 * видео на странице «Спасибо» и ссылка на закрытый чат.
 * (Заголовки/цены/тарифы/кейсы лендингов — в полных редакторах /admin/content/[landing].)
 */
export default function ContentForm({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [c, setC] = useState<SiteContent>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Не удалось сохранить");
      setStatus("ok");
      setMessage("Сохранено. Изменения уже на страницах.");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Ошибка сети");
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Видео «Спасибо» (embed-ссылка)</legend>
        <p className={styles.hint}>
          Ссылка вида <code>https://kinescope.io/embed/…</code> или{" "}
          <code>https://www.youtube.com/embed/…</code>. Пусто — слот-заготовка.
        </p>
        <input
          value={c.video.spasibo}
          onChange={(e) => setC((p) => ({ ...p, video: { ...p.video, spasibo: e.target.value } }))}
          placeholder="https://…"
        />
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Ссылка на закрытый чат («Спасибо»)</legend>
        <input
          value={c.chatUrl}
          onChange={(e) => setC((p) => ({ ...p, chatUrl: e.target.value }))}
          placeholder="https://t.me/…"
        />
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
          {status === "saving" ? "Сохраняю…" : "Сохранить"}
        </button>
        {message ? (
          <span className={status === "error" ? styles.err : styles.ok}>{message}</span>
        ) : null}
      </div>
    </form>
  );
}
