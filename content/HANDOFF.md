# Хендофф — портал Райта (текущее состояние)

Сводка на случай продолжения в новой сессии. Проект: `portal/` (Next.js 15 App Router + TS).

## Как запустить
```
cd portal
npm install          # если ещё не ставили
npm run build        # прод-сборка (должна быть чистой, exit 0)
npm start            # → http://localhost:3000  (прод)
# или npm run dev    # дев-режим
```
Скриншоты страниц снимал через headless Edge:
`msedge --headless=new --screenshot="out.png" "http://admin:ПАРОЛЬ@localhost:3000/admin/..."`

## Доступы / окружение (`portal/.env.local`, шаблон — `.env.example`)
- `OPENAI_API_KEY` — для ИИ-разбора квиза (уже есть, НЕ печатать значение).
- `ADMIN_USER=admin`, `ADMIN_PASSWORD=rayt-admin-2026` — Basic-Auth на `/admin/*`. **Сменить в проде.**
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — прод-хранилище (Redis). Если заданы —
  все данные (заявки, каталог, контент лендингов, быстрые правки) пишутся в Redis; если нет —
  в локальные `data/*.json`. Переключение — только env, код не меняется (`lib/store.ts`).
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (опц.) — дубль заявок в Telegram-чат владельцу.
- `LEADS_WEBHOOK_URL` (опц.) — дубль заявок в вебхук (Sheets/CRM/бот).

## Хранилище данных (важно)
Единая абстракция `lib/store.ts` (`kvGet`/`kvSet`/`kvDel`): **Upstash Redis на проде**
(Vercel-ФС read-only), **файлы `data/*.json` локально**. Ключи: `leads`, `materials`,
`site-content`, `landing:<id>`. Сторы (`lib/leads.ts`, `lib/materials.ts`,
`lib/siteContent.ts`, `lib/landingContent.ts`) ходят только через неё. Каталог при пустом
Redis сидируется из `data/materials.json` (импорт в бандл). Пакет `@upstash/redis`.
**Полная инструкция по публикации — `content/DEPLOY.md`** (Vercel + Upstash пошагово).

## Что сделано (вся воронка внутри портала, единый стиль)
Дизайн-система снята с боевого `romarayt.ru/ozon`: тёмный `#030510/#0a0a13`, Golos Text,
градиент `#591BA1→#FA003A`, розовый `#ff006b`. Токены — `app/globals.css`, docs — `content/DESIGN-SYSTEM.md`.
Позиционирование везде: «ведёт закреплённый менеджер, не Роман лично», анти-хайп.

- **Квиз** `/quiz` — точная копия + **ИИ-разбор ответов** (`lib/ai/analyze.ts`, OpenAI) + заявка.
  CTA результатов ведут на **внутренние** лендинги; позиционирование выправлено.
- **Сопровождение** `/soprovozhdenie/seller` и `/manager` — по `voronka-soprovozhdenie/tz-sopform/sopmanager-golos.md`.
- **Курсы** `/kursy/seller` и `/manager` (хаб `/kursy`) — по `napolnenie-lendingov-professii-v2.md`, 3 тарифа, тариф «Наставничество» кросс-линк на сопровождение.
- **«Спасибо»** `/spasibo` — по `tz-spasibo-golos.md` (видео-слот + титры + чат). `/final` → редирект на `/spasibo`.
- **Заявки** — единый стор `lib/leads.ts` → админка `/admin/leads` (квиз + лендинги + брошенные старты).
- **Видео** — везде embed-слоты (`components/VideoEmbed.tsx`); пусто = заготовка. Реальных роликов пока нет.

## Админка `/admin` (под Basic-Auth)
- **Материалы** `/admin/materials` — добавить + **удалить** (`DeleteMaterialButton`).
- **Заявки** `/admin/leads`.
- **Контент страниц** `/admin/content`:
  - **Быстрые правки** (`ContentForm`, стор `lib/siteContent.ts`): заголовки курсов, тарифы курсов, видео «Спасибо», ссылка на чат.
  - **Полный редактор лендинга** `/admin/content/[landing]` — **ВСЕ 4 лендинга**:
    `sop-seller`, `sop-manager` (`LandingEditor`), `course-seller`, `course-manager` (`CourseEditor`).
    Редактируемы все блоки (заголовки, кейсы, сравнение/таблица, шаги, программа, тарифы с
    составом, гарантии, цена, FAQ, факты) с add/remove пунктов. Кнопки Сохранить / Сбросить.
    Дефолты — `lib/landing/*.ts`. Страница `[landing]` ветвится по `LANDING_KIND`.
  - **Быстрые правки** (`ContentForm`) теперь только: видео «Спасибо» + ссылка на чат.

## Архитектура редактора контента (важно для продолжения)
- Тексты-заголовки — обычные строки; подсветка слова через `**звёздочки**` → `lib/marks.tsx` `renderMarks`.
- `SopContent` (в `components/SopLanding.tsx`) полностью сериализуем (строки/массивы).
- Полный контент лендинга хранится в `data/landing-<id>.json` (или дефолт из кода). Reset = удалить файл.
- API `/api/landing?id=` (GET/POST/DELETE), `/api/content`, `/api/materials` — под middleware-авторизацией
  (`middleware.ts` matcher: `/admin*`, `/api/materials`, `/api/content`, `/api/landing`). `/api/lead`, `/api/analyze` — публичные (формы).

## ЧТО ОСТАЛОСЬ (следующие шаги)
Полный редактор **всех 4 лендингов — ГОТОВ** (Option A выполнен).
**Прод-хранилище (Redis) — ГОТОВО**, **деплой-инструкция — ГОТОВА** (`content/DEPLOY.md`).
1. **Задеплоить на Vercel + Upstash** по `content/DEPLOY.md` (нужен вход клиента: GitHub/Vercel,
   ключи задаются в env). Сам деплой — действие владельца (аккаунты/логины).
2. **Реальные видео** — вставить embed-ссылки: визитки sop-seller/manager — в полном редакторе
   (поле «Видео»), приветствие «Спасибо» — в быстрых правках. Сценарий «Спасибо» готов в ТЗ.
3. **Прочий контент без кода** (если нужно): квиз (вопросы/исходы/офферы) — сейчас в коде
   (`components/quiz/OzonQuiz.tsx`); текст/титры страницы «Спасибо».
4. Мелочи: аналитика отвала квиза; страницы чат/консультация (`tz-tg`, `playbook-konsultacii`).

### Как добавить новый лендинг в полный редактор (шпаргалка)
Sop-типа: создать `lib/landing/<id>.ts` (SopContent, строки), зарегистрировать в
`lib/landingContent.ts` (DEFAULTS + LANDING_TITLES + LANDING_KIND="sop"), страница читает
`getSopLanding("<id>")`. Course-типа — аналогично с CourseContent и LANDING_KIND="course".

## Готчи
- **Windows-консоль бьёт кириллицу** в POST-телах — тестировать заявки/контент телом из UTF-8 файла (`curl --data-binary @file`), не инлайн.
- Все лендинги/админка — `force-dynamic` (читают сторы на каждый запрос).
- Откат стиля — ZIP `_backups/portal_s-ii-i-zayavkami`.
- Полная карта воронки — `content/VORONKA-PLAN.md`, дизайн — `content/DESIGN-SYSTEM.md`.
