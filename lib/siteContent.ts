import "server-only";
import { kvGet, kvSet } from "./store";

/**
 * Редактируемые настройки контента страниц (без кода, через админку /admin/content).
 * v2: видео, цены сопровождения, тарифы курсов, hero-заголовки/подзаголовки 4 лендингов,
 * ссылка на чат. Хранилище через lib/store.ts (Redis на проде / файл локально),
 * значения мёрджатся поверх DEFAULTS. Пустая строка в override = «взять значение из кода».
 */

const KEY = "site-content";

export interface PriceBlock {
  priceNow: string;
  priceOld: string;
  installment: string;
}
export interface HeroOverride {
  /** Заголовок. Подсветка слова: обернуть в **звёздочки**. Пусто = из кода. */
  title: string;
  /** Подзаголовок. Пусто = из кода. */
  lead: string;
}
export interface TariffPrice {
  price: string;
  installment: string;
}
export interface CourseTariffs {
  tariffs: [TariffPrice, TariffPrice, TariffPrice];
}

export interface SiteContent {
  video: { sopSeller: string; sopManager: string; spasibo: string };
  sopSeller: PriceBlock;
  sopManager: PriceBlock;
  courseSeller: CourseTariffs;
  courseManager: CourseTariffs;
  heroes: {
    sopSeller: HeroOverride;
    sopManager: HeroOverride;
    courseSeller: HeroOverride;
    courseManager: HeroOverride;
  };
  chatUrl: string;
}

const EMPTY_HERO: HeroOverride = { title: "", lead: "" };

/** Значения по умолчанию (совпадают с исходным кодом). */
export const DEFAULTS: SiteContent = {
  video: { sopSeller: "", sopManager: "", spasibo: "" },
  sopSeller: {
    priceNow: "149 000 ₽",
    priceOld: "256 000 ₽",
    installment: "рассрочка от 24 833 ₽/мес",
  },
  sopManager: {
    priceNow: "98 000 ₽",
    priceOld: "196 000 ₽",
    installment: "рассрочка доступна",
  },
  courseSeller: {
    tariffs: [
      { price: "45 000 ₽", installment: "рассрочка от 3 750 ₽/мес" },
      { price: "60 000 ₽", installment: "" },
      { price: "149 000 ₽", installment: "рассрочка 24 833 ₽/мес" },
    ],
  },
  courseManager: {
    tariffs: [
      { price: "54 000 ₽", installment: "рассрочка от 4 500 ₽/мес" },
      { price: "68 000 ₽", installment: "" },
      { price: "98 000 ₽", installment: "" },
    ],
  },
  heroes: {
    sopSeller: { ...EMPTY_HERO },
    sopManager: { ...EMPTY_HERO },
    courseSeller: { ...EMPTY_HERO },
    courseManager: { ...EMPTY_HERO },
  },
  chatUrl: "https://t.me/+stlcQYP39T02ZjQy",
};

function mergeHero(d: HeroOverride, r?: Partial<HeroOverride>): HeroOverride {
  return { title: r?.title ?? d.title, lead: r?.lead ?? d.lead };
}
function mergeTariffs(d: CourseTariffs, r?: Partial<CourseTariffs>): CourseTariffs {
  const rt = r?.tariffs;
  const pick = (i: number): TariffPrice => ({
    price: rt?.[i]?.price ?? d.tariffs[i].price,
    installment: rt?.[i]?.installment ?? d.tariffs[i].installment,
  });
  return { tariffs: [pick(0), pick(1), pick(2)] };
}

function mergeWithDefaults(raw: Partial<SiteContent> | null): SiteContent {
  const r = raw ?? {};
  return {
    video: { ...DEFAULTS.video, ...(r.video ?? {}) },
    sopSeller: { ...DEFAULTS.sopSeller, ...(r.sopSeller ?? {}) },
    sopManager: { ...DEFAULTS.sopManager, ...(r.sopManager ?? {}) },
    courseSeller: mergeTariffs(DEFAULTS.courseSeller, r.courseSeller),
    courseManager: mergeTariffs(DEFAULTS.courseManager, r.courseManager),
    heroes: {
      sopSeller: mergeHero(DEFAULTS.heroes.sopSeller, r.heroes?.sopSeller),
      sopManager: mergeHero(DEFAULTS.heroes.sopManager, r.heroes?.sopManager),
      courseSeller: mergeHero(DEFAULTS.heroes.courseSeller, r.heroes?.courseSeller),
      courseManager: mergeHero(DEFAULTS.heroes.courseManager, r.heroes?.courseManager),
    },
    chatUrl: r.chatUrl ?? DEFAULTS.chatUrl,
  };
}

/** Текущие настройки (хранилище поверх дефолтов). */
export async function getSiteContent(): Promise<SiteContent> {
  const raw = await kvGet<Partial<SiteContent> | null>(KEY, null);
  return mergeWithDefaults(raw);
}

/** Сохранить настройки (полный объект от формы). */
export async function saveSiteContent(patch: Partial<SiteContent>): Promise<SiteContent> {
  const next = mergeWithDefaults({ ...(await getSiteContent()), ...patch });
  await kvSet(KEY, next);
  return next;
}
