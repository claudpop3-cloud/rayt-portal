import type { Metadata } from "next";
import CourseLanding from "@/components/CourseLanding";
import { getCourseLanding } from "@/lib/landingContent";
import { courseSellerDefault } from "@/lib/landing/courseSeller";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Курс «Менеджмент прибыли» · Селлер Ozon — Роман Райт",
  description:
    "Авторская система продаж на Ozon: подбор товара по юнит-экономике, реклама в плюс, нейросети в каждом модуле. 9 из 10 магазинов по системе выходят в плюс.",
};

// Весь контент лендинга редактируется из админки (/admin/content/course-seller).
export default async function CourseSellerPage() {
  const c = (await getCourseLanding("course-seller")) ?? courseSellerDefault;
  return <CourseLanding c={c} />;
}
