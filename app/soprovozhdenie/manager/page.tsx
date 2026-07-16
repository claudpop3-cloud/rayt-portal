import type { Metadata } from "next";
import SopLanding from "@/components/SopLanding";
import { getSopLanding } from "@/lib/landingContent";
import { sopManagerDefault } from "@/lib/landing/sopManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сопровождение · Менеджер маркетплейсов — Роман Райт",
  description:
    "Профессия менеджера маркетплейсов: практика на реальных магазинах, портфолио и первый клиент по гарантии. Обучает наставник-практик из команды Романа Райта.",
};

// Весь контент лендинга редактируется из админки (/admin/content/sop-manager).
export default async function SopManagerPage() {
  const c = (await getSopLanding("sop-manager")) ?? sopManagerDefault;
  return <SopLanding c={c} />;
}
