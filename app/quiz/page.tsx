import type { Metadata } from "next";
import OzonQuiz from "@/components/quiz/OzonQuiz";

export const metadata: Metadata = {
  title: "Найдите свой путь на Ozon за 7 вопросов — Makeunion",
  description:
    "Ответьте на 7 коротких вопросов — и получите персональную рекомендацию от Ромы Райта: с чего начать на Ozon, какой формат обучения подходит именно вам и какие кейсы учеников похожи на вашу ситуацию.",
};

export default function QuizPage() {
  return <OzonQuiz />;
}
