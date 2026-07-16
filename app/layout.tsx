import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import SiteSidebar from "@/components/SiteSidebar";
import SiteFooter from "@/components/SiteFooter";

// Источник правды — боевой сайт romarayt.ru/ozon: шрифт Golos Text (400–700),
// и заголовки, и текст. Подключаем через next/font/google (кириллица + латиница).
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Makeunion · Портал",
  description:
    "Единая точка входа: каталог материалов «Разборы райта», квиз, сопровождение и курсы по Ozon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={golos.variable}>
      <body>
        <SiteSidebar />
        <div className="layout-content">
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
