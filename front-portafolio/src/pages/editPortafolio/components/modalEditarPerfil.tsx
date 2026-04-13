import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { updatePerfil } from "../../../services/portafolioservice";
import type { PortafolioData } from "../../../types/portafolioTypes";

interface ModalEditarPerfilProps {
  perfil: PortafolioData["perfil"] | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof updatePerfil>[0]) => Promise<void>;
}

export default function ModalEditarPerfil({ perfil, onClose, onSave }: ModalEditarPerfilProps) {
  const [form, setForm] = useState({
    nombre_perfil: perfil?.nombre_perfil ?? "",
    apellido_perfil: perfil?.apellido_perfil ?? "",
    profesion: perfil?.profesion ?? "",
    celular: perfil?.celular ?? "",
    descripcion: perfil?.descripcion ?? "",
    foto_url: perfil?.foto_url ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try { await onSave(form); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar perfil</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalGrid}>
          <div className={styles.modalField}>
            <label>Nombre</label>
            <input name="nombre_perfil" value={form.nombre_perfil} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Apellido</label>
            <input name="apellido_perfil" value={form.apellido_perfil} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Profesión</label>
            <input name="profesion" value={form.profesion} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Teléfono</label>
            <input name="celular" value={form.celular} onChange={handle} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>Descripción (máx. 200 caracteres)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} maxLength={200} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>URL de foto</label>
            <input name="foto_url" value={form.foto_url} onChange={handle} placeholder="https://..." />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}