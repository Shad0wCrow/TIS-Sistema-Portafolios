import { useState, useEffect, useRef, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addEducacion, getSugerenciasInstitucion } from "../../../services/portafolioservice";

interface ModalEducacionProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addEducacion>[0]) => Promise<void>;
}

interface FormErrors {
  institucion?: string;
  titulo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export default function ModalEducacion({ onClose, onSave }: ModalEducacionProps) {
  const [form, setForm] = useState({
    institucion: "",
    titulo: "",
    area_estudio: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    visibilidad: "privado" as "publico" | "privado",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (form.institucion.trim().length < 3) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await getSugerenciasInstitucion(form.institucion);
      setSugerencias(res);
      setMostrarSugerencias(res.length > 0);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.institucion]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const seleccionarSugerencia = (inst: string) => {
    setForm((prev) => ({ ...prev, institucion: inst }));
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (errors.institucion) setErrors((prev) => ({ ...prev, institucion: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.institucion.trim()) newErrors.institucion = "La institución es obligatoria.";
    if (!form.titulo.trim())      newErrors.titulo      = "El título o carrera es obligatorio.";
    if (!form.fecha_inicio)       newErrors.fecha_inicio = "La fecha de inicio es obligatoria.";
    
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin) {
      newErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        institucion:  form.institucion.trim(),
        titulo:       form.titulo.trim(),
        area_estudio: form.area_estudio.trim() || undefined,
        fecha_inicio: form.fecha_inicio,
        fecha_fin:    form.fecha_fin    || undefined,
        descripcion:  form.descripcion.trim() || undefined,
        visibilidad:  form.visibilidad,
      });
     
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
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
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

              
              <div
                className={`${styles.modalField} ${styles.modalFieldFull}`}
                style={{ position: "relative" }}
              >
                <label>Institución / Universidad *</label>
                <input
                  name="institucion"
                  value={form.institucion}
                  onChange={handleChange}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                  placeholder="Ej: Universidad Mayor de San Simón"
                  autoComplete="off"
                  style={errors.institucion ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.institucion && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.institucion}
                  </span>
                )}
                
                {mostrarSugerencias && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--bg3)",
                      border: "1px solid var(--border2)",
                      borderRadius: 7,
                      zIndex: 50,
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      maxHeight: 200,
                      overflowY: "auto",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                  >
                    {sugerencias.map((s) => (
                      <li
                        key={s}
                        onMouseDown={() => seleccionarSugerencia(s)}
                        style={{
                          padding: "9px 12px",
                          fontSize: 13,
                          cursor: "pointer",
                          color: "var(--text)",
                          borderBottom: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg4)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Título / Carrera *</label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Ingeniería de Sistemas"
                  style={errors.titulo ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.titulo && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.titulo}
                  </span>
                )}
              </div>

              
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Facultad / Área de estudio</label>
                <input
                  name="area_estudio"
                  value={form.area_estudio}
                  onChange={handleChange}
                  placeholder="Ej: Facultad de Ciencias y Tecnología"
                />
              </div>

              
              <div className={styles.modalField}>
                <label>Fecha de inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  style={errors.fecha_inicio ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.fecha_inicio && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.fecha_inicio}
                  </span>
                )}
              </div>

              <div className={styles.modalField}>
                <label>Fecha de fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  style={errors.fecha_fin ? { borderColor: "var(--red, #e53e3e)" } : {}}
                />
                {errors.fecha_fin && (
                  <span style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
                    {errors.fecha_fin}
                  </span>
                )}
              </div>


              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Logros, menciones o descripción del período de estudio..."
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
              
              <button className={styles.btnCancel} onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
              
              <button className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}