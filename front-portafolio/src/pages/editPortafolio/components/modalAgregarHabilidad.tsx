import { useState } from "react";
import styles from "./modals.module.css";
import type { HabilidadCatalogo } from "../../../types/portafolioTypes";


interface ModalAgregarHabilidadProps {
  tipo: "tecnica" | "blanda";
  catalogo: HabilidadCatalogo[];
  onClose: () => void;
  onSave: (habilidadId: number, nivel: string) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

export default function ModalAgregarHabilidad({
  tipo,
  catalogo,
  onClose,
  onSave,
  duplicadoWarning,
}: ModalAgregarHabilidadProps) {
  const filtrado = catalogo.filter((h) => h.tipo === tipo);
  const [habilidadId, setHabilidadId] = useState<number | "">("");
  const [nivel, setNivel] = useState("basico");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!habilidadId) return;
    setLoading(true);
    try {
      const guardado = await onSave(Number(habilidadId), nivel);
      if (guardado === false) return;
      onClose();
    }
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

          {duplicadoWarning && (
            <div className={styles.duplicadoWarning}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {duplicadoWarning}
            </div>
          )}
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
