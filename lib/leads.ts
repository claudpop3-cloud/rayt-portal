import "server-only";
import type { AiAnalysis } from "./ai/analyze";
import { kvGet, kvSet } from "./store";

/**
 * Хранилище прохождений квиза и заявок. Питает раздел админки «Заявки с квизов».
 *
 * Одна запись = одно прохождение теста (создаётся, когда человек дошёл до
 * результата). Если человек оставил контакт — запись помечается contacted:true
 * и становится полноценной заявкой. Обновление идёт по id (upsert).
 *
 * Хранилище через lib/store.ts: Upstash Redis на проде (Vercel), файл data/leads.json
 * локально. Дополнительно каждая заявка дублируется в Telegram/вебхук (dispatchLead),
 * чтобы лиды не терялись при любом сбое хранилища.
 */

const KEY = "leads";

export interface Lead {
  id: string;
  name: string;
  contact: string;
  // Оставлен ли контакт (true = заявка, false = просто прохождение).
  contacted: boolean;
  // Исход теста: читаемый ярлык + технический id (напр. R1_seller_sop).
  result: string | null;
  resultId: string | null;
  // Ответы в читаемом виде: { «текст вопроса»: «текст ответа» }.
  answers: Record<string, string>;
  situation: string;
  // Сохранённый ИИ-разбор (если был получен).
  ai: AiAnalysis | null;
  createdAt: string;
}

async function readData(): Promise<Lead[]> {
  return kvGet<Lead[]>(KEY, []);
}

async function writeData(leads: Lead[]): Promise<void> {
  await kvSet(KEY, leads);
}

/** Опциональная пересылка заявки во внешний вебхук (CRM/Sheets). */
async function forwardToWebhook(lead: Lead): Promise<void> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch (e) {
    console.error("[leads] пересылка в вебхук не удалась:", (e as Error).message);
  }
}

/**
 * Уведомление о заявке в Telegram (чтобы заявки не терялись даже на read-only проде).
 * Нужны env TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. Заявка приходит владельцу в чат.
 */
async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const anketa = Object.entries(lead.answers || {})
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");
  const text =
    "🔥 Новая заявка\n" +
    (lead.result ? `Продукт: ${lead.result}\n` : "") +
    `Имя: ${lead.name || "—"}\n` +
    `Контакт: ${lead.contact || "—"}\n` +
    (lead.situation ? `Ситуация: ${lead.situation}\n` : "") +
    (anketa ? `\nАнкета:\n${anketa}` : "");
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("[leads] Telegram-уведомление не удалось:", (e as Error).message);
  }
}

/** Разослать заявку по всем каналам (вебхук + Telegram). */
async function dispatchLead(lead: Lead): Promise<void> {
  await Promise.all([forwardToWebhook(lead), notifyTelegram(lead)]);
}

/** Все записи, новые — выше. */
export async function getLeads(): Promise<Lead[]> {
  const leads = await readData();
  return [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface UpsertLeadInput {
  id: string;
  name?: string;
  contact?: string;
  result?: string | null;
  resultId?: string | null;
  answers?: Record<string, string>;
  situation?: string;
  ai?: AiAnalysis | null;
}

/**
 * Создать или обновить запись по id. Переданные поля перезаписываются,
 * непереданные (undefined) — сохраняются. Возвращает актуальную запись.
 */
export async function upsertLead(input: UpsertLeadInput): Promise<Lead> {
  const leads = await readData();
  const idx = leads.findIndex((l) => l.id === input.id);

  if (idx >= 0) {
    const cur = leads[idx];
    const merged: Lead = {
      ...cur,
      name: input.name !== undefined ? input.name.trim() : cur.name,
      contact: input.contact !== undefined ? input.contact.trim() : cur.contact,
      result: input.result !== undefined ? input.result : cur.result,
      resultId: input.resultId !== undefined ? input.resultId : cur.resultId,
      answers: input.answers !== undefined ? input.answers : cur.answers,
      situation: input.situation !== undefined ? input.situation.trim() : cur.situation,
      ai: input.ai !== undefined ? input.ai : cur.ai,
    };
    merged.contacted = merged.contact.length > 0;
    leads[idx] = merged;
    await writeData(leads);
    if (merged.contacted) await dispatchLead(merged);
    return merged;
  }

  const contact = (input.contact ?? "").trim();
  const lead: Lead = {
    id: input.id,
    name: (input.name ?? "").trim(),
    contact,
    contacted: contact.length > 0,
    result: input.result ?? null,
    resultId: input.resultId ?? null,
    answers: input.answers ?? {},
    situation: (input.situation ?? "").trim(),
    ai: input.ai ?? null,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  await writeData(leads);
  if (lead.contacted) await dispatchLead(lead);
  return lead;
}
