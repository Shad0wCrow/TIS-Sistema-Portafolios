import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addLogro } from "../../../services/portafolioservice";

interface ModalLogroProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addLogro>[0]) => Promise<void>;
}

interface FormErrors {
  titulo?: string;
  nombre_entidad?: string;
  fecha_obtencion?: string;
  identificador?: string;
  descripcion?: string;
}

export default function ModalLogro({ onClose, onSave }: ModalLogroProps) {
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
      await onSave({
        titulo: form.titulo.trim(),
        nombre_entidad: form.nombre_entidad.trim(),
        fecha_obtencion: form.fecha_obtencion,
        identificador: form.identificador.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        visibilidad: form.visibilidad,
      });

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
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: 30 }}>
            ✓ {successMsg}
          </div>
        ) : (
          <>
            <div className={styles.modalGrid}>

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
                <input
                  name="nombre_entidad"
                  value={form.nombre_entidad}
                  onChange={handleChange}
                  style={errors.nombre_entidad ? errStyle : {}}
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
                <label>ID Credencial</label>
                <input
                  name="identificador"
                  value={form.identificador}
                  onChange={handleChange}
                />
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
