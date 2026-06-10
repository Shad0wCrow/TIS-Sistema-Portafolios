import { useEffect } from "react";
import styles from "./modalSuccess.module.css";

const IconCheck = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface ModalSuccessProps {
  /** Título del mensaje de éxito */
  title?: string;
  /** Descripción adicional */
  message?: string;
  /** Milisegundos antes del cierre automático (default: 2500) */
  autoCloseDuration?: number;
  onClose: () => void;
}

export default function ModalSuccess({
  title,
  message = "Operación completada con éxito.",
  autoCloseDuration = 2500,
  onClose,
}: ModalSuccessProps) {
  
  let displayTitle = title;
  if (!displayTitle) {
    const msgLower = message.toLowerCase();
    if (msgLower.includes("eliminad")) displayTitle = "Eliminado correctamente";
    else if (msgLower.includes("actualizad") || msgLower.includes("editad")) displayTitle = "Actualizado correctamente";
    else if (msgLower.includes("agregad") || msgLower.includes("registrad") || msgLower.includes("guardad")) displayTitle = "Guardado correctamente";
    else displayTitle = "Operación exitosa";
  }

  // Cierre automático
  useEffect(() => {
    const timer = setTimeout(onClose, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [onClose, autoCloseDuration]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-message"
      >
        <div className={styles.iconWrap}>
          <IconCheck />
        </div>

        <p className={styles.title} id="success-title">
          {displayTitle}
        </p>
        <p className={styles.message} id="success-message">
          {message}
        </p>

        {/* Barra de progreso que indica el cierre automático */}
        <div className={styles.progressBar} aria-hidden="true">
          <div
            className={styles.progressFill}
            style={{ "--duration": `${autoCloseDuration}ms` } as React.CSSProperties}
          />
        </div>

        <button className={styles.btnClose} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
