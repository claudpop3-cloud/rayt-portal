import Link from "next/link";
import { routes } from "@/lib/links";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "90px 0", textAlign: "center" }}>
      <span className="eyebrow">404</span>
      <h1 style={{ margin: "14px 0 12px" }}>Страница не найдена</h1>
      <p className="soft" style={{ maxWidth: "48ch", margin: "0 auto 26px" }}>
        Возможно, материал удалён или ссылка устарела. Вернитесь в каталог.
      </p>
      <Link href={routes.home} className="btn btn-primary">
        В каталог материалов
      </Link>
    </div>
  );
}
