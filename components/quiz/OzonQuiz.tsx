"use client";

/* ─────────────────────────────────────────────────────────────────────────
   Точная копия квиза my.makeunion.me/simulators/ozon-quiz.
   Данные (7 вопросов, 6 шкал баллов, ветки, 8 экранов результата), логика
   подсчёта и подбора результата, автопереход 280 мс и сохранение в
   localStorage перенесены 1-в-1 из исходного бандла ffb12b7ac0696140.js.
   Картинки кейсов/логотип/аватар грузятся с живого хоста (визуальный зеркал).
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./ozon-quiz.css";

const ASSET_BASE = "https://my.makeunion.me/simulators/ozon-quiz/assets";
const STORAGE_KEY = "rr_quiz_state";

// id одного прохождения теста (для записи/обновления в админке).
function newRecordId(): string {
  return "q-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

type ScoreKey =
  | "seller_vs_manager"
  | "sop_readiness"
  | "budget"
  | "time_readiness"
  | "fit_with_roma"
  | "experience";
type Score = Partial<Record<ScoreKey, number>>;
type Option = { id: string; label: string; score?: Score };
type BranchKey = "sellerExperienced" | "newcomer" | "entrepreneur";

type Question =
  | { kind: "flat"; id: string; title: string; hint?: string; multi: boolean; options: Option[] }
  | {
      kind: "branched";
      id: string;
      title: string;
      hint?: string;
      multi: boolean;
      branches: Record<BranchKey, string[]>;
      options: Record<BranchKey, Option[]>;
    };

type Answers = Record<string, string | string[]>;

// Надстройка над копией: ИИ-разбор и статусы запросов.
type AiAnalysis = { headline: string; diagnosis: string; why: string[]; firstStep: string; honest: string };
type FetchStatus = "idle" | "loading" | "done" | "error";
type LeadStatus = "idle" | "sending" | "ok" | "error";

// ── 7 вопросов ────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    kind: "flat",
    id: "Q1",
    title: "С чего вы начинаете свой путь на Ozon?",
    hint: "Ответ не запирает вас в треке. Вы сможете выбрать другой путь в конце.",
    multi: false,
    options: [
      { id: "1A", label: "У меня уже есть магазин, хочу улучшить результат", score: { seller_vs_manager: 3, sop_readiness: 2, budget: 2, time_readiness: 2, fit_with_roma: 3, experience: 8 } },
      { id: "1B", label: "Магазина пока нет, хочу открыть свой первый", score: { seller_vs_manager: 3, sop_readiness: 0, budget: 1, time_readiness: 1, fit_with_roma: 3, experience: 0 } },
      { id: "1C", label: "Хочу освоить новую профессию — вести чужие магазины", score: { seller_vs_manager: -4, sop_readiness: 0, budget: 0, time_readiness: 1, fit_with_roma: 3, experience: 0 } },
      { id: "1D", label: "У меня уже есть опыт менеджером — хочу больше клиентов и прокачку", score: { seller_vs_manager: -4, sop_readiness: 3, budget: 0, time_readiness: 2, fit_with_roma: 3, experience: 6 } },
      { id: "1E", label: "Не знаю пока, выбираю между путями", score: { seller_vs_manager: 0, sop_readiness: 0, budget: 0, time_readiness: 0, fit_with_roma: 2, experience: 1 } },
      { id: "1F", label: "У меня действующий бизнес (опт/производство) — хочу добавить Ozon как канал", score: { seller_vs_manager: 4, sop_readiness: 3, budget: 5, time_readiness: 3, fit_with_roma: 3, experience: 5 } },
    ],
  },
  {
    kind: "branched",
    id: "Q2",
    title: "Что лучше описывает вашу ситуацию сейчас?",
    hint: "Помогает понять, подойдёт ли вам курс «с основ» или сразу сопровождение для действующего бизнеса.",
    multi: false,
    branches: {
      sellerExperienced: ["1A", "1D"],
      newcomer: ["1B", "1C", "1E"],
      entrepreneur: ["1F"],
    },
    options: {
      sellerExperienced: [
        { id: "2A1", label: "Работаю меньше 6 месяцев, пока всё нестабильно", score: { sop_readiness: 3, budget: 1, experience: 3, fit_with_roma: 2 } },
        { id: "2A2", label: "Работаю 6–18 месяцев, есть продажи, но прибыль прыгает", score: { sop_readiness: 5, budget: 3, experience: 6, fit_with_roma: 3 } },
        { id: "2A3", label: "Работаю больше 1,5 лет, оборот устаканился, но рост замедлился", score: { sop_readiness: 5, budget: 5, experience: 9, fit_with_roma: 3 } },
        { id: "2A4", label: "Был магазин, но сейчас в минусе / заморозил", score: { sop_readiness: 3, budget: 0, experience: 4, fit_with_roma: 0 } },
      ],
      newcomer: [
        { id: "2B1", label: "Только изучаю тему, смотрю видео", score: { sop_readiness: 0, budget: 0, experience: 0, fit_with_roma: 1 } },
        { id: "2B2", label: "Работаю в найме, мечтаю о своём", score: { sop_readiness: 0, budget: 2, experience: 1, fit_with_roma: 2 } },
        { id: "2B3", label: "В декрете / не работаю, ищу удалёнку", score: { sop_readiness: 0, budget: 1, experience: 0, fit_with_roma: 3 } },
        { id: "2B4", label: "Уже пробовал самостоятельно — не пошло", score: { sop_readiness: 0, budget: 2, experience: 2, fit_with_roma: 2 } },
      ],
      entrepreneur: [
        { id: "2F1", label: "У меня производство своё", score: { budget: 8, experience: 8, fit_with_roma: 3 } },
        { id: "2F2", label: "Занимаюсь оптом, есть склад и товары", score: { budget: 8, experience: 7, fit_with_roma: 3 } },
        { id: "2F3", label: "Продаю на других МП, хочу добавить Ozon", score: { budget: 6, experience: 6, fit_with_roma: 3 } },
        { id: "2F4", label: "Агентство / B2B услуги, хочу e-com как новое направление", score: { budget: 7, experience: 5, fit_with_roma: 3 } },
      ],
    },
  },
  {
    kind: "flat",
    id: "Q3",
    title: "Что вы хотите получить через 3–6 месяцев?",
    hint: "Можно выбрать то, что ближе всего, даже если формулировка не на 100% ваша.",
    multi: false,
    options: [
      { id: "3A", label: "Свой магазин с прибылью 100–300К/мес", score: { seller_vs_manager: 3, sop_readiness: 2, budget: 3, time_readiness: 2, fit_with_roma: 3 } },
      { id: "3B", label: "Масштабирование существующего магазина до 1–5 млн оборота", score: { seller_vs_manager: 3, sop_readiness: 5, budget: 5, time_readiness: 2, fit_with_roma: 3, experience: 3 } },
      { id: "3C", label: "Первого клиента-селлера за менеджерскую работу", score: { seller_vs_manager: -4, sop_readiness: 2, time_readiness: 2, fit_with_roma: 3 } },
      { id: "3D", label: "Поток стабильных клиентов (2–4) как менеджер", score: { seller_vs_manager: -4, sop_readiness: 3, time_readiness: 2, fit_with_roma: 3, experience: 3 } },
      { id: "3E", label: "Систему: юнитка, реклама, подбор — чтобы «не на ощупь»", score: { seller_vs_manager: 1, sop_readiness: 4, budget: 2, time_readiness: 1, fit_with_roma: 4, experience: 2 } },
      { id: "3F", label: "Ещё не решил, хочу разобраться «что где»", score: { fit_with_roma: 1 } },
    ],
  },
  {
    kind: "flat",
    id: "Q4",
    title: "Что у вас есть из этого списка прямо сейчас?",
    hint: "Можно выбрать несколько. Нужно для того, чтобы не предлагать вам то, что сейчас нереалистично.",
    multi: true,
    options: [
      { id: "4A", label: "От 100 000 ₽ свободных (на товар или обучение)", score: { sop_readiness: 2, budget: 4, time_readiness: 1, fit_with_roma: 1 } },
      { id: "4B", label: "50 000 – 100 000 ₽ свободных", score: { sop_readiness: 1, budget: 2 } },
      { id: "4C", label: "Меньше 50 000 ₽, рассчитываю на рассрочку", score: { time_readiness: 1 } },
      { id: "4D", label: "10+ часов в неделю на обучение и работу", score: { sop_readiness: 2, budget: 1, time_readiness: 3, fit_with_roma: 2 } },
      { id: "4E", label: "Собственное производство или опт (физический товар на складе)", score: { sop_readiness: 5, budget: 5, time_readiness: 2, fit_with_roma: 2, experience: 5 } },
      { id: "4F", label: "Действующий магазин с оборотом", score: { seller_vs_manager: 2, sop_readiness: 4, budget: 3, time_readiness: 1, fit_with_roma: 2, experience: 5 } },
      { id: "4G", label: "Насмотрено видео Ромы и других — в теории подготовлен", score: { fit_with_roma: 1, experience: 1 } },
      { id: "4H", label: "Пока ничего из этого", score: { sop_readiness: -2, budget: -3, fit_with_roma: -1 } },
    ],
  },
  {
    kind: "flat",
    id: "Q5",
    title: "Что больше всего останавливает от решения прямо сейчас?",
    hint: "Это не тест с «правильным ответом» — мы пытаемся понять, что вас реально беспокоит.",
    multi: false,
    options: [
      { id: "5A", label: "Боюсь потратить деньги и не получить результат", score: { sop_readiness: 1, fit_with_roma: 2 } },
      { id: "5B", label: "Не справлюсь с нагрузкой/домашкой", score: { fit_with_roma: 1 } },
      { id: "5C", label: "Не уверен, что мне подходит этот формат обучения", score: { fit_with_roma: 2 } },
      { id: "5D", label: "Цена высокая для меня сейчас", score: { fit_with_roma: 1 } },
      { id: "5E", label: "Уже проходил другие курсы, ничего не дало", score: { sop_readiness: 2, fit_with_roma: 2, experience: 2 } },
      { id: "5F", label: "Нет — готов двигаться, просто выбираю формат", score: { sop_readiness: 3, time_readiness: 1, fit_with_roma: 3 } },
      { id: "5G", label: "У меня нет денег / времени / возможностей вообще", score: { budget: -2, fit_with_roma: -5 } },
    ],
  },
  {
    kind: "flat",
    id: "Q6",
    title: "Когда планируете реально стартовать обучение?",
    hint: "Честный ответ помогает нам правильно завершить: если вам пока рано — мы не будем продавать.",
    multi: false,
    options: [
      { id: "6A", label: "Готов оплатить и начать в ближайшие 7 дней", score: { sop_readiness: 5, budget: 3, time_readiness: 10, fit_with_roma: 3 } },
      { id: "6B", label: "В течение месяца", score: { sop_readiness: 3, budget: 1, time_readiness: 7, fit_with_roma: 2 } },
      { id: "6C", label: "Планирую в ближайшие 2–3 месяца", score: { sop_readiness: 1, time_readiness: 3, fit_with_roma: 1 } },
      { id: "6D", label: "Пока просто изучаю, решения нет", score: { fit_with_roma: 1 } },
      { id: "6E", label: "Никаких планов, пришёл из любопытства", score: { time_readiness: -3 } },
    ],
  },
  {
    kind: "flat",
    id: "Q7",
    title: "Что из этого для вас важнее всего?",
    hint: "Формулируем ответ, который покажет наш сильный пункт в вашей области.",
    multi: false,
    options: [
      { id: "7A", label: "Чтобы каждое моё решение кто-то проверял лично", score: {} },
      { id: "7B", label: "Пошаговая понятная дорожная карта", score: {} },
      { id: "7C", label: "Гарантия, что не потрачу деньги зря", score: {} },
      { id: "7D", label: "Возможность общаться с другими учениками", score: {} },
      { id: "7E", label: "Реальные кейсы, не теория", score: {} },
    ],
  },
];

// ── Экраны результата ───────────────────────────────────────────────────────
type CaseFigure = { src: string; caption?: string; wide?: boolean };
type HybridPath = {
  name: string;
  desc: string;
  budget: string;
  firstMoney: string;
  potential: string;
  product: string;
  caseLabel: string;
  href: string;
  resultId: string;
};
type Freebie = { title: string; href: string; tag: string };
type Offer = { name: string; price: string; installment: string; includes: string[] };
type Cta = {
  primary: string;
  href?: string;
  restart?: boolean;
  alt?: string | null;
  altHref?: string;
  altResult?: string;
};
type ResultScreen = {
  badge: string;
  title: string;
  subtitle: string;
  romaMessage?: string;
  caseTitle?: string;
  caseAvatar?: string;
  caseHero?: CaseFigure;
  caseVideo?: CaseFigure;
  caseGallery?: CaseFigure[];
  caseBefore?: string;
  caseQuote?: string;
  caseMetrics?: [string, string][];
  isHybrid?: boolean;
  hybridPaths?: HybridPath[];
  isNotFit?: boolean;
  freebies?: Freebie[];
  offer?: Offer;
  cta: Cta;
};

const RESULTS: Record<string, ResultScreen> = {
  R1_seller_sop: {
    badge: "Ваш путь: сопровождение селлер",
    title: "Судя по ответам — у вас уже есть магазин, и вам может быть полезна вторая пара глаз на ваши решения.",
    subtitle: "На этом этапе курс «с основ» скорее всего будет избыточным. Чаще помогает работа 1 на 1 с менеджером и разборы подбора с Ромой. Это Сопровождение селлер — 2,5 месяца, с гарантией возврата и работой до результата.",
    romaMessage: "Привет. Судя по ответам, вы уже действующий селлер — есть продажи, есть опыт. Часто на этом этапе мешает не нехватка знаний, а отсутствие человека, с которым можно сверяться по решениям. Именно это мы стараемся дать в сопровождении.",
    caseTitle: "Иван Королёв, Пенза, селлер с 3-летним опытом",
    caseAvatar: `${ASSET_BASE}/cases/r1-avatar.jpg`,
    caseHero: { src: `${ASSET_BASE}/cases/r1-hero.jpg`, caption: "Сентябрь 2025: оборот 2 107 497 ₽, ДРР 12,97%" },
    caseVideo: { src: "https://kinescope.io/embed/0Hp7mNJAo8xA5zXSsycP4c", caption: "Видеоотзыв Ивана Королёва — 5:39" },
    caseGallery: [
      { src: `${ASSET_BASE}/cases/r1-g1.jpg`, caption: "Август: 1 683 412 ₽, ДРР 16,42%" },
      { src: `${ASSET_BASE}/cases/r1-g2.jpg`, caption: "Отчёт по товарам" },
    ],
    caseBefore: "До сопровождения: менял категорию, страх неудач.",
    caseQuote: "«Это не инфоцыганщина — это реально работающий курс. Нужно именно работать, не отлынивать»",
    caseMetrics: [["Оборот август", "1 683 412 ₽"], ["Оборот сентябрь", "2 107 497 ₽"], ["ДРР", "12,97%"]],
    offer: {
      name: "Сопровождение селлер",
      price: "149 000 ₽",
      installment: "24 833 ₽/мес в рассрочку",
      includes: ["Курс + персональная работа с менеджером", "Рабочий чат с закреплённым менеджером и ежедневная проверка ДЗ", "Разбор подобранных товаров с менеджером", "Ежемесячные созвоны", "Гарантия 7 дней + работа до результата"],
    },
    cta: { primary: "Записаться в поток", href: "/soprovozhdenie/seller", alt: "Мне пока достаточно курса без сопровождения", altHref: "/kursy/seller" },
  },
  R2_seller_course: {
    badge: "Ваш путь: курс",
    title: "Судя по ответам — вам ближе путь самостоятельного запуска с понятной структурой.",
    subtitle: "Сопровождение сейчас может быть избыточным. Курс даёт 10 модулей: от юнит-экономики до рекламы и масштабирования. Если по ходу поймёте, что нужна персональная работа — в первые 2 недели можно перейти на сопровождение за доплату.",
    romaMessage: "Привет. По ответам вижу: вам нужна система, но пока не готовы идти в сопровождение — и это нормально. Курс даёт структуру: юнит-экономика, подбор, реклама, масштабирование. Этого часто хватает, чтобы самостоятельно запустить первый магазин.",
    caseTitle: "Владимир Непутаев, бывший наёмный работник",
    caseHero: { src: `${ASSET_BASE}/cases/r2-hero.jpg`, caption: "Таймлайн: 60К на товар → 400К чистыми" },
    caseGallery: [
      { src: `${ASSET_BASE}/cases/r2-g1.jpg`, caption: "«Стартовал с маленького бюджета, 40к обучение + 60к товары»" },
      { src: `${ASSET_BASE}/cases/r2-g2.jpg`, caption: "Обратная связь: благодарность и критика эфиров" },
    ],
    caseBefore: "До: работа 5/2, думал о своём магазине.",
    caseQuote: "«Смотрел видосики на ютубе. Казалось по полочкам. Оплатил 40к за курс, 60к на товары»",
    caseMetrics: [["Общий старт", "100 000 ₽"], ["Через 5 мес", "400 000 ₽ чистыми"]],
    offer: {
      name: "Курс «Менеджмент прибыли»",
      price: "от 45 000 ₽",
      installment: "7 500 ₽/мес в рассрочку на 6 мес",
      includes: ["10 модулей и более 50 полноценных уроков", "Закрытый чат учеников на 1 500 человек", "Обновления раз в 4 месяца", "7 дней гарантия полного возврата", "Апгрейд до сопровождения: +104 000 ₽ в первые 2 недели"],
    },
    cta: { primary: "Забрать курс", href: "/kursy/seller", alt: "Хочу сразу сопровождение", altHref: "/soprovozhdenie/seller" },
  },
  R3_manager_sop: {
    badge: "Ваш путь: сопровождение менеджер",
    title: "Судя по ответам — вам может подойти путь менеджера: работа удалённо с гарантией первого клиента.",
    subtitle: "Если за 2,5 месяца мы не поможем найти первого клиента — возвращаем деньги. Вы получаете программу, персонального менеджера и доступ в базу Yoolip.",
    romaMessage: "Привет. По ответам похоже, что менеджерский трек вам ближе — особенно если не хочется замораживать деньги в товаре. У нас есть гарантия первого клиента: не получится за 2,5 месяца — вернём деньги.",
    caseTitle: "Виктория Иванова, после декрета",
    caseHero: { src: `${ASSET_BASE}/cases/r3-hero.jpg`, caption: "Магазин клиента, март 2026: оборот 2 199 889 ₽, ДРР 10,95%" },
    caseGallery: [
      { src: `${ASSET_BASE}/cases/r3-g2.jpg`, caption: "«Ребята, у меня получилось. Я с клиентом»" },
      { src: `${ASSET_BASE}/cases/r3-g1.jpg`, caption: "История: из декрета в менеджеры" },
      { src: `${ASSET_BASE}/cases/r3-g3.jpg`, caption: "Первый товар клиента: алмазные фрезы" },
    ],
    caseBefore: "До: пришла в декрете, без практического опыта с МП. Сильная неуверенность и страх «сделать что-то не так».",
    caseQuote: "«Ребята, у меня получилось) Я с клиентом. Работы много. Он уже предлагает возможности роста»",
    caseMetrics: [["Первый клиент", "через 2 мес"], ["Оборот магазина", "2 199 889 ₽"], ["ДРР", "10,95%"]],
    offer: {
      name: "Сопровождение менеджер",
      price: "98 000 ₽",
      installment: "16 333 ₽/мес в рассрочку",
      includes: ["Курс + персональная работа с менеджером", "Рабочий чат с закреплённым менеджером и ежедневная проверка ДЗ", "Разбор подобранных товаров с менеджером", "Ежемесячные созвоны", "Гарантия 7 дней + работа до результата", "Гарантия первого клиента или возврат денег", "Попадание в базу Yoolip"],
    },
    cta: { primary: "Записаться в поток", href: "/soprovozhdenie/manager", alt: "Хочу пока курс, без сопровождения", altHref: "/kursy/manager" },
  },
  R4_manager_course: {
    badge: "Ваш путь: курс менеджер",
    title: "Для старта в менеджеры вам может подойти курс — без гарантии клиента, но дешевле.",
    subtitle: "Если хотите пройти программу самостоятельно — курс даёт структуру знаний. Клиентов искать будете сами (или перейти на сопровождение в первые 2 недели).",
    romaMessage: "По ответам похоже, что вам интересен менеджерский трек, но пока не готовы к полной программе сопровождения. Курс даёт знания, но без гарантии клиента. Подойдёт, если готовы сами искать первых клиентов или у вас уже есть контакты.",
    caseTitle: "Евгений Редькин",
    caseAvatar: `${ASSET_BASE}/cases/r4-avatar.jpg`,
    caseVideo: { src: "https://kinescope.io/embed/6zxAnt3GVYRg5z8oB63gWc", caption: "Видеоотзыв Евгения Редькина" },
    caseBefore: "Прошёл менеджерский трек и рассказывает, как это было и что получил.",
    offer: {
      name: "Курс «Менеджер Ozon»",
      price: "от 54 000 ₽",
      installment: "9 000 ₽/мес в рассрочку на 6 мес",
      includes: ["Модули по управлению магазинами", "Подбор + карточки + реклама + аналитика", "Апгрейд до сопровождения: +44 000 ₽ в первые 2 недели"],
    },
    cta: { primary: "Забрать курс", href: "/kursy/manager", alt: "Хочу сразу сопровождение с гарантией клиента", altHref: "/soprovozhdenie/manager" },
  },
  R5_hidden_seller: {
    badge: "Ваш путь: курс селлер",
    title: "Судя по ответам — у вас уже есть свой магазин или планы на него. Для этого подходит курс селлер, а не менеджерский.",
    subtitle: "Менеджерский трек заточен под работу на чужие магазины. Если у вас есть или планируется свой — вам нужен курс селлер: он даёт структуру работы со своим магазином, юнит-экономику, рекламу и аналитику.",
    romaMessage: "Привет. По ответам видно — у вас есть свой магазин или планы на него. Это значит, что менеджерский трек вам не нужен — он про работу на чужие магазины. Забирайте курс селлер.",
    caseTitle: "Иван Королёв, Пенза, селлер с 3-летним опытом",
    caseAvatar: `${ASSET_BASE}/cases/r1-avatar.jpg`,
    caseHero: { src: `${ASSET_BASE}/cases/r1-hero.jpg`, caption: "Сентябрь 2025: оборот 2 107 497 ₽, ДРР 12,97%" },
    caseVideo: { src: "https://kinescope.io/embed/0Hp7mNJAo8xA5zXSsycP4c", caption: "Видеоотзыв Ивана Королёва — 5:39" },
    caseGallery: [
      { src: `${ASSET_BASE}/cases/r1-g1.jpg`, caption: "Август: 1 683 412 ₽, ДРР 16,42%" },
      { src: `${ASSET_BASE}/cases/r1-g2.jpg`, caption: "Отчёт по товарам" },
    ],
    caseBefore: "До сопровождения: менял категорию, страх неудач.",
    caseQuote: "«Это не инфоцыганщина — это реально работающий курс. Нужно именно работать, не отлынивать»",
    caseMetrics: [["Оборот август", "1 683 412 ₽"], ["Оборот сентябрь", "2 107 497 ₽"], ["ДРР", "12,97%"]],
    offer: {
      name: "Курс «Менеджмент прибыли»",
      price: "от 45 000 ₽",
      installment: "7 500 ₽/мес в рассрочку на 6 мес",
      includes: ["10 модулей и более 50 полноценных уроков", "Закрытый чат учеников на 1 500 человек", "Обновления раз в 4 месяца", "7 дней гарантия полного возврата", "Апгрейд до сопровождения: +104 000 ₽ в первые 2 недели"],
    },
    cta: { primary: "Забрать курс", href: "/kursy/seller", alt: "Всё равно хочу менеджерский трек", altResult: "R4_manager_course" },
  },
  R6_entrepreneur: {
    badge: "Ваш путь: сопровождение (селлер)",
    title: "У вас уже есть бизнес и товар. Скорее всего, «курс с основ» будет избыточным — нужна настройка Ozon под ваш опт или производство.",
    subtitle: "Это Сопровождение селлер + личная работа с Ромой по вашей нише: адаптация юнит-экономики под опт, B2B-оптика, масштабирование.",
    romaMessage: "По ответам — у вас уже есть товар и понимание бизнеса, поэтому начинать «с нуля» не нужно. Мы помогаем адаптировать Ozon как канал под ваш конкретный опт или производство. Вас ведёт закреплённый менеджер из моей команды, который сам работает с такими магазинами.",
    caseTitle: "Алексей Морковкин, автозапчасти, оптовик",
    caseHero: { src: `${ASSET_BASE}/cases/r6-hero.jpg`, caption: "371 товар, оборот 545 430 ₽, маржа 13,5%, ROI 97,4%" },
    caseGallery: [
      { src: `${ASSET_BASE}/cases/r6-g1.jpg`, caption: "Диалог про оптимизацию НДС и Ozon как канал", wide: true },
    ],
    caseBefore: "Выкупает банкротные активы, 1500 кв.м склад, 14 000 SKU. Главная сложность: нежелание переходить на детальную юнит-экономику.",
    caseQuote: "«НДС — очень дорогое дело, до НГ было 17%. Для оптимизации НДС Ozon подходит идеально»",
    caseMetrics: [["Оборот за 2 мес", "545 430 ₽"], ["Маржа", "13,5%"], ["ROI", "97,4%"], ["Чистая прибыль", "73 771 ₽"]],
    offer: {
      name: "Сопровождение селлер",
      price: "149 000 ₽",
      installment: "24 833 ₽/мес в рассрочку",
      includes: ["Курс + персональная работа с менеджером", "Рабочий чат с закреплённым менеджером и ежедневная проверка ДЗ", "Разбор подобранных товаров с менеджером", "Ежемесячные созвоны", "Адаптация юнит-экономики под ваш опт", "Гарантия 7 дней + работа до результата"],
    },
    cta: { primary: "Записаться на консультацию с менеджером", href: "/soprovozhdenie/seller", alt: "Мне пока достаточно курса без сопровождения", altHref: "/kursy/seller" },
  },
  R_hybrid: {
    badge: "Развилка",
    title: "По ответам видно, что вы на развилке — давайте разберёмся вместе.",
    subtitle: "Иногда правильный путь — не готовый ответ от теста, а разговор. Мы покажем два варианта и различия между ними. Выберете сами.",
    romaMessage: "Иногда ответы не складываются однозначно — и это нормально. Посмотрите два пути рядом друг с другом, и сами увидите, какой ваш.",
    isHybrid: true,
    hybridPaths: [
      { name: "Путь селлера", desc: "Свой магазин на Ozon", budget: "Бюджет на товар от 100К", firstMoney: "2–4 мес", potential: "300К–2М+/мес через год", product: "Курс (от 45К) или Сопровождение (149К)", caseLabel: "Иван Королёв, 2,1 млн/мес", href: "/kursy/seller", resultId: "R2_seller_course" },
      { name: "Путь менеджера", desc: "Вести чужие магазины удалённо", budget: "Бюджет только на обучение", firstMoney: "2–3 мес до первого клиента", potential: "100К–400К/мес при 3–4 клиентах", product: "Курс «Менеджер» (от 54К) или Сопровождение (98К)", caseLabel: "Виктория Иванова, первый клиент", href: "/kursy/manager", resultId: "R4_manager_course" },
    ],
    cta: { primary: "Записаться на консультацию с менеджером", href: "/soprovozhdenie/seller", alt: null },
  },
  R7_not_fit_now: {
    badge: "Не ваш момент",
    title: "Судя по ответам — сейчас, похоже, не самый удачный момент стартовать с нами. Это не отказ, просто честно.",
    subtitle: "Нам важно, чтобы у вас получилось, поэтому не хотим продавать «на всякий случай». Вот что можно сделать сейчас — бесплатно. Когда будете готовы — мы никуда не денемся.",
    romaMessage: "Привет. По ответам похоже, что сейчас у вас нет ни времени, ни бюджета, ни чёткого намерения. Не хочу продавать вам курс — в таких условиях чаще не работает. Лучше берите бесплатно то, что уже есть.",
    isNotFit: true,
    freebies: [
      { title: "На YouTube-канале Ромы — бесплатные гайды", href: "https://www.youtube.com/@raytcreate", tag: "YouTube" },
      { title: "Telegram-канал Ромы — новые кейсы и апдейты рынка", href: "https://telegram.me/raytcreate", tag: "Telegram" },
    ],
    cta: { primary: "Вернуться к тесту", restart: true, alt: null },
  },
};

// ── Подбор вариантов Q2 по ветке (от ответа на Q1) ─────────────────────────
function optionsFor(question: Question, answers: Answers): Option[] {
  if (question.kind === "flat") return question.options;
  const q1 = answers.Q1 as string | undefined;
  if (!q1) return question.options.newcomer;
  if (question.branches.sellerExperienced.includes(q1)) return question.options.sellerExperienced;
  if (question.branches.entrepreneur.includes(q1)) return question.options.entrepreneur;
  return question.options.newcomer;
}

// ── Подсчёт баллов и выбор результата (1-в-1 из бандла) ─────────────────────
function computeResult(answers: Answers): { id: string; scores: Record<ScoreKey, number> } {
  const scores: Record<ScoreKey, number> = {
    seller_vs_manager: 0,
    sop_readiness: 0,
    budget: 0,
    time_readiness: 0,
    fit_with_roma: 0,
    experience: 0,
  };

  const picks: { qid: string; optId: string }[] = [];
  Object.entries(answers).forEach(([qid, val]) => {
    (Array.isArray(val) ? val : [val]).forEach((optId) => picks.push({ qid, optId }));
  });

  const optMap: Record<string, Option> = {};
  QUESTIONS.forEach((q) => {
    if (q.kind === "branched") {
      Object.values(q.options).forEach((arr) => arr.forEach((o) => (optMap[o.id] = o)));
    } else {
      q.options.forEach((o) => (optMap[o.id] = o));
    }
  });

  picks.forEach(({ optId }) => {
    const opt = optMap[optId];
    if (opt) {
      Object.entries(opt.score || {}).forEach(([k, v]) => {
        scores[k as ScoreKey] = (scores[k as ScoreKey] || 0) + (v as number);
      });
    }
  });

  const has = (qid: string, optId: string) => {
    const r = answers[qid];
    return !!r && (Array.isArray(r) ? r.includes(optId) : r === optId);
  };

  if (has("Q1", "1C") && has("Q4", "4F")) return { id: "R5_hidden_seller", scores };
  if ((has("Q5", "5G") && (has("Q6", "6D") || has("Q6", "6E"))) || scores.fit_with_roma < 0)
    return { id: "R7_not_fit_now", scores };
  if (has("Q1", "1F") && has("Q4", "4E")) return { id: "R6_entrepreneur", scores };
  if (has("Q1", "1C") && has("Q2", "2B3")) return { id: "R3_manager_sop", scores };

  const seller = scores.seller_vs_manager > 2;
  const manager = scores.seller_vs_manager < -2;
  const sopReady = scores.sop_readiness > 5 && scores.budget > 3;

  if (seller && sopReady) return { id: "R1_seller_sop", scores };
  if (seller && !sopReady) return { id: "R2_seller_course", scores };
  if (manager && sopReady) return { id: "R3_manager_sop", scores };
  if (manager && !sopReady) return { id: "R4_manager_course", scores };
  return { id: "R_hybrid", scores };
}

// Ответы в читаемом виде для ИИ и для заявки: { «текст вопроса»: «текст ответа» }.
function readableAnswers(answers: Answers): Record<string, string> {
  const out: Record<string, string> = {};
  QUESTIONS.forEach((q) => {
    const val = answers[q.id];
    if (val == null) return;
    const opts = optionsFor(q, answers);
    const labelOf = (id: string) => opts.find((o) => o.id === id)?.label ?? id;
    out[q.title] = Array.isArray(val) ? val.map(labelOf).join(", ") : labelOf(val);
  });
  return out;
}

// ── Экраны ──────────────────────────────────────────────────────────────────
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro">
      <div className="intro-badge">
        <img src={`${ASSET_BASE}/roma-avatar.png`} alt="Рома Райт" />
        Персональный разбор от Ромы Райта
      </div>
      <h1>
        Найдите свой путь <em>на Ozon</em> за 7 вопросов
      </h1>
      <p>
        После прохождения теста мы покажем вам путь, который подходит именно вашей ситуации. Даже
        если это будет честное «приходите позже».
      </p>
      <button className="btn btn-primary large" style={{ maxWidth: 280, margin: "0 auto" }} onClick={onStart}>
        Начать тест →
      </button>
      <div className="intro-meta">
        <div>
          ⏱ <b>3–4 минуты</b>
        </div>
        <div>
          ❓ <b>7 вопросов</b>
        </div>
        <div>
          🎯 <b>Персональная рекомендация</b>
        </div>
      </div>
    </div>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="progress-row">
      {Array.from({ length: total }).map((_, r) => (
        <div key={r} className={"progress-cell " + (r < current ? "done" : r === current ? "active" : "")} />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  options,
  answer,
  onAnswer,
  onNext,
  onBack,
  qIndex,
  total,
}: {
  question: Question;
  options: Option[];
  answer: string | string[] | undefined;
  onAnswer: (v: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  qIndex: number;
  total: number;
}) {
  const multi = question.multi;
  const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const canNext = multi ? selected.length > 0 : !!answer;

  return (
    <div className="q-card" key={question.id}>
      <div className="q-kicker">
        Вопрос {qIndex + 1} из {total}
      </div>
      <h1 className="q-title">{question.title}</h1>
      {question.hint && <p className="q-hint">{question.hint}</p>}
      <div className="opts">
        {options.map((o) => (
          <button
            key={o.id}
            className={"opt " + (selected.includes(o.id) ? "selected" : "")}
            onClick={() => {
              if (multi) {
                onAnswer(selected.includes(o.id) ? selected.filter((x) => x !== o.id) : [...selected, o.id]);
              } else {
                onAnswer(o.id);
                setTimeout(() => onNext(), 280);
              }
            }}
          >
            <span className={"opt-marker " + (multi ? "square" : "")} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <div className="q-nav">
        <button
          className="btn btn-ghost"
          onClick={onBack}
          disabled={qIndex === 0}
          style={{ visibility: qIndex === 0 ? "hidden" : "visible" }}
        >
          ← Назад
        </button>
        <div className="q-counter">
          {qIndex + 1} / {total}
        </div>
        {multi ? (
          <button className="btn btn-primary" onClick={onNext} disabled={!canNext}>
            Далее →
          </button>
        ) : (
          <div style={{ width: 120 }} />
        )}
      </div>
    </div>
  );
}

function Result({
  resultId,
  onRestart,
  onSwitch,
  aiSlot,
  leadSlot,
}: {
  resultId: string;
  answers: Answers;
  onRestart: () => void;
  onSwitch: (id: string) => void;
  aiSlot?: ReactNode;
  leadSlot?: ReactNode;
}) {
  const r = RESULTS[resultId];
  if (!r) return null;

  return (
    <div className="result">
      <div className="result-badge">{r.badge}</div>
      <h1>{r.title}</h1>
      <p className="result-sub">{r.subtitle}</p>

      {aiSlot}

      {r.romaMessage && (
        <div className="roma-block">
          <div className="roma-avatar">
            <img src={`${ASSET_BASE}/roma-avatar.png`} alt="Рома Райт" />
          </div>
          <div>
            <div className="roma-name">Рома Райт</div>
            <div className="roma-text">{r.romaMessage}</div>
          </div>
        </div>
      )}

      {r.caseTitle && (
        <div className="case-card">
          <div className="case-head">
            {r.caseAvatar && (
              <div className="case-avatar">
                <img src={r.caseAvatar} alt={r.caseTitle} />
              </div>
            )}
            <h3>{r.caseTitle}</h3>
          </div>
          {r.caseBefore && <p className="case-before">{r.caseBefore}</p>}
          {r.caseQuote && <p className="case-quote">{r.caseQuote}</p>}
          {r.caseMetrics && (
            <div className="case-metrics">
              {r.caseMetrics.map(([label, value], i) => (
                <div key={i}>
                  <div className="case-metric-label">{label}</div>
                  <div className="case-metric-value">{value}</div>
                </div>
              ))}
            </div>
          )}
          {r.caseHero && (
            <figure className="case-hero">
              <img src={r.caseHero.src} alt={r.caseHero.caption || ""} loading="lazy" />
              {r.caseHero.caption && <figcaption>{r.caseHero.caption}</figcaption>}
            </figure>
          )}
          {r.caseVideo && (
            <figure className="case-video">
              <div className="case-video-frame">
                <iframe
                  src={r.caseVideo.src}
                  title={r.caseVideo.caption || "Видеоотзыв"}
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
              {r.caseVideo.caption && <figcaption>{r.caseVideo.caption}</figcaption>}
            </figure>
          )}
          {r.caseGallery && r.caseGallery.length > 0 && (
            <div className="case-gallery">
              {r.caseGallery.map((g, i) => (
                <figure key={i} className={"case-thumb" + (g.wide ? " case-thumb-wide" : "")}>
                  <img src={g.src} alt={g.caption || ""} loading="lazy" />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      )}

      {r.isHybrid && r.hybridPaths && (
        <div className="hybrid-grid">
          {r.hybridPaths.map((p, i) => (
            <div key={i} className="hybrid-path">
              <h3>{p.name}</h3>
              <div className="hybrid-row">
                <span>Что</span>
                <span>{p.desc}</span>
              </div>
              <div className="hybrid-row">
                <span>Бюджет</span>
                <span>{p.budget}</span>
              </div>
              <div className="hybrid-row">
                <span>Первые деньги</span>
                <span>{p.firstMoney}</span>
              </div>
              <div className="hybrid-row">
                <span>Потенциал</span>
                <span>{p.potential}</span>
              </div>
              <div className="hybrid-row">
                <span>Продукт</span>
                <span>{p.product}</span>
              </div>
              <div className="hybrid-row">
                <span>Кейс</span>
                <span>{p.caseLabel}</span>
              </div>
              <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => onSwitch(p.resultId)}>
                Смотреть подробнее
              </button>
            </div>
          ))}
        </div>
      )}

      {r.isNotFit && r.freebies && (
        <div className="freebies">
          {r.freebies.map((f, i) => (
            <a key={i} className="freebie" href={f.href} target="_blank" rel="noreferrer">
              <span className="freebie-title">{f.title}</span>
              <span className="freebie-tag">{f.tag}</span>
            </a>
          ))}
        </div>
      )}

      {r.offer && (
        <div className="offer-card">
          <div className="offer-name">{r.offer.name}</div>
          <div className="offer-price">{r.offer.price}</div>
          <div className="offer-installment">{r.offer.installment}</div>
          <ul className="offer-includes">
            {r.offer.includes.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      )}

      {leadSlot}

      <div className="cta-row">
        {r.cta.restart ? (
          <button className="btn btn-primary large" onClick={onRestart} style={{ textAlign: "center" }}>
            {r.cta.primary}
          </button>
        ) : (
          <a
            className="btn btn-primary large"
            href={r.cta.href}
            target={r.cta.href && r.cta.href.startsWith("http") ? "_blank" : undefined}
            rel={r.cta.href && r.cta.href.startsWith("http") ? "noreferrer" : undefined}
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            {r.cta.primary}
          </a>
        )}
        {r.cta.alt && r.cta.altHref && (
          <a
            className="btn btn-outline"
            href={r.cta.altHref}
            target={r.cta.altHref.startsWith("http") ? "_blank" : undefined}
            rel={r.cta.altHref.startsWith("http") ? "noreferrer" : undefined}
            style={{ textDecoration: "none", textAlign: "center" }}
          >
            {r.cta.alt}
          </a>
        )}
        {r.cta.alt && !r.cta.altHref && r.cta.altResult && (
          <button className="btn btn-outline" onClick={() => onSwitch(r.cta.altResult!)}>
            {r.cta.alt}
          </button>
        )}
        <button className="btn btn-ghost" onClick={onRestart}>
          ← Пройти тест заново
        </button>
      </div>
    </div>
  );
}

// ── Шаг «Опишите ситуацию» (надстройка перед результатом) ────────────────────
function SituationCard({
  value,
  onChange,
  onSubmit,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="q-card">
      <div className="q-kicker">Последний шаг</div>
      <h1 className="q-title">Опишите вашу ситуацию своими словами</h1>
      <p className="q-hint">
        Необязательно — но так ИИ-маркетолог даст более точный разбор. Например: ниша, оборот,
        сколько на Ozon, что именно не получается.
      </p>
      <textarea
        className="sit-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Например: продаю товары для дома, оборот ~300к/мес, но прибыль почти нулевая — не понимаю, куда уходят деньги…"
      />
      <div className="q-nav">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Назад
        </button>
        <div className="q-counter" />
        <button className="btn btn-primary" onClick={onSubmit}>
          Получить разбор →
        </button>
      </div>
    </div>
  );
}

// ── Блок ИИ-разбора на экране результата ─────────────────────────────────────
function AiBlock({
  ai,
  status,
  error,
  onRetry,
}: {
  ai: AiAnalysis | null;
  status: FetchStatus;
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="ai-block">
      <div className="ai-kicker">🤖 ИИ-маркетолог · персональный разбор</div>

      {status === "loading" && (
        <div className="ai-loading">
          <span className="ai-spin" />
          Анализирую ваши ответы и ситуацию…
        </div>
      )}

      {status === "error" && (
        <div className="ai-error">
          <p>Не удалось получить ИИ-разбор. {error}</p>
          <button className="btn btn-outline" onClick={onRetry}>
            Повторить
          </button>
        </div>
      )}

      {status === "done" && ai && (
        <>
          {ai.headline && <div className="ai-headline">{ai.headline}</div>}
          {ai.diagnosis && (
            <div className="ai-section">
              <span className="ai-label">Что происходит</span>
              <p>{ai.diagnosis}</p>
            </div>
          )}
          {ai.why && ai.why.length > 0 && (
            <div className="ai-section">
              <span className="ai-label">Почему этот путь вам подходит</span>
              <ul className="ai-why">
                {ai.why.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {ai.firstStep && (
            <div className="ai-section ai-step">
              <span className="ai-label">Первый шаг</span>
              <p>{ai.firstStep}</p>
            </div>
          )}
          {ai.honest && <p className="ai-honest">{ai.honest}</p>}
        </>
      )}
    </div>
  );
}

// ── Форма заявки (пишется в админку) ─────────────────────────────────────────
function LeadForm({
  name,
  contact,
  status,
  error,
  onName,
  onContact,
  onSubmit,
}: {
  name: string;
  contact: string;
  status: LeadStatus;
  error: string;
  onName: (v: string) => void;
  onContact: (v: string) => void;
  onSubmit: () => void;
}) {
  if (status === "ok") {
    return <div className="lead-ok">✓ Заявка отправлена — менеджер свяжется с вами.</div>;
  }
  return (
    <div className="lead-card">
      <div className="lead-title">Оставьте заявку — менеджер свяжется и поможет с выбором</div>
      <div className="lead-row">
        <input
          className="lead-input"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
        <input
          className="lead-input"
          placeholder="Телефон или @telegram"
          value={contact}
          onChange={(e) => onContact(e.target.value)}
        />
      </div>
      {error && <div className="lead-err">{error}</div>}
      <button className="btn btn-primary large" onClick={onSubmit} disabled={status === "sending"}>
        {status === "sending" ? "Отправка…" : "Оставить заявку"}
      </button>
    </div>
  );
}

// ── Корневой компонент ──────────────────────────────────────────────────────
export default function OzonQuiz() {
  const [stage, setStage] = useState<"intro" | "quiz" | "situation" | "result">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [situation, setSituation] = useState("");
  const [resultId, setResultId] = useState<string | null>(null);

  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [aiStatus, setAiStatus] = useState<FetchStatus>("idle");
  const [aiError, setAiError] = useState("");

  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");
  const [leadError, setLeadError] = useState("");

  // Восстановление из localStorage (как в оригинале + ситуация и ИИ-разбор).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      const st =
        s.stage && ["intro", "quiz", "situation", "result"].includes(s.stage) ? s.stage : "intro";
      setStage(st);
      setQIndex(s.qIndex || 0);
      setAnswers(s.answers || {});
      setSituation(s.situation || "");
      setResultId(s.resultId || null);
      if (st === "result" && s.resultId) {
        recordRef.current = s.recordId || newRecordId();
      } else if (s.recordId) {
        recordRef.current = s.recordId;
      }
      if (s.ai) {
        setAi(s.ai);
        setAiStatus("done");
        // Перезагрузка результата: на случай, если исходная запись не сохранилась.
        if (st === "result" && s.resultId) {
          persistRecord({
            result: RESULTS[s.resultId]?.badge ?? null,
            resultId: s.resultId,
            answers: readableAnswers(s.answers || {}),
            situation: s.situation || "",
            ai: s.ai,
          });
        }
      } else if (st === "result" && s.resultId) {
        // Перезагрузка на экране результата без сохранённого разбора — запросить заново.
        runAi(s.resultId, s.answers || {}, s.situation || "");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сохранение (как в оригинале + ситуация и ИИ-разбор).
  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stage, qIndex, answers, situation, resultId, ai, recordId: recordRef.current })
    );
  }, [stage, qIndex, answers, situation, resultId, ai]);

  // Запрос ИИ-разбора. Прямой вызов (не через эффект), чтобы не было гонки
  // «loading → cleanup отменяет запрос». Защита от устаревших ответов — через ref.
  const aiReqRef = useRef(0);
  const recordRef = useRef<string>("");

  // Записать/обновить прохождение в админке (не блокирует UI).
  const persistRecord = (fields: Record<string, unknown>) => {
    const id = recordRef.current;
    if (!id) return;
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    }).catch(() => {});
  };

  const runAi = (rid: string, ans: Answers, sit: string) => {
    const reqId = ++aiReqRef.current;
    setAi(null);
    setAiStatus("loading");
    setAiError("");
    const base = {
      result: RESULTS[rid]?.badge ?? null,
      resultId: rid,
      answers: readableAnswers(ans),
      situation: sit,
    };
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resultId: rid,
        scores: computeResult(ans).scores,
        answers: base.answers,
        situation: sit,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (aiReqRef.current !== reqId) return;
        if (d.error) {
          setAiError(d.error);
          setAiStatus("error");
          persistRecord({ ...base, ai: null });
        } else {
          setAi(d.result);
          setAiStatus("done");
          persistRecord({ ...base, ai: d.result });
        }
      })
      .catch((e) => {
        if (aiReqRef.current !== reqId) return;
        setAiError(String(e));
        setAiStatus("error");
        persistRecord({ ...base, ai: null });
      });
  };

  const total = QUESTIONS.length;
  const question = QUESTIONS[qIndex];
  const options = question ? optionsFor(question, answers) : [];

  const restart = () => {
    setStage("intro");
    setQIndex(0);
    setAnswers({});
    setSituation("");
    setResultId(null);
    setAi(null);
    setAiStatus("idle");
    setAiError("");
    setLeadName("");
    setLeadContact("");
    setLeadStatus("idle");
    setLeadError("");
    recordRef.current = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Старт теста: отмечаем «начат» — чтобы учитывать незавершённые прохождения.
  const startQuiz = () => {
    recordRef.current = newRecordId();
    setStage("quiz");
    setQIndex(0);
    persistRecord({});
  };

  const goToResult = () => {
    const { id } = computeResult(answers);
    // Переиспользуем id, созданный на старте (не плодим дубли).
    if (!recordRef.current) recordRef.current = newRecordId();
    setResultId(id);
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Сразу фиксируем завершение в админке (НЕ дожидаясь ИИ).
    persistRecord({
      result: RESULTS[id]?.badge ?? null,
      resultId: id,
      answers: readableAnswers(answers),
      situation,
      ai: null,
    });
    runAi(id, answers, situation);
  };

  const submitLead = async () => {
    if (!leadName.trim() || !leadContact.trim()) {
      setLeadError("Укажите имя и контакт");
      return;
    }
    if (!recordRef.current) recordRef.current = newRecordId();
    setLeadStatus("sending");
    setLeadError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recordRef.current,
          name: leadName,
          contact: leadContact,
          result: resultId ? RESULTS[resultId]?.badge ?? null : null,
          resultId,
          answers: readableAnswers(answers),
          situation,
          ai,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setLeadError(d.error || "Не удалось отправить заявку");
        setLeadStatus("error");
        return;
      }
      setLeadStatus("ok");
    } catch (e) {
      setLeadError(String(e));
      setLeadStatus("error");
    }
  };

  return (
    <div className="ozon-quiz-root">
      <div className="quiz-shell">
        <div className="quiz-header">
          <div className="quiz-logo">
            <img src={`${ASSET_BASE}/logo.svg`} alt="Рома Райт" />
          </div>
          {(stage === "quiz" || stage === "situation") && (
            <button className="btn btn-ghost" onClick={restart} style={{ padding: "8px 14px", fontSize: 14 }}>
              Начать сначала
            </button>
          )}
        </div>

        {stage === "intro" && <Intro onStart={startQuiz} />}

        {stage === "quiz" && question && (
          <>
            <Progress current={qIndex} total={total} />
            <QuestionCard
              question={question}
              options={options}
              answer={answers[question.id]}
              onAnswer={(v) => setAnswers({ ...answers, [question.id]: v })}
              onNext={() => {
                if (qIndex < total - 1) {
                  setQIndex(qIndex + 1);
                } else {
                  setStage("situation");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              onBack={() => {
                if (qIndex > 0) setQIndex(qIndex - 1);
              }}
              qIndex={qIndex}
              total={total}
            />
          </>
        )}

        {stage === "situation" && (
          <>
            <Progress current={total} total={total} />
            <SituationCard
              value={situation}
              onChange={setSituation}
              onSubmit={goToResult}
              onBack={() => {
                setStage("quiz");
                setQIndex(total - 1);
              }}
            />
          </>
        )}

        {stage === "result" && resultId && (
          <Result
            resultId={resultId}
            answers={answers}
            onRestart={restart}
            onSwitch={(id) => {
              setResultId(id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aiSlot={
              <AiBlock
                ai={ai}
                status={aiStatus}
                error={aiError}
                onRetry={() => resultId && runAi(resultId, answers, situation)}
              />
            }
            leadSlot={
              <LeadForm
                name={leadName}
                contact={leadContact}
                status={leadStatus}
                error={leadError}
                onName={setLeadName}
                onContact={setLeadContact}
                onSubmit={submitLead}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
