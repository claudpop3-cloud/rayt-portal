import type { Metadata } from "next";
import SopLanding from "@/components/SopLanding";
import { getSopLanding } from "@/lib/landingContent";
import { sopSellerDefault } from "@/lib/landing/sopSeller";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сопровождение · Селлер — Роман Райт",
  description:
    "Закреплённый за тобой менеджер ведёт твой магазин на Ozon по системе Романа Райта до прибыли. Цифры учеников, честно о рынке, гарантия и работа до результата.",
};

// Весь контент лендинга редактируется из админки (/admin/content/sop-seller).
// Если правок не было — берётся дефолт из кода.
export default async function SopSellerPage() {
  const c = (await getSopLanding("sop-seller")) ?? sopSellerDefault;
  return <SopLanding c={c} />;
}
