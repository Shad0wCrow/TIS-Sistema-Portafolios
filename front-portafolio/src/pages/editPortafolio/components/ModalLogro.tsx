import { useState } from "react";
import styles from "./modals.module.css"; // Puedes reutilizar estilos

interface LogroForm {
  titulo: string;
  nombre_entidad: string;
  fecha_obtencion: string;
  descripcion?: string;
  url_credencial?: string;
  identificador?: string;
  visibilidad: "publico" | "privado";
}

interface ModalLogroProps {
  logro?: any; // Para edición futura
  onClose: () => void;
  onSave: (data: LogroForm) => Promise<void>;
}

export default function ModalLogro({
  logro,
  onClose,
  onSave,
}: ModalLogroProps) {
  const [formData, setFormData] = useState<LogroForm>({
    titulo: logro?.titulo || "",
    nombre_entidad: logro?.entidad_emisora?.nombre || "",
    fecha_obtencion: logro?.fecha_obtencion || "",
    descripcion: logro?.descripcion || "",
    url_credencial: logro?.url_credencial || "",
    identificador: logro?.identificador || "",
    visibilidad: logro?.visibilidad || "publico",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{logro ? "Editar Logro" : "Agregar Logro"}</h2>

        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={formData.titulo}
          onChange={handleChange}
        />

        <input
          type="text"
          name="nombre_entidad"
          placeholder="Entidad emisora"
          value={formData.nombre_entidad}
          onChange={handleChange}
        />

        <input
          type="date"
          name="fecha_obtencion"
          value={formData.fecha_obtencion}
          onChange={handleChange}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
        />

        <input
          type="url"
          name="url_credencial"
          placeholder="URL de la credencial"
          value={formData.url_credencial}
          onChange={handleChange}
        />

        <input
          type="text"
          name="identificador"
          placeholder="Identificador"
          value={formData.identificador}
          onChange={handleChange}
        />

        <select
          name="visibilidad"
          value={formData.visibilidad}
          onChange={handleChange}
        >
          <option value="publico">Público</option>
          <option value="privado">Privado</option>
        </select>

        <div className={styles.actions}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
}