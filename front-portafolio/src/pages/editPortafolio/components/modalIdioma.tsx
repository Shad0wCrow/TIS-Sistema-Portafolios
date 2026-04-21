import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addIdioma } from "../../../services/portafolioservice";

interface ModalIdiomaProps {
  onClose: () => void;
  onSave: (data: Parameters<typeof addIdioma>[0]) => Promise<void>;
}

interface FormErrors {
  nombre?: string;
  nivel?: string;
}

export default function ModalIdioma({ onClose, onSave }: ModalIdiomaProps) {
  const [form, setForm] = useState({
    nombre: "",
    nivel: "",
    visibilidad: "publico" as "publico" | "privado",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre del idioma es obligatorio.";
    }
    if (!form.nivel.trim()) {
      newErrors.nivel = "El nivel es obligatorio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        nombre_idioma: form.nombre.trim(),
        nivel: form.nivel.trim(),
        visibilidad: form.visibilidad,
      });
      setSuccessMsg("¡Idioma registrado correctamente!");
      setTimeout(() => onClose(), 1200);
    } catch (error: any) {
      console.error(error?.response?.data || error);
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Registrar Idioma</span>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: "center", padding: 30 }}>✓ {successMsg}</div>
        ) : (
          <>
            <div className={styles.modalGrid}>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Idioma *</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Inglés, Francés"
                  style={errors.nombre ? errStyle : {}}
                />
                {errMsg(errors.nombre)}
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Nivel *</label>
                <select
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                  style={errors.nivel ? errStyle : {}}
                >
                    <option value="">Selecciona un nivel</option>
                    <option value="a1">A1 - Principiante</option>
                    <option value="a2">A2 - Básico</option>
                    <option value="b1">B1 - Intermedio</option>
                    <option value="b2">B2 - Intermedio alto</option>
                    <option value="c1">C1 - Avanzado</option>
                    <option value="c2">C2 - Maestría</option>
                    <option value="nativo">Nativo</option>
                </select>
                {errMsg(errors.nivel)}
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
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}