import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Idioma } from "../../../types/portafolioTypes";

interface ModalEditarIdiomaProps {
  idioma: Idioma;
  onClose: () => void;
  onSave: (id: number, data: { nivel: string; visibilidad: "publico" | "privado" }) => Promise<void>;
}

export default function ModalEditarIdioma({ idioma, onClose, onSave }: ModalEditarIdiomaProps) {
  const [form, setForm] = useState({
    nivel: idioma.nivel ?? "",
    visibilidad: (idioma.visibilidad ?? "publico") as "publico" | "privado",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.nivel) {
      setError("El nivel es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      await onSave(idioma.id_usuario_idioma, {
        nivel: form.nivel,
        visibilidad: form.visibilidad,
      });
      setSuccessMsg("¡Idioma actualizado correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar Idioma — {idioma.nombre}</span>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: 30 }}>✓ {successMsg}</div>
        ) : (
          <>
            <div className={styles.modalGrid}>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange}>
                  <option value="">Selecciona un nivel</option>
                  <option value="a1">A1 - Principiante</option>
                  <option value="a2">A2 - Básico</option>
                  <option value="b1">B1 - Intermedio</option>
                  <option value="b2">B2 - Intermedio alto</option>
                  <option value="c1">C1 - Avanzado</option>
                  <option value="c2">C2 - Maestría</option>
                  <option value="nativo">Nativo</option>
                </select>
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Visibilidad</label>
                <select name="visibilidad" value={form.visibilidad} onChange={handleChange}>
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>

              {error && (
                <span style={{ fontSize: 11, color: "var(--red,#e53e3e)", gridColumn: "1/-1" }}>
                  {error}
                </span>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className={styles.loadingContent}>
                    <span className={styles.spinner} aria-hidden="true" />
                    Guardando...
                  </span>
                ) : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}