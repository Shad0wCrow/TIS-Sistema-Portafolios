import { useState, useEffect, useRef, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addCurso, getSugerenciasCurso } from "../../../services/portafolioservice";


const FORMATOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const TAMANO_MAXIMO_MB = 5;
const TAMANO_MAXIMO_BYTES = TAMANO_MAXIMO_MB * 1024 * 1024;

interface ModalCursoProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addCurso>[0]) => Promise<void>;
}

interface FormErrors {
  nombre_curso?: string;
  institucion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  imagen?: string;
}

export default function ModalCurso({ onClose, onSave }: ModalCursoProps) {
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

  
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

 
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (form.institucion.trim().length < 3) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await getSugerenciasCurso(form.institucion);
      setSugerencias(res);
      setMostrarSugerencias(res.length > 0);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.institucion]);

 
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

  const seleccionarSugerencia = (inst: string) => {
    setForm(prev => ({ ...prev, institucion: inst }));
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (errors.institucion) setErrors(prev => ({ ...prev, institucion: undefined }));
  };

  
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

   
    if (!FORMATOS_PERMITIDOS.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        imagen: `Formato no permitido. Use: JPG, PNG o WEBP.`,
      }));
      e.target.value = "";
      setImagenPreview(null);
      return;
    }
   
    if (file.size > TAMANO_MAXIMO_BYTES) {
      setErrors(prev => ({
        ...prev,
        imagen: `El archivo supera el tamaño máximo de ${TAMANO_MAXIMO_MB} MB.`,
      }));
      e.target.value = "";
      setImagenPreview(null);
      return;
    }

    setErrors(prev => ({ ...prev, imagen: undefined }));
    const reader = new FileReader();
    reader.onload = () => setImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    
    if (!form.nombre_curso.trim()) newErrors.nombre_curso = "El nombre del curso es obligatorio.";
    if (!form.institucion.trim()) newErrors.institucion   = "La institución es obligatoria.";
    if (!form.fecha_inicio)       newErrors.fecha_inicio  = "La fecha de inicio es obligatoria.";

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
      await onSave({
        nombre_curso: form.nombre_curso.trim(),
        institucion:  form.institucion.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin:    form.es_actual ? undefined : (form.fecha_fin || undefined),
        es_actual:    form.es_actual,
        descripcion:  form.descripcion.trim() || undefined,
        visibilidad:  form.visibilidad,
      });
      
      setSuccessMsg("¡Curso registrado correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch {
      setErrors({ nombre_curso: "Error al guardar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  
  const handleCancel = () => onClose();

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

              
              <div className={`${styles.modalField} ${styles.modalFieldFull}`} style={{ position: "relative" }}>
                <label>Institución *</label>
                <input
                  name="institucion"
                  value={form.institucion}
                  onChange={handleChange}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                  placeholder="Ej: Udemy, Coursera, INFOCAL..."
                  autoComplete="off"
                  style={errors.institucion ? errStyle : {}}
                />
                {errMsg(errors.institucion)}

                
                {mostrarSugerencias && (
                  <ul style={{
                    position: "absolute", top: "100%", left: 0, right: 0,
                    background: "var(--bg3)", border: "1px solid var(--border2)",
                    borderRadius: 7, zIndex: 50, margin: 0, padding: 0,
                    listStyle: "none", maxHeight: 200, overflowY: "auto",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}>
                    {sugerencias.map(s => (
                      <li key={s}
                        onMouseDown={() => seleccionarSugerencia(s)}
                        style={{ padding: "9px 12px", fontSize: 13, cursor: "pointer", color: "var(--text)", borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg4)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{s}</li>
                    ))}
                  </ul>
                )}
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
                <label>Fecha de fin{form.es_actual ? " (en curso)" : ""}</label>
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

              
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Imagen del curso <span style={{ color: "var(--text3)", fontWeight: 400 }}>(opcional)</span></label>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  
                  <div style={{
                    width: 80, height: 80, borderRadius: 8, flexShrink: 0,
                    border: "1.5px dashed var(--border2)", background: "var(--bg4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    {imagenPreview
                      ? <img src={imagenPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 24 }}>🖼️</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImagenChange}
                      style={{ fontSize: 12 }}
                    />
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text3)" }}>
                      Formatos: JPG, PNG, WEBP · Máx. {TAMANO_MAXIMO_MB} MB
                    </p>
                    
                    {errors.imagen && (
                      <span style={{ fontSize: 11, color: "var(--red,#e53e3e)", marginTop: 4, display: "block" }}>
                        {errors.imagen}
                      </span>
                    )}
                    {imagenPreview && !errors.imagen && (
                      <button
                        type="button"
                        onClick={() => { setImagenPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        style={{ marginTop: 6, fontSize: 11, color: "var(--text3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        × Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
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
