
import styles from "./successModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SuccessModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>¡Perfil creado!</h2>
        <p className={styles.message}>
          Tu perfil ha sido creado correctamente.
        </p>

        <button className={styles.button} onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  );
}