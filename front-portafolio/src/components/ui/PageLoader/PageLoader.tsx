import styles from "./PageLoader.module.css";

interface PageLoaderProps {
  message?: string;
  fullHeight?: boolean;
}

export default function PageLoader({
  message = "Cargando...",
  fullHeight = true,
}: PageLoaderProps) {
  return (
    <div className={`${styles.screen} ${fullHeight ? styles.fullHeight : ""}`} role="status" aria-live="polite">
      <div className={styles.card}>
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
