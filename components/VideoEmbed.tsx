import { Play } from "lucide-react";
import styles from "./VideoEmbed.module.css";

/**
 * Слот под видео. Заполняется одним значением — embed-ссылкой (kinescope/YouTube/Vimeo).
 *   <VideoEmbed src="https://kinescope.io/embed/XXXX" label="…" />
 * Если src пустой — показывает аккуратную заготовку «здесь будет видео».
 * Растягивается на родителя (родитель задаёт пропорции и фон-свечение).
 */
export default function VideoEmbed({
  src,
  label = "Видео",
}: {
  src?: string;
  label?: string;
}) {
  if (src) {
    return (
      <iframe
        className={styles.frame}
        src={src}
        title={label}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  return (
    <div className={styles.slot} role="img" aria-label={`${label} — слот под видео`}>
      <span className={styles.play}><Play size={26} /></span>
      <span className={styles.label}>{label}</span>
      <span className={styles.hint}>Слот под видео — вставьте embed-ссылку</span>
    </div>
  );
}
