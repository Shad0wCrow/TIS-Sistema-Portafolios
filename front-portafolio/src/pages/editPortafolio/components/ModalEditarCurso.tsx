import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Curso } from "../../../types/portafolioTypes";
import { ROL_CURSO_LABELS } from "../../../types/portafolioTypes";

type EditableCurso = {
  fecha_fin: string;
  descripcion: string;
  visibilidad: "publico" | "privado";
};

interface ModalEditarCursoProps {
  curso: Curso;
  onClose: () => void;
  onSave: (id: number, data: {
    fecha_fin?: string | null;
    descripcion?: string;
    visibilidad?: "publico" | "privado";
  }) => Promise<void>;
}

export default function ModalEditarCurso({
  curso,
  onClose,
  onSave,
}: ModalEditarCursoProps) {
  const [form, setForm] = useState<EditableCurso>({
    fecha_fin: curso.fecha_fin ?? "",
    descripcion: curso.descripcion ?? "",
    visibilidad: curso.visibilidad ?? "privado",
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
    if (form.fecha_fin && form.fecha_fin < curso.fecha_inicio) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(curso.id_educacion, {
        fecha_fin: form.fecha_fin || null,
        descripcion: form.descripcion.trim() || "",
        visibilidad: form.visibilidad,
      });
      onClose();
    } catch (err) {
      let message = "No se pudo actualizar el curso.";

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
          <span className={styles.modalTitle}>Editar curso</span>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar formulario de edicion de curso"
          >
            x
          </button>
        </div>

            <div className={styles.modalGrid}>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-curso-nombre">Nombre del curso</label>
                <input id="edit-curso-nombre" value={curso.titulo} disabled />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-curso-institucion">Institucion</label>
                <input id="edit-curso-institucion" value={curso.institucion} disabled />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-curso-rol">Rol en el curso</label>
                <input
                  id="edit-curso-rol"
                  value={curso.rol_curso ? ROL_CURSO_LABELS[curso.rol_curso] : "Sin rol"}
                  disabled
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-curso-inicio">Fecha de inicio</label>
                <input
                  id="edit-curso-inicio"
                  type="date"
                  value={curso.fecha_inicio}
                  disabled
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-curso-fin">
                  Fecha de fin
                  {!!curso.fecha_fin && (
                    <span style={{ marginLeft: 6, fontSize: "11px", color: "var(--text3, #888)", fontWeight: 400 }}>
                      &nbsp;(bloqueado)
                    </span>
                  )}
                </label>
                <input
                  id="edit-curso-fin"
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  min={curso.fecha_inicio}
                  onChange={handleChange}
                  disabled={!!curso.fecha_fin}
                  title={
                    curso.fecha_fin
                      ? "La fecha de fin no se puede modificar porque ya fue definida al registrar"
                      : undefined
                  }
                />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-curso-desc">Descripcion</label>
                <textarea
                  id="edit-curso-desc"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Actualiza la descripcion del curso..."
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-curso-vis">Visibilidad</label>
                <select
                  id="edit-curso-vis"
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