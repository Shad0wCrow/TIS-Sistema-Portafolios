import styles from "../Portafolio.module.css";

function EmptyState({ label }: { label: string }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyText}>No hay {label} registradas aún</span>
    </div>
  );
}

export default EmptyState;
