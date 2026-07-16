import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingContent, LANDING_TITLES, LANDING_KIND } from "@/lib/landingContent";
import { routes } from "@/lib/links";
import LandingEditor from "@/components/LandingEditor";
import CourseEditor from "@/components/CourseEditor";
import type { SopContent } from "@/components/SopLanding";
import type { CourseContent } from "@/components/CourseLanding";
import styles from "../../materials/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Редактор лендинга · Makeunion",
};

export default async function LandingEditorPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const { landing } = await params;
  const content = await getLandingContent(landing);
  if (!content) notFound();
  const kind = LANDING_KIND[landing];

  return (
    <div className="container">
      <div className={styles.head}>
        <div>
          <Link href={routes.adminContent} className={styles.inlineLink}>
            ← Контент страниц
          </Link>
          <h1 style={{ marginTop: 10 }}>
            Редактор: <em>{LANDING_TITLES[landing] ?? landing}</em>
          </h1>
          <p className="soft">
            Полный контент лендинга. Изменения применяются на странице сразу после
            «Сохранить».
          </p>
        </div>
      </div>

      {kind === "course" ? (
        <CourseEditor id={landing} initial={content as CourseContent} />
      ) : (
        <LandingEditor id={landing} initial={content as SopContent} />
      )}
    </div>
  );
}
