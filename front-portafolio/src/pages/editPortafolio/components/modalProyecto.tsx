import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addProyecto } from "../../../services/portafolioservice";
import type { Proyecto } from "../../../types/portafolioTypes";

interface ModalProyectoProps {
  proyecto?: Proyecto | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof addProyecto>[0]) => Promise<void>;
}

export default function ModalProyecto({ proyecto, onClose, onSave }: ModalProyectoProps) {
  const [form, setForm] = useState({
    titulo: proyecto?.titulo ?? "",
    descripcion: proyecto?.descripcion ?? "",
    fecha_inicio: proyecto?.fecha_inicio ?? "",
    fecha_fin: proyecto?.fecha_fin ?? "",
    demo_url: proyecto?.demo_url ?? "",
    repositorio_url: proyecto?.repositorio_url ?? "",
    rolesStr: proyecto?.roles?.join(", ") ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.titulo.trim()) return;
    setLoading(true);
    const roles = form.rolesStr.split(",").map((r) => r.trim()).filter(Boolean);
    try { await onSave({ ...form, roles }); onClose(); }
    finally { setLoading(false); }
  };

return (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
      
      <div className={styles.modalHead}>
        <span className={styles.modalTitle}>
          {proyecto ? "Editar proyecto" : "Nuevo proyecto"}
        </span>
        <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
      </div>

      <div className={styles.modalGrid}>

        {/* TÍTULO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label>Título *</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handle}
            placeholder="Nombre del proyecto"
            disabled={!!proyecto} // 🔒 bloqueado en edición
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handle}
            placeholder="Describe el proyecto..."
          />
        </div>

        {/* FECHA INICIO */}
        <div className={styles.modalField}>
          <label>Fecha inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handle}
            disabled={!!proyecto} // 🔒 bloqueado en edición
          />
        </div>

        {/* FECHA FIN */}
        <div className={styles.modalField}>
          <label>Fecha fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handle}
            disabled={!!proyecto} // 🔒 bloqueado en edición
          />
        </div>

        {/* ROLES */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label>Roles trabajados (separados por coma)</label>
          <input
            name="rolesStr"
            value={form.rolesStr}
            onChange={handle}
            placeholder="Frontend, Backend, DevOps"
            disabled={!!proyecto} // 🔒 bloqueado en edición
          />
        </div>

        {/* DEMO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label>URL Demo / Enlace</label>
          <input
            name="demo_url"
            value={form.demo_url}
            onChange={handle}
            placeholder="https://..."
          />
        </div>

        {/* REPO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label>URL Repositorio</label>
          <input
            name="repositorio_url"
            value={form.repositorio_url}
            onChange={handle}
            placeholder="https://github.com/..."
          />
        </div>

      </div>

      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onClose}>
          Cancelar
        </button>

        <button
          className={styles.btnSave}
          onClick={submit}
          disabled={loading || !form.titulo.trim()}
        >
          {loading ? (
            <span className={styles.loadingContent}>
              <span className={styles.spinner} aria-hidden="true" />
              Guardando...
            </span>
          ) : "Guardar proyecto"}
        </button>
      </div>

    </div>
  </div>
);
}
