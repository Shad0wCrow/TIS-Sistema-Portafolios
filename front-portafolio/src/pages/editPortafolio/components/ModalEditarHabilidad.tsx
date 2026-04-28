import { useState } from "react";
import styles from "./modals.module.css";
import type { HabilidadItem } from "../../../types/portafolioTypes";

interface ModalEditarHabilidadProps {
  habilidad: HabilidadItem;
  onClose: () => void;
  onSave: (id: number, nivel: string) => Promise<void>;
}

const NIVELES = ["basico", "intermedio", "avanzado", "experto"] as const;
type Nivel = (typeof NIVELES)[number];

const NIVEL_LABEL: Record<Nivel, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

export default function ModalEditarHabilidad({ habilidad, onClose, onSave }: ModalEditarHabilidadProps) {
  const nivelInicial = (habilidad.nivel ?? "basico") as Nivel;
  const [nivel, setNivel] = useState<Nivel>(nivelInicial);
  const [nivelError, setNivelError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Nivel;
    setNivel(val);
    setNivelError("");
  };

  const handleSave = async () => {
    // CA 7: nivel vacío o inválido no permite guardar
    if (!nivel || !NIVELES.includes(nivel)) {
      setNivelError("Debes seleccionar un nivel válido.");
      return;
    }
    setLoading(true);
    try {
      await onSave(habilidad.id_usuario_habilidad, nivel);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar habilidad</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className={styles.modalStack}>
          {/* CA 3 y 5: campo de habilidad visible pero deshabilitado — no editable */}
          <div className={styles.modalField}>
            <label htmlFor="habilidad-nombre">Habilidad</label>
            <input
              id="habilidad-nombre"
              type="text"
              value={habilidad.nombre}
              disabled
              aria-disabled="true"
              style={{ opacity: 0.55, cursor: "not-allowed" }}
            />
            <span style={{ fontSize: 11, color: "var(--text2)", marginTop: 4, display: "block" }}>
              El nombre de la habilidad no puede modificarse.
            </span>
          </div>

          {/* CA 6 y 7: nivel editable con opciones válidas */}
          <div className={styles.modalField}>
            <label htmlFor="habilidad-nivel">Nivel</label>
            <select
              id="habilidad-nivel"
              value={nivel}
              onChange={handleNivelChange}
            >
              {NIVELES.map((n) => (
                <option key={n} value={n}>{NIVEL_LABEL[n]}</option>
              ))}
            </select>
            {nivelError && (
              <span style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "block" }}>
                {nivelError}
              </span>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loadingContent}>
                <span className={styles.spinner} aria-hidden="true" />
                Guardando...
              </span>
            ) : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}