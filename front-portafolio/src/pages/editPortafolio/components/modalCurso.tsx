import { useState, useEffect, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addCurso, getSugerenciasCurso } from "../../../services/portafolioservice";
import AutocompleteInput from "../../../components/ui/AutocompleteInput/AutocompleteInput";

interface ModalCursoProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addCurso>[0]) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

interface FormErrors {
  nombre_curso?: string;
  institucion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export default function ModalCurso({ onClose, onSave, duplicadoWarning }: ModalCursoProps) {
  const [form, setForm] = useState({
    nombre_curso: "",
    institucion: "",
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

    if (!form.nombre_curso.trim()) newErrors.nombre_curso = "El nombre del curso es obligatorio.";
    if (!form.institucion.trim()) newErrors.institucion = "La institución es obligatoria.";
    if (!form.fecha_inicio) newErrors.fecha_inicio = "La fecha de inicio es obligatoria.";

    if (form.fecha_inicio && form.fecha_fin) {
      if (form.fecha_inicio > form.fecha_fin) {
        newErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
      }
      if (!form.es_actual && form.fecha_fin > hoy) {
        newErrors.fecha_fin = "La fecha de fin no puede ser futura si el curso no está marcado como «en curso».";
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
        nombre_curso: form.nombre_curso.trim(),
        institucion: form.institucion.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.es_actual ? undefined : (form.fecha_fin || undefined),
        es_actual: form.es_actual,
        descripcion: form.descripcion.trim() || undefined,
        visibilidad: form.visibilidad,
      });
      if (guardado === false) return;

      setSuccessMsg("¡Curso registrado correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch {
      setErrors({ nombre_curso: "Error al guardar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  const errStyle = { borderColor: "var(--red, #e53e3e)" };
  const errMsg = (msg?: string) =>
    msg ? <span style={{ fontSize: 11, color: "var(--red,#e53e3e)", marginTop: 2 }}>{msg}</span> : null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Registrar Curso</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--accent)", fontWeight: 700, fontSize: 15 }}>
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
                <label>Nombre del curso *</label>
                <input
                  name="nombre_curso"
                  value={form.nombre_curso}
                  onChange={handleChange}
                  placeholder="Ej: Desarrollo Web con React"
                  style={errors.nombre_curso ? errStyle : {}}
                />
                {errMsg(errors.nombre_curso)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Institución *</label>
                <AutocompleteInput
                  name="institucion"
                  value={form.institucion}
                  onChange={(v) => {
                    setForm(prev => ({ ...prev, institucion: v }));
                    if (errors.institucion) setErrors(prev => ({ ...prev, institucion: undefined }));
                  }}
                  placeholder="Ej: Udemy, Coursera, INFOCAL..."
                  fetchSuggestions={getSugerenciasCurso}
                  hasError={!!errors.institucion}
                  minChars={3}
                />
                {errMsg(errors.institucion)}
              </div>

              <div className={styles.modalField}>
                <label>Fecha de inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  style={errors.fecha_inicio ? errStyle : {}}
                />
                {errMsg(errors.fecha_inicio)}
              </div>

              <div className={styles.modalField}>
                <label>Fecha de fin {form.es_actual ? "(en curso)" : ""}</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  disabled={form.es_actual}
                  style={{
                    ...(errors.fecha_fin ? errStyle : {}),
                    ...(form.es_actual ? { opacity: 0.45, cursor: "not-allowed" } : {}),
                  }}
                />
                {errMsg(errors.fecha_fin)}
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
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Actualmente en curso</span>
                </label>
                <p style={{ margin: "4px 0 0 23px", fontSize: 11, color: "var(--text3)" }}>
                  Marca esta opción si el curso aún no ha finalizado.
                </p>
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Temas cubiertos, plataforma, logros..."
                />
              </div>

              <div className={styles.modalField}>
                <label>Visibilidad</label>
                <select name="visibilidad" value={form.visibilidad} onChange={handleChange}>
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>

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
          </>
        )}
      </div>
    </div>
  );
}
