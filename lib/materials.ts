import "server-only";
import type { Category, Material, MaterialType } from "./types";
import { kvGet, kvSet } from "./store";
import seed from "@/data/materials.json";

/**
 * Единственная точка доступа к данным каталога.
 *
 * Хранилище через lib/store.ts: Upstash Redis на проде (Vercel), файл
 * data/materials.json локально. При пустом хранилище (первый деплой) отдаётся
 * сид data/materials.json (демо-каталог), вкомпилированный в бандл, — сайт не
 * пустой, а добавление/удаление материалов пишется в Redis и переживает деплой.
 */

const KEY = "materials";

interface DataShape {
  categories: Category[];
  materials: Material[];
}

const SEED = seed as DataShape;

async function readData(): Promise<DataShape> {
  return kvGet<DataShape>(KEY, SEED);
}

async function writeData(data: DataShape): Promise<void> {
  await kvSet(KEY, data);
}

/** Все категории */
export async function getCategories(): Promise<Category[]> {
  const { categories } = await readData();
  return categories;
}

/** Материалы, опционально отфильтрованные по категории */
export async function getMaterials(categorySlug?: string): Promise<Material[]> {
  const { materials } = await readData();
  const list = categorySlug
    ? materials.filter((m) => m.category === categorySlug)
    : materials;
  // Новые — выше
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Один материал по slug */
export async function getMaterialBySlug(
  slug: string
): Promise<Material | null> {
  const { materials } = await readData();
  return materials.find((m) => m.slug === slug) ?? null;
}

/** Название категории по slug (для подписей) */
export async function getCategoryTitle(slug: string): Promise<string> {
  const { categories } = await readData();
  return categories.find((c) => c.slug === slug)?.title ?? slug;
}

export interface NewMaterialInput {
  title: string;
  type: MaterialType;
  category: string;
  description: string;
  contentUrl?: string;
  coverUrl?: string;
  body?: string;
  isFree?: boolean;
}

/** Транслитерация + слугификация для генерации slug из заголовка */
function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in map ? map[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** Добавить материал в каталог. Возвращает созданный материал. */
export async function addMaterial(
  input: NewMaterialInput
): Promise<Material> {
  const data = await readData();

  let slug = slugify(input.title) || `material-${Date.now()}`;
  // Гарантируем уникальность slug
  if (data.materials.some((m) => m.slug === slug)) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const material: Material = {
    id: `m-${Date.now()}`,
    slug,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    coverUrl: input.coverUrl?.trim() || "",
    contentUrl: input.contentUrl?.trim() || "",
    body: input.body?.trim() || "",
    isFree: input.isFree ?? true,
    createdAt: new Date().toISOString(),
  };

  data.materials.push(material);
  await writeData(data);
  return material;
}

/** Удалить материал по id. true — удалён, false — не найден. */
export async function deleteMaterial(id: string): Promise<boolean> {
  const data = await readData();
  const before = data.materials.length;
  data.materials = data.materials.filter((m) => m.id !== id);
  if (data.materials.length === before) return false;
  await writeData(data);
  return true;
}
