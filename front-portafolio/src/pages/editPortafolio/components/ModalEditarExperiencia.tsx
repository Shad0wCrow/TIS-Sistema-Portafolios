import { useState, type ChangeEvent } from "react";
import styles from "./modalExperiencia.module.css";
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

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar experiencia laboral</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar formulario de edicion">
            x
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-empresa">Empresa</label>
              <input id="edit-exp-empresa" className={styles.input} value={experiencia.nombre_empresa ?? ""} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-puesto">Puesto / Cargo</label>
              <input id="edit-exp-puesto" className={styles.input} value={experiencia.puesto ?? ""} disabled />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-tipo">Tipo de empleo</label>
              <input id="edit-exp-tipo" className={styles.input} value={experiencia.tipo ?? ""} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-ubicacion">Ubicacion</label>
              <input id="edit-exp-ubicacion" className={styles.input} value={experiencia.ubicacion ?? ""} disabled />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-inicio">Fecha de inicio</label>
              <input id="edit-exp-inicio" type="date" className={styles.input} value={experiencia.fecha_inicio} disabled />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-exp-fin">Fecha de fin</label>
              <input
                id="edit-exp-fin"
                type="date"
                name="fecha_fin"
                className={styles.input}
                value={form.fecha_fin}
                min={experiencia.fecha_inicio}
                onChange={handleChange}
              />
            </div>
          </div>

          {experiencia.es_actual && (
            <p className={styles.error} style={{ color: "var(--text3)" }}>
              Al registrar una fecha de fin, la experiencia dejara de marcarse como actual.
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-exp-desc">Descripcion</label>
            <textarea
              id="edit-exp-desc"
              name="descripcion"
              className={styles.textarea}
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-exp-visibilidad">Visibilidad</label>
            <select
              id="edit-exp-visibilidad"
              name="visibilidad"
              className={styles.select}
              value={form.visibilidad}
              onChange={handleChange}
            >
              <option value="publico">Publico</option>
              <option value="privado">Privado</option>
            </select>
          </div>

          {error && <span className={styles.error}>{error}</span>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
