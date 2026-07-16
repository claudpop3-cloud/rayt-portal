"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteMaterialButton({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (busy) return;
    if (!window.confirm(`Удалить материал «${title}»? Это действие необратимо.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/materials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(json.error ?? "Не удалось удалить");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Ошибка сети");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onDelete}
      disabled={busy}
      title="Удалить материал"
      aria-label={`Удалить материал «${title}»`}
    >
      <Trash2 size={16} />
    </button>
  );
}
