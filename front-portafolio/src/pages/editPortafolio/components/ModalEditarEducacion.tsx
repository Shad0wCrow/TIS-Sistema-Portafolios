import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Educacion } from "../../../types/portafolioTypes";
import { GRADO_LABELS } from "../../../types/portafolioTypes";

type EditableEducacion = {
  fecha_fin: string;
  descripcion: string;
  visibilidad: "publico" | "privado";
};

interface ModalEditarEducacionProps {
  educacion: Educacion;
  onClose: () => void;
  onSave: (id: number, data: {
    fecha_fin?: string | null;
    descripcion?: string;
    visibilidad?: "publico" | "privado";
  }) => Promise<void>;
}

export default function ModalEditarEducacion({
  educacion,
  onClose,
  onSave,
}: ModalEditarEducacionProps) {
  const [form, setForm] = useState<EditableEducacion>({
    fecha_fin: educacion.fecha_fin ?? "",
    descripcion: educacion.descripcion ?? "",
    visibilidad: educacion.visibilidad ?? "privado",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (form.fecha_fin && form.fecha_fin < educacion.fecha_inicio) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(educacion.id_educacion, {
        fecha_fin: form.fecha_fin || null,
        descripcion: form.descripcion.trim() || "",
        visibilidad: form.visibilidad,
      });
      onClose();
    } catch (err) {
      let message = "No se pudo actualizar el grado de formacion.";

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
          <span className={styles.modalTitle}>Editar grado de formacion</span>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar formulario de edicion"
          >
            x
          </button>
        </div>

        <div className={styles.modalGrid}>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-edu-grado">Grado de formacion</label>
            <input
              id="edit-edu-grado"
              value={educacion.grado ? GRADO_LABELS[educacion.grado] : "Sin grado"}
              disabled
            />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-edu-institucion">Institucion / Universidad</label>
            <input id="edit-edu-institucion" value={educacion.institucion} disabled />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-edu-titulo">Titulo / Carrera</label>
            <input id="edit-edu-titulo" value={educacion.titulo} disabled />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-edu-area">Facultad / Area de estudio</label>
            <input id="edit-edu-area" value={educacion.area_estudio ?? ""} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-edu-inicio">Fecha de inicio</label>
            <input
              id="edit-edu-inicio"
              type="date"
              value={educacion.fecha_inicio}
              disabled
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-edu-fin">
              Fecha de fin
              {!!educacion.fecha_fin && (
                <span style={{ marginLeft: 6, fontSize: "11px", color: "var(--text3, #888)", fontWeight: 400 }}>
                  &nbsp;(bloqueado)
                </span>
              )}
            </label>
            <input
              id="edit-edu-fin"
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              min={educacion.fecha_inicio}
              onChange={handleChange}
              disabled={!!educacion.fecha_fin}
              title={
                educacion.fecha_fin
                  ? "La fecha de fin no se puede modificar porque ya fue definida al registrar"
                  : undefined
              }
            />
          </div>

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-edu-desc">Descripcion</label>
            <textarea
              id="edit-edu-desc"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Actualiza la descripcion del periodo de estudio..."
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-edu-vis">Visibilidad</label>
            <select
              id="edit-edu-vis"
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