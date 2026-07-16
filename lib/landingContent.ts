import "server-only";
import { kvGet, kvSet, kvDel } from "./store";
import type { SopContent } from "@/components/SopLanding";
import type { CourseContent } from "@/components/CourseLanding";
import { sopSellerDefault } from "./landing/sopSeller";
import { sopManagerDefault } from "./landing/sopManager";
import { courseSellerDefault } from "./landing/courseSeller";
import { courseManagerDefault } from "./landing/courseManager";

/**
 * Хранилище ПОЛНОГО контента лендингов (все блоки редактируются из админки).
 * Два типа контента: сопровождение (SopContent) и курсы (CourseContent).
 * Файл data/landing-<id>.json или дефолт из кода. Reset удаляет файл.
 */

export type AnyLandingContent = SopContent | CourseContent;
export type LandingKind = "sop" | "course";

const DEFAULTS: Record<string, AnyLandingContent> = {
  "sop-seller": sopSellerDefault,
  "sop-manager": sopManagerDefault,
  "course-seller": courseSellerDefault,
  "course-manager": courseManagerDefault,
};

export const LANDING_TITLES: Record<string, string> = {
  "sop-seller": "Сопровождение · Селлер",
  "sop-manager": "Сопровождение · Менеджер",
  "course-seller": "Курс · Селлер",
  "course-manager": "Курс · Менеджер",
};

export const LANDING_KIND: Record<string, LandingKind> = {
  "sop-seller": "sop",
  "sop-manager": "sop",
  "course-seller": "course",
  "course-manager": "course",
};

export function landingIds(): string[] {
  return Object.keys(DEFAULTS);
}

export function getLandingDefault(id: string): AnyLandingContent | null {
  return DEFAULTS[id] ?? null;
}

function keyFor(id: string): string {
  return `landing:${id}`;
}

/** Текущий контент лендинга (хранилище или дефолт). null — неизвестный id. */
export async function getLandingContent(id: string): Promise<AnyLandingContent | null> {
  const def = DEFAULTS[id];
  if (!def) return null;
  return kvGet<AnyLandingContent>(keyFor(id), def);
}

/** Типизированные аксессоры для страниц. */
export async function getSopLanding(id: string): Promise<SopContent | null> {
  return (await getLandingContent(id)) as SopContent | null;
}
export async function getCourseLanding(id: string): Promise<CourseContent | null> {
  return (await getLandingContent(id)) as CourseContent | null;
}

export async function saveLandingContent(id: string, content: AnyLandingContent): Promise<void> {
  await kvSet(keyFor(id), content);
}

/** Сбросить к дефолту из кода (удалить запись). */
export async function resetLandingContent(id: string): Promise<void> {
  await kvDel(keyFor(id));
}
