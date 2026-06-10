import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Experiencia } from "../../../types/portafolioTypes";

type EditableExperiencia = {
  fecha_fin: string;
  descripcion: string;
  visibilidad: "publico" | "privado";
};

interface ModalEditarExperienciaProps {
  experiencia: Experiencia;
  onClose: () => void;
  onSave: (id: number, data: {
    fecha_fin?: string | null;
    descripcion?: string | null;
    visibilidad?: "publico" | "privado";
  }) => Promise<void>;
}

export default function ModalEditarExperiencia({
  experiencia,
  onClose,
  onSave,
}: ModalEditarExperienciaProps) {
  const [form, setForm] = useState<EditableExperiencia>({
    fecha_fin: experiencia.fecha_fin ?? "",
    descripcion: experiencia.descripcion ?? "",
    visibilidad: experiencia.visibilidad ?? "publico",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (form.fecha_fin && form.fecha_fin < experiencia.fecha_inicio) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(experiencia.id_experiencia, {
        fecha_fin: form.fecha_fin || null,
        descripcion: form.descripcion.trim() || null,
        visibilidad: form.visibilidad,
      });
      onClose();
    } catch (err) {
      let message = "No se pudo actualizar la experiencia laboral.";

      if (err && typeof err === "object" && "response" in err) {
        message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message
          || message;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const fechaFinBloqueada = !experiencia.es_actual && !!experiencia.fecha_fin;

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalLg}`}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar experiencia laboral</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar formulario de edicion">
            x
          </button>
        </div>

        <div className={styles.modalGrid}>
          <div className={styles.modalField}>
            <label htmlFor="edit-exp-empresa">Empresa</label>
            <input id="edit-exp-empresa" value={experiencia.nombre_empresa ?? ""} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-puesto">Puesto / Cargo</label>
            <input id="edit-exp-puesto" value={experiencia.puesto ?? ""} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-tipo">Tipo de empleo</label>
            <input id="edit-exp-tipo" value={experiencia.tipo ?? ""} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-ubicacion">Ubicacion</label>
            <input id="edit-exp-ubicacion" value={experiencia.ubicacion ?? ""} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-inicio">Fecha de inicio</label>
            <input id="edit-exp-inicio" type="date" value={experiencia.fecha_inicio} disabled />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-fin">Fecha de fin</label>
            <input
              id="edit-exp-fin"
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              min={experiencia.fecha_inicio}
              onChange={handleChange}
              disabled={fechaFinBloqueada}
              title={
                fechaFinBloqueada
                  ? "La fecha de fin no se puede modificar porque ya fue definida al registrar"
                  : undefined
              }
            />
            {fechaFinBloqueada && (
              <span className={styles.fieldHint}>Este campo esta bloqueado porque ya fue definido.</span>
            )}
          </div>

          {experiencia.es_actual && (
            <p className={`${styles.fieldHint} ${styles.modalFieldFull}`}>
              Al registrar una fecha de fin, la experiencia dejara de marcarse como actual.
            </p>
          )}

          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="edit-exp-desc">Descripcion</label>
            <textarea
              id="edit-exp-desc"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Actualiza la descripcion de la experiencia..."
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="edit-exp-visibilidad">Visibilidad</label>
            <select
              id="edit-exp-visibilidad"
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
          <button className={styles.btnCancel} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className={styles.btnSave} onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
