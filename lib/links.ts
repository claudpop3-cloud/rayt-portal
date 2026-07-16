/**
 * Все внешние ссылки портала — в одном месте.
 * Квиз и лендинги НЕ пересобираются: портал ведёт на их живые адреса.
 * Меняете адрес — правите только здесь.
 */
export const externalLinks = {
  // Эталон квиза на проде (справочно, для сверки стиля). В портале квиз
  // собран внутри — см. routes.quiz.
  quiz: "https://my.makeunion.me/simulators/ozon-quiz",

  // Лендинги сопровождения (готовы, подключены ссылками)
  sopSeller: "https://romarayt.ru/sopform",
  sopManager: "https://romarayt.ru/sopmanager",

  // Существующие курсы на Tilda
  courseSeller: "https://romarayt.ru/ozon",
  courseManager: "https://romarayt.ru/manager",

  // Финальная страница / «Спасибо»
  final: "https://romarayt.ru/sopfinal",

  // Закрытый ТГ-чат предзаписи сопровождения (греет до звонка менеджера)
  chatPrezapis: "https://t.me/+stlcQYP39T02ZjQy",
} as const;

/** Внутренние маршруты портала */
export const routes = {
  home: "/",
  quiz: "/quiz",
  material: (slug: string) => `/razbory/${slug}`,
  admin: "/admin",
  adminMaterials: "/admin/materials",
  adminLeads: "/admin/leads",
  adminContent: "/admin/content",
  courses: "/kursy",
  courseSeller: "/kursy/seller",
  courseManager: "/kursy/manager",
  finalStub: "/final",
  spasibo: "/spasibo",
  sopSeller: "/soprovozhdenie/seller",
  sopManager: "/soprovozhdenie/manager",
} as const;
