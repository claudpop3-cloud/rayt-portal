/**
 * Модель данных каталога.
 * Заложена под последующий перенос в Prisma: те же поля станут колонками таблиц
 * Material и Category. Страницы работают только с этими типами и функциями из
 * lib/materials.ts, поэтому смена хранилища (JSON → БД) их не затронет.
 */

export type MaterialType =
  | "article" // статья
  | "video" // видео
  | "checklist" // чек-лист
  | "razbor" // разбор магазина
  | "post"; // короткий пост

export interface Category {
  slug: string;
  title: string;
}

export interface Material {
  id: string;
  slug: string;
  type: MaterialType;
  title: string;
  description: string;
  /** slug категории (см. Category.slug) */
  category: string;
  /** URL обложки; если пусто — рисуем градиентную заглушку */
  coverUrl?: string;
  /** Ссылка на внешний ресурс ИЛИ внутренний контент */
  contentUrl?: string;
  /** Текст материала (для внутренних статей/чек-листов) */
  body?: string;
  /** Бесплатный ли материал (для будущих промо-блоков / подписки) */
  isFree: boolean;
  /** ISO-дата создания */
  createdAt: string;
}

/** Человекочитаемые названия типов материалов */
export const materialTypeLabels: Record<MaterialType, string> = {
  article: "Статья",
  video: "Видео",
  checklist: "Чек-лист",
  razbor: "Разбор магазина",
  post: "Пост",
};
