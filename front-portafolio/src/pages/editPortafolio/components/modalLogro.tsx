import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addLogro, getSugerenciasEntidad } from "../../../services/portafolioservice";
import AutocompleteInput from "../../../components/ui/AutocompleteInput/AutocompleteInput";

interface ModalLogroProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addLogro>[0]) => Promise<boolean | void>;
  logrosExistentes?: { identificador?: string | null }[];
  duplicadoWarning?: string;
}

interface FormErrors {
  titulo?: string;
  nombre_entidad?: string;
  fecha_obtencion?: string;
  identificador?: string;
  descripcion?: string;
}

export default function ModalLogro({ onClose, onSave, logrosExistentes = [], duplicadoWarning }: ModalLogroProps) {
  const [form, setForm] = useState({
    titulo: "",
    nombre_entidad: "",
    fecha_obtencion: "",
    identificador: "",
    descripcion: "",
    visibilidad: "publico" as "publico" | "privado",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio.";
    }

    if (!form.nombre_entidad.trim()) {
      newErrors.nombre_entidad = "La entidad emisora es obligatoria.";
    }

    if (!form.fecha_obtencion) {
      newErrors.fecha_obtencion = "La fecha es obligatoria.";
    }

    if (form.fecha_obtencion && form.fecha_obtencion > hoy) {
      newErrors.fecha_obtencion = "La fecha no puede ser futura.";
    }

    if (form.identificador.trim().length > 50) {
      newErrors.identificador = "Máximo 50 caracteres.";
    } else if (form.identificador.trim()) {
      const idNormalizado = form.identificador.trim().toLowerCase();
      const duplicado = logrosExistentes.some(
        (l) => l.identificador && l.identificador.trim().toLowerCase() === idNormalizado
      );
      if (duplicado) {
        newErrors.identificador = "Este ID de credencial ya está registrado en otro logro.";
      }
    }

    if (form.descripcion.trim().length > 255) {
      newErrors.descripcion = "Máximo 255 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const guardado = await onSave({
        titulo: form.titulo.trim(),
        nombre_entidad: form.nombre_entidad.trim(),
        fecha_obtencion: form.fecha_obtencion,
        identificador: form.identificador.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        visibilidad: form.visibilidad,
      });
      if (guardado === false) return;

      setSuccessMsg("¡Logro registrado correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch (error: any) {
      console.error(error?.response?.data || error);
      setErrors({
        titulo: "Error al guardar. Revisa los datos.",
      });
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
          <span className={styles.modalTitle}>Registrar Logro</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar formulario de logro">×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: 30 }}>
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
                <label>Título *</label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  style={errors.titulo ? errStyle : {}}
                />
                {errMsg(errors.titulo)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Entidad emisora *</label>
                <AutocompleteInput
                  name="nombre_entidad"
                  value={form.nombre_entidad}
                  onChange={(v) => setForm((prev) => ({ ...prev, nombre_entidad: v }))}
                  placeholder="Ej: Universidad, Organización..."
                  fetchSuggestions={getSugerenciasEntidad}
                  hasError={!!errors.nombre_entidad}
                  minChars={2}
                />
                {errMsg(errors.nombre_entidad)}
              </div>

              <div className={styles.modalField}>
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha_obtencion"
                  value={form.fecha_obtencion}
                  onChange={handleChange}
                  style={errors.fecha_obtencion ? errStyle : {}}
                />
                {errMsg(errors.fecha_obtencion)}
              </div>

              <div className={styles.modalField}>
                <label htmlFor="logro-id">ID Credencial</label>
                <input
                  id="logro-id"
                  name="identificador"
                  value={form.identificador}
                  onChange={handleChange}
                  aria-describedby={errors.identificador ? "logro-id-err" : undefined}
                  style={errors.identificador ? errStyle : {}}
                />
                {errors.identificador && (
                  <span id="logro-id-err">{errMsg(errors.identificador)}</span>
                )}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            
            <label>Visibilidad</label>
            <select
                name="visibilidad"
                value={form.visibilidad}
                onChange={handleChange}
            >
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
            </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={onClose}>
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
