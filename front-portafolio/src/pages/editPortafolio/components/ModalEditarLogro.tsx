import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Logro } from "../../../types/portafolioTypes";

type EditableLogro = {
  descripcion: string;
  visibilidad: "publico" | "privado";
};

interface ModalEditarLogroProps {
  logro: Logro;
  onClose: () => void;
  onSave: (id: number, data: {
    descripcion?: string;
    visibilidad?: "publico" | "privado";
  }) => Promise<void>;
}

export default function ModalEditarLogro({
  logro,
  onClose,
  onSave,
}: ModalEditarLogroProps) {
  const [form, setForm] = useState<EditableLogro>({
    descripcion: logro.descripcion ?? "",
    visibilidad: logro.visibilidad ?? "publico",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (form.descripcion.trim().length > 255) {
      setError("La descripcion no puede superar 255 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(logro.id_logro, {
        descripcion: form.descripcion.trim() || "",
        visibilidad: form.visibilidad,
      });
      onClose();
    } catch (err) {
      let message = "No se pudo actualizar el logro.";

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
      <div
        className={`${styles.modal} ${styles.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar logro o reconocimiento</span>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar formulario de edicion de logro"
          >
            x
          </button>
        </div>

        <div className={styles.modalGrid}>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-logro-titulo">Titulo</label>
            <input id="edit-logro-titulo" value={logro.titulo} disabled />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-logro-entidad">Entidad emisora</label>
            <input
              id="edit-logro-entidad"
              value={logro.entidad_nombre ?? "Entidad no especificada"}
              disabled
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-logro-fecha">Fecha</label>
            <input
              id="edit-logro-fecha"
              type="date"
              value={logro.fecha_obtencion ?? ""}
              disabled
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-logro-id">ID Credencial</label>
            <input
              id="edit-logro-id"
              value={logro.identificador ?? ""}
              disabled
            />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-logro-desc">Descripcion</label>
            <textarea
              id="edit-logro-desc"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Actualiza la descripcion del logro..."
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-logro-vis">Visibilidad</label>
            <select
              id="edit-logro-vis"
              name="visibilidad"
              value={form.visibilidad}
              onChange={handleChange}
            >
              <option value="publico">Publico</option>
              <option value="privado">Privado</option>
            </select>
          </div>

          {error && (
            <div className={`${styles.duplicadoWarning} ${styles.modalFieldFull}`} role="alert">
              {error}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
