import Link from "next/link";
import { ShoppingCart, Users, BookOpen } from "lucide-react";
import { getCategories, getMaterials } from "@/lib/materials";
import { routes } from "@/lib/links";
import EntryCard from "@/components/EntryCard";
import Catalog from "@/components/Catalog";
import styles from "./page.module.css";

// Каталог читается из JSON на каждый запрос — новые материалы из админки видны сразу.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [materials, categories] = await Promise.all([
    getMaterials(),
    getCategories(),
  ]);

  return (
    <>
      {/* HERO — фирменная панель сайта: тёмная с фиолетово-малиновым свечением */}
      <section className={styles.hero}>
        <div className="container">
          <div className={`${styles.heroPanel} rr-anim`}>
            <div className={styles.heroContent}>
              <div className={styles.introBadge}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/roma-avatar.png" alt="Рома Райт" />
                Материалы и разборы от Ромы Райта
              </div>
              <h1 className={styles.h1}>
                Всё про <em>Ozon</em>
                <br />в одном месте
              </h1>
              <p className={styles.lead}>
                Каталог материалов, ИИ-разбор для подбора пути, сопровождение и курсы.
                Начните с бесплатных разборов — или пройдите ИИ-разбор и получите
                персональную рекомендацию.
              </p>
              <div className={styles.heroCta}>
                <Link href={routes.quiz} className="btn btn-primary">
                  Пройти ИИ-разбор →
                </Link>
                <a href="#catalog" className="btn btn-secondary">
                  Смотреть материалы
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ВХОДЫ по ролям */}
      <section className={styles.entries}>
        <div className="container">
          <div className={`${styles.entryGrid} rr-anim-slow`}>
            <EntryCard
              icon={<ShoppingCart />}
              title="Селлер"
              text="Продаёте или хотите продавать на Ozon. Пройдите ИИ-разбор — подберём путь под ваш опыт."
              ctaLabel="Пройти ИИ-разбор"
              href={routes.quiz}
              accent="pink"
            />
            <EntryCard
              icon={<Users />}
              title="Менеджер"
              text="Ведёте чужие магазины. ИИ-разбор определит, какое сопровождение подойдёт именно вам."
              ctaLabel="Пройти ИИ-разбор"
              href={routes.quiz}
              accent="purple"
            />
            <EntryCard
              icon={<BookOpen />}
              title="Изучаю тему"
              text="Пока разбираетесь. Начните с бесплатных материалов, разборов и чек-листов."
              ctaLabel="Смотреть материалы"
              href="#catalog"
              accent="red"
            />
          </div>
        </div>
      </section>

      {/* КАТАЛОГ — основной экран портала */}
      <section id="catalog" className={styles.catalog}>
        <div className="container">
          <div className={styles.catalogHead}>
            <div>
              <span className="eyebrow">Разборы райта</span>
              <h2>
                Каталог <em>материалов</em>
              </h2>
              <p className="soft">
                Статьи, видео, чек-листы и разборы магазинов. Фильтруйте по
                категориям.
              </p>
            </div>
            <a href={routes.adminMaterials} className={`btn btn-secondary ${styles.adminBtn}`}>
              + Добавить материал
            </a>
          </div>

          <Catalog materials={materials} categories={categories} />
        </div>
      </section>
    </>
  );
}
