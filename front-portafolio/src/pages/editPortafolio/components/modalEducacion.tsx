import { useState, useEffect, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addEducacion, getSugerenciasInstitucion } from "../../../services/portafolioservice";
import AutocompleteInput from "../../../components/ui/AutocompleteInput/AutocompleteInput";

interface ModalEducacionProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addEducacion>[0]) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

interface FormErrors {
  institucion?: string;
  titulo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export default function ModalEducacion({ onClose, onSave, duplicadoWarning }: ModalEducacionProps) {
  const [form, setForm] = useState({
    institucion: "",
    titulo: "",
    area_estudio: "",
    fecha_inicio: "",
    fecha_fin: "",
    es_actual: false,
    descripcion: "",
    visibilidad: "privado" as "publico" | "privado",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (form.es_actual) {
      setForm(prev => ({ ...prev, fecha_fin: "" }));
      setErrors(prev => ({ ...prev, fecha_fin: undefined }));
    }
  }, [form.es_actual]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name } = target;
    const value = target.type === "checkbox"
      ? (target as HTMLInputElement).checked
      : target.value;

    setForm(prev => ({ ...prev, [name]: value }));
    if (name !== "es_actual" && errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.institucion.trim()) newErrors.institucion = "La institución es obligatoria.";
    if (!form.titulo.trim()) newErrors.titulo = "El título o carrera es obligatorio.";
    if (!form.fecha_inicio) newErrors.fecha_inicio = "La fecha de inicio es obligatoria.";

    if (form.fecha_inicio && form.fecha_fin) {
      if (form.fecha_inicio > form.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
      }
      if (!form.es_actual && form.fecha_fin > hoy) {
        newErrors.fecha_fin = "La fecha de fin no puede ser futura si no está marcada como «actual».";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const guardado = await onSave({
        institucion: form.institucion.trim(),
        titulo: form.titulo.trim(),
        area_estudio: form.area_estudio.trim() || undefined,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.es_actual ? undefined : (form.fecha_fin || undefined),
        es_actual: form.es_actual as any,
        descripcion: form.descripcion.trim() || undefined,
        visibilidad: form.visibilidad,
      });
      if (guardado === false) return;

      setSuccessMsg("¡Educación registrada correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch {
      setErrors({ institucion: "Error al guardar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => onClose();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Registrar Educación</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar formulario de educación">
            ×
          </button>
        </div>

        {successMsg ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "var(--accent)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            ✓ {successMsg}
          </div>
        ) : (
          <>
            <div className={styles.modalGrid}>
              {duplicadoWarning && (
                <div className={`${styles.duplicadoWarning} ${styles.modalFieldFull}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {duplicadoWarning}
                </div>
              )}

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edu-institucion">Institución / Universidad *</label>
                <AutocompleteInput
                  name="institucion"
                  value={form.institucion}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, institucion: v }));
                    if (errors.institucion) setErrors((prev) => ({ ...prev, institucion: undefined }));
                  }}
                  placeholder="Ej: Universidad Mayor de San Simón"
                  fetchSuggestions={getSugerenciasInstitucion}
                  hasError={!!errors.institucion}
                  minChars={3}
                />
                {errors.institucion && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.institucion}
                  </span>
                )}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edu-titulo">Título / Carrera *</label>
                <input
                  id="edu-titulo"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Ingeniería de Sistemas"
                  aria-required="true"
                  style={errors.titulo ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.titulo && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.titulo}
                  </span>
                )}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edu-area">Facultad / Área de estudio</label>
                <input
                  id="edu-area"
                  name="area_estudio"
                  value={form.area_estudio}
                  onChange={handleChange}
                  placeholder="Ej: Facultad de Ciencias y Tecnología"
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edu-finicio">Fecha de inicio *</label>
                <input
                  id="edu-finicio"
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  aria-required="true"
                  style={errors.fecha_inicio ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.fecha_inicio && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.fecha_inicio}
                  </span>
                )}
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edu-ffin">Fecha de fin {form.es_actual ? "(actualidad)" : ""}</label>
                <input
                  id="edu-ffin"
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  disabled={form.es_actual}
                  style={{
                    ...(errors.fecha_fin ? { borderColor: "var(--red, #e53e3e)" } : {}),
                    ...(form.es_actual ? { opacity: 0.45, cursor: "not-allowed" } : {}),
                  }}
                />
                {errors.fecha_fin && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.fecha_fin}
                  </span>
                )}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    name="es_actual"
                    checked={form.es_actual}
                    onChange={handleChange}
                    style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Actualmente estudiando aquí</span>
                </label>
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edu-desc">Descripción</label>
                <textarea
                  id="edu-desc"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Logros, menciones o descripción del período de estudio..."
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edu-vis">Visibilidad</label>
                <select id="edu-vis" name="visibilidad" value={form.visibilidad} onChange={handleChange}>
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={handleCancel} disabled={loading}>
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
          </>
        )}
      </div>
    </div>
  );
}
