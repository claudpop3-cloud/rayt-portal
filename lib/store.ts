import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * Единое хранилище JSON-блобов для всех сторов (leads / materials / siteContent /
 * landingContent). Два бэкенда, выбор по наличию env:
 *
 *  - ПРОД (Vercel): заданы UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN →
 *    данные лежат в Upstash Redis. Vercel-ФС read-only не мешает: заявки и правки
 *    контента из админки персистятся между запросами и деплоями.
 *  - ЛОКАЛЬНО (dev): env нет → данные лежат в файлах data/*.json (как раньше).
 *
 * Ключ вида "landing:sop-seller" в файловом режиме мапится в data/landing-sop-seller.json,
 * поэтому имена файлов совпадают со старой схемой — локальные данные не теряются.
 */

// Имена переменных зависят от способа подключения:
//  - вручную (@upstash/redis) → UPSTASH_REDIS_REST_URL / _TOKEN
//  - интеграция Upstash в Vercel Marketplace → KV_REST_API_URL / KV_REST_API_TOKEN
// Принимаем оба, чтобы не зависеть от того, как заведена база.
const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/** true — работаем на Redis (прод), false — на файлах (локально). */
export const usingRedis = Boolean(redis);

function fileFor(key: string): string {
  const safe = key.replace(/:/g, "-");
  return path.join(process.cwd(), "data", `${safe}.json`);
}

/** Прочитать значение по ключу; если его нет — вернуть fallback. */
export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  if (redis) {
    try {
      const v = await redis.get<T>(key);
      return v ?? fallback;
    } catch (e) {
      console.error(`[store] Redis GET ${key} не удался:`, (e as Error).message);
      return fallback;
    }
  }
  try {
    const raw = await fs.readFile(fileFor(key), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Записать значение по ключу. Ошибку не роняем — логируем. */
export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, value);
    } catch (e) {
      console.error(`[store] Redis SET ${key} не удался:`, (e as Error).message);
    }
    return;
  }
  try {
    await fs.mkdir(path.dirname(fileFor(key)), { recursive: true });
    await fs.writeFile(fileFor(key), JSON.stringify(value, null, 2), "utf-8");
  } catch (e) {
    console.error(`[store] запись ${key} не удалась (read-only ФС?):`, (e as Error).message);
  }
}

/** Удалить значение по ключу (для сброса контента к дефолту). */
export async function kvDel(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
    } catch (e) {
      console.error(`[store] Redis DEL ${key} не удался:`, (e as Error).message);
    }
    return;
  }
  try {
    await fs.unlink(fileFor(key));
  } catch {
    // файла нет — уже дефолт
  }
}
