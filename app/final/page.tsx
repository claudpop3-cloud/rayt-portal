import { redirect } from "next/navigation";
import { routes } from "@/lib/links";

// Онбординг после заявки собран на /spasibo. Старый /final оставляем только как
// редирект, чтобы не было дубля и битых ссылок.
export default function FinalRedirect() {
  redirect(routes.spasibo);
}
