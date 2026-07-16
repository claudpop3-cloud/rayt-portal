import type { Metadata } from "next";
import CourseLanding from "@/components/CourseLanding";
import { getCourseLanding } from "@/lib/landingContent";
import { courseManagerDefault } from "@/lib/landing/courseManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Курс «Менеджер маркетплейсов» Ozon — Роман Райт",
  description:
    "Профессия менеджера маркетплейсов: удалённый доход на Ozon без своего товара. За 2 месяца — с нуля до первого клиента, с гарантией трудоустройства. Нейросети в каждом модуле.",
};

// Весь контент лендинга редактируется из админки (/admin/content/course-manager).
export default async function CourseManagerPage() {
  const c = (await getCourseLanding("course-manager")) ?? courseManagerDefault;
  return <CourseLanding c={c} />;
}
