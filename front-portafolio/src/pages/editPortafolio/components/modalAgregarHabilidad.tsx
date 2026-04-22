import { useState } from "react";
import styles from "./modals.module.css";
import type { HabilidadCatalogo } from "../../../types/portafolioTypes";

interface ModalAgregarHabilidadProps {
  tipo: "tecnica" | "blanda";
  catalogo: HabilidadCatalogo[];
  onClose: () => void;
  onSave: (habilidadId: number, nivel: string) => Promise<void>;
}

export default function ModalAgregarHabilidad({ tipo, catalogo, onClose, onSave }: ModalAgregarHabilidadProps) {
  const filtrado = catalogo.filter((h) => h.tipo === tipo);
  const [habilidadId, setHabilidadId] = useState<number | "">("");
  const [nivel, setNivel] = useState("basico");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!habilidadId) return;
    setLoading(true);
    try { await onSave(Number(habilidadId), nivel); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Habilidad {tipo === "tecnica" ? "técnica" : "blanda"}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalStack}>
          <div className={styles.modalField}>
            <label>Seleccionar habilidad</label>
            <select value={habilidadId} onChange={(e) => setHabilidadId(Number(e.target.value))}>
              <option value="">— Selecciona —</option>
              {filtrado.map((h) => (
                <option key={h.id_habilidad} value={h.id_habilidad}>{h.nombre}</option>
              ))}
            </select>
          </div>
          <div className={styles.modalField}>
            <label>Nivel</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="experto">Experto</option>
            </select>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={submit} disabled={loading || !habilidadId}>
            {loading ? (
              <span className={styles.loadingContent}>
                <span className={styles.spinner} aria-hidden="true" />
                Guardando...
              </span>
            ) : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
