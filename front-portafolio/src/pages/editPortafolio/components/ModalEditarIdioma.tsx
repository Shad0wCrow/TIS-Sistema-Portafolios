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
      onClose();
    } catch (err) {
      let message = "Error al guardar. Intenta de nuevo.";

      if (err && typeof err === "object" && "response" in err) {
        message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message
          || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar idioma</span>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar formulario de edicion de idioma"
          >
            x
          </button>
        </div>

            <div className={styles.modalGrid}>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-idioma-nombre">Idioma registrado</label>
                <input id="edit-idioma-nombre" value={idioma.nombre} disabled />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-idioma-nivel">Nivel *</label>
                <select id="edit-idioma-nivel" name="nivel" value={form.nivel} onChange={handleChange}>
                  <option value="">Selecciona un nivel</option>
                  <option value="a1">A1 - Principiante</option>
                  <option value="a2">A2 - Basico</option>
                  <option value="b1">B1 - Intermedio</option>
                  <option value="b2">B2 - Intermedio alto</option>
                  <option value="c1">C1 - Avanzado</option>
                  <option value="c2">C2 - Maestria</option>
                  <option value="nativo">Nativo</option>
                </select>
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-idioma-visibilidad">Visibilidad</label>
                <select
                  id="edit-idioma-visibilidad"
                  name="visibilidad"
                  value={form.visibilidad}
                  onChange={handleChange}
                >
                  <option value="publico">Publico</option>
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
              <button className={styles.btnCancel} onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
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
