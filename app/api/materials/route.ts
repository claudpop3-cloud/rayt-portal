import { NextResponse } from "next/server";
import { addMaterial, deleteMaterial, getCategories, getMaterials } from "@/lib/materials";
import { materialTypeLabels, type MaterialType } from "@/lib/types";

const VALID_TYPES = Object.keys(materialTypeLabels) as MaterialType[];

/** GET /api/materials — список материалов (для проверки/интеграций) */
export async function GET() {
  const materials = await getMaterials();
  return NextResponse.json({ materials });
}

/** POST /api/materials — добавить материал */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const title = String(payload.title ?? "").trim();
  const type = String(payload.type ?? "") as MaterialType;
  const category = String(payload.category ?? "").trim();
  const description = String(payload.description ?? "").trim();

  // Валидация обязательных полей
  if (!title || !type || !category || !description) {
    return NextResponse.json(
      { error: "Заполните заголовок, тип, категорию и описание" },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Неизвестный тип материала" }, { status: 400 });
  }

  const categories = await getCategories();
  if (!categories.some((c) => c.slug === category)) {
    return NextResponse.json({ error: "Неизвестная категория" }, { status: 400 });
  }

  const material = await addMaterial({
    title,
    type,
    category,
    description,
    contentUrl: payload.contentUrl ? String(payload.contentUrl) : undefined,
    coverUrl: payload.coverUrl ? String(payload.coverUrl) : undefined,
    body: payload.body ? String(payload.body) : undefined,
    isFree: payload.isFree === undefined ? true : Boolean(payload.isFree),
  });

  return NextResponse.json({ material }, { status: 201 });
}

/** DELETE /api/materials?id=… — удалить материал */
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Не указан id материала" }, { status: 400 });
  }
  const ok = await deleteMaterial(id);
  if (!ok) {
    return NextResponse.json({ error: "Материал не найден" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id }, { status: 200 });
}
