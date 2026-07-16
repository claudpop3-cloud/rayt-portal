import type { ReactNode } from "react";

/**
 * Рендер текста с подсветкой: фрагменты в **звёздочках** оборачиваются в <em>
 * (глобальный стиль em — розово-малиновый градиент). Используется для
 * редактируемых из админки заголовков.
 *   renderMarks("По моей системе **9 из 10** магазинов") → … <em>9 из 10</em> …
 */
export function renderMarks(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>
  );
}
