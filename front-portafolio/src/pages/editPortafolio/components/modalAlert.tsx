import styles from "./modalAlert.module.css";

const IconTrash = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3h6l1 1h4v2H4V4h4L9 3zm-4 4h14l-1 14H6L5 7zm5 2v10h1V9h-1zm3 0v10h1V9h-1z" />
  </svg>
);

interface ModalAlertProps {
  title: string;
  message: string;
  labelConfirm?: string;
  labelCancel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalAlert({
  title,
  message,
  labelConfirm = "Eliminar",
  labelCancel = "Cancelar",
  onConfirm,
  onCancel,
}: ModalAlertProps) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <IconTrash />
        </div>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>{labelCancel}</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>{labelConfirm}</button>
        </div>
      </div>
    </div>
  );
}