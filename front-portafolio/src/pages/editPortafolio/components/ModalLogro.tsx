import { useState } from "react";
import styles from "./modals.module.css";

interface ModalLogroProps {
  onClose: () => void;
  onSave: (data: {
    nombre_entidad: string;
    titulo: string;
    descripcion?: string;
    fecha_obtencion?: string;
    visibilidad?: "publico" | "privado";
  }) => Promise<void>;
}

export default function ModalLogro({ onClose, onSave }: ModalLogroProps) {
  const [titulo, setTitulo] = useState("");
  const [nombreEntidad, setNombreEntidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [visibilidad, setVisibilidad] = useState<"publico" | "privado">("publico");
  const [loading, setLoading] = useState(false);

  // Para evitar fechas futuras (validación backend)
  const today = new Date().toISOString().split("T")[0];

  const submit = async () => {
    if (!titulo || !nombreEntidad || !fecha) return;

    setLoading(true);
    try {
      await onSave({
        nombre_entidad: nombreEntidad,
        titulo,
        descripcion,
        fecha_obtencion: fecha,
        visibilidad,
      });

      onClose();
    } catch (error) {
      console.error("Error al guardar logro", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalSm}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Agregar Logro</span>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalStack}>
          {/* Entidad emisora */}
          <div className={styles.modalField}>
            <label>Entidad emisora</label>
            <input
              value={nombreEntidad}
              onChange={(e) => setNombreEntidad(e.target.value)}
              placeholder="Ej: Coursera, Udemy..."
            />
          </div>

          {/* Título */}
          <div className={styles.modalField}>
            <label>Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Certificación React"
            />
          </div>

          {/* Descripción */}
          <div className={styles.modalField}>
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el logro"
            />
          </div>

          {/* Fecha */}
          <div className={styles.modalField}>
            <label>Fecha de obtención</label>
            <input
              type="date"
              max={today}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Visibilidad */}
          <div className={styles.modalField}>
            <label>Visibilidad</label>
            <select
              value={visibilidad}
              onChange={(e) =>
                setVisibilidad(e.target.value as "publico" | "privado")
              }
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>

          <button
            className={styles.btnSave}
            onClick={submit}
            disabled={loading || !titulo || !nombreEntidad || !fecha}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}