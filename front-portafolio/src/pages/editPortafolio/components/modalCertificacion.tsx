import { useState, useRef, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addCertificacion, getSugerenciasEntidadEmisora } from "../../../services/portafolioservice";

interface ModalCertificacionProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addCertificacion>[0], imagen: string | null) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

interface FormErrors {
  nombre?: string;
  nombre_entidad?: string;
  fecha_obtencion?: string;
  fecha_expiracion?: string;
  url_certificado?: string;
  imagen?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;

export default function ModalCertificacion({ onClose, onSave, duplicadoWarning }: ModalCertificacionProps) {
  const [form, setForm] = useState({
    nombre: "",
    nombre_entidad: "",
    fecha_obtencion: "",
    fecha_expiracion: "",
    url_certificado: "",
    visibilidad: "publico" as "publico" | "privado",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [verImagenGrande, setVerImagenGrande] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "nombre_entidad") {
      getSugerenciasEntidadEmisora(value).then(setSugerencias).catch(() => setSugerencias([]));
    }
  };

  const handleSugerencia = (s: string) => {
    setForm((prev) => ({ ...prev, nombre_entidad: s }));
    setSugerencias([]);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, imagen: "Formato no permitido. Use JPG, PNG o WEBP." }));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imagen: `El archivo supera los ${MAX_SIZE_MB}MB permitidos.` }));
      return;
    }

    setErrors((prev) => ({ ...prev, imagen: undefined }));
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagenBase64(result);
      setImagenPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.nombre.trim()) newErrors.nombre = "El título es obligatorio.";
    if (!form.nombre_entidad.trim()) newErrors.nombre_entidad = "La entidad emisora es obligatoria.";
    if (!form.fecha_obtencion) newErrors.fecha_obtencion = "La fecha de expedición es obligatoria.";
    if (form.fecha_obtencion && form.fecha_obtencion > hoy)
      newErrors.fecha_obtencion = "La fecha no puede ser futura.";
    if (form.fecha_expiracion && form.fecha_obtencion && form.fecha_expiracion <= form.fecha_obtencion)
      newErrors.fecha_expiracion = "Debe ser posterior a la fecha de expedición.";
    if (form.url_certificado.trim() && !/^https?:\/\/.+/.test(form.url_certificado.trim()))
      newErrors.url_certificado = "URL inválida. Debe comenzar con http:// o https://";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const guardado = await onSave(
        {
          nombre: form.nombre.trim(),
          nombre_entidad: form.nombre_entidad.trim(),
          fecha_obtencion: form.fecha_obtencion,
          fecha_expiracion: form.fecha_expiracion || undefined,
          url_certificado: form.url_certificado.trim() || undefined,
          visibilidad: form.visibilidad,
        },
        imagenBase64
      );
      if (guardado === false) return;
      setSuccessMsg("¡Certificación registrada correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch (error: any) {
      setErrors({ nombre: "Error al guardar. Revisa los datos." });
    } finally {
      setLoading(false);
    }
  };

  const errStyle = { borderColor: "var(--red, #e53e3e)" };
  const errMsg = (msg?: string) =>
    msg ? <span style={{ fontSize: 11, color: "var(--red,#e53e3e)" }}>{msg}</span> : null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Registrar Certificación</span>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: 30 }}>✓ {successMsg}</div>
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
                <label>Título *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} style={errors.nombre ? errStyle : {}} />
                {errMsg(errors.nombre)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`} style={{ position: "relative" }}>
                <label>Entidad emisora *</label>
                <input
                  name="nombre_entidad"
                  value={form.nombre_entidad}
                  onChange={handleChange}
                  autoComplete="off"
                  style={errors.nombre_entidad ? errStyle : {}}
                />
                {errMsg(errors.nombre_entidad)}
                {sugerencias.length > 0 && (
                  <ul style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                    background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7,
                    listStyle: "none", margin: 0, padding: "4px 0", maxHeight: 160, overflowY: "auto",
                  }}>
                    {sugerencias.map((s) => (
                      <li key={s}
                        onClick={() => handleSugerencia(s)}
                        style={{ padding: "7px 12px", cursor: "pointer", fontSize: 13 }}
                      >{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.modalField}>
                <label>Fecha de expedición *</label>
                <input type="date" name="fecha_obtencion" value={form.fecha_obtencion} onChange={handleChange} style={errors.fecha_obtencion ? errStyle : {}} />
                {errMsg(errors.fecha_obtencion)}
              </div>

              <div className={styles.modalField}>
                <label>Fecha de expiración</label>
                <input type="date" name="fecha_expiracion" value={form.fecha_expiracion} onChange={handleChange} style={errors.fecha_expiracion ? errStyle : {}} />
                {errMsg(errors.fecha_expiracion)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>URL del certificado</label>
                <input name="url_certificado" value={form.url_certificado} onChange={handleChange} placeholder="https://..." style={errors.url_certificado ? errStyle : {}} />
                {errMsg(errors.url_certificado)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Imagen del certificado</label>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: "none" }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border2)", background: "var(--bg4)", cursor: "pointer", fontSize: 12 }}>
                  Seleccionar imagen
                </button>
                {errMsg(errors.imagen)}
                {imagenPreview && (
                  <div style={{ marginTop: 8 }}>
                    <img 
                      src={imagenPreview} 
                      alt="preview" 
                      style={{ maxWidth: 160, maxHeight: 100, borderRadius: 7, objectFit: "cover", cursor: "zoom-in" }} 
                      onClick={() => setVerImagenGrande(true)}
                      title="Clic para ver la imagen en tamaño completo"
                    />
                    <button type="button" onClick={() => { setImagenBase64(null); setImagenPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                      style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--text3)", background: "none", border: "none", cursor: "pointer" }}>
                      Quitar imagen
                    </button>
                  </div>
                )}
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
              <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
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

        {verImagenGrande && imagenPreview && (
          <div 
            onClick={() => setVerImagenGrande(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 10000,
              backgroundColor: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center", padding: "20px"
            }}
          >
            <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setVerImagenGrande(false)}
                style={{ position: "absolute", top: "-40px", right: "-10px", background: "transparent", border: "none", color: "#fff", fontSize: "32px", cursor: "pointer" }}
              >
                &times;
              </button>
              <img src={imagenPreview} alt="Vista previa grande" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
