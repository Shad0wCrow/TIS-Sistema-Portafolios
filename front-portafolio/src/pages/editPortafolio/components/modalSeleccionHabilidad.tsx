import styles from "./modals.module.css";

interface ModalSeleccionHabilidadProps {
  onSelect: (tipo: "tecnica" | "blanda") => void;
  onClose: () => void;
}

export default function ModalSeleccionHabilidad({ onSelect, onClose }: ModalSeleccionHabilidadProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Tipo de Habilidad</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalStack} style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ marginBottom: "20px", fontSize: "14px", color: "var(--text2)" }}>
            Selecciona el tipo de habilidad que deseas registrar:
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button className={styles.btnSave} onClick={() => onSelect("tecnica")}>Técnica</button>
            <button className={styles.btnSave} onClick={() => onSelect("blanda")}>Blanda</button>
          </div>
        </div>
      </div>
    </div>
  );
}