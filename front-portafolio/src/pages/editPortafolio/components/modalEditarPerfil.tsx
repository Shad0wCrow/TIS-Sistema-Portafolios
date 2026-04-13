import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { updatePerfil } from "../../../services/portafolioservice";
import type { PortafolioData } from "../../../types/portafolioTypes";

interface ModalEditarPerfilProps {
  perfil: PortafolioData["perfil"] | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof updatePerfil>[0]) => Promise<void>;
}

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const SOLO_NUMEROS = /^\+?[0-9\s\-()]{7,20}$/;
const URL_VALIDA = /^https?:\/\/.+\..+/;
const CARACTERES_PELIGROSOS = /[<>"'`;{}()]/;

function validarForm(form: {
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
  foto_url: string;
}): string | null {
  const algunVacio = Object.values(form).some((v) => !v.trim());
  if (algunVacio) return "No puedes dejar ningún campo vacío.";

  if (!SOLO_LETRAS.test(form.nombre_perfil.trim())) return "El nombre solo puede contener letras.";
  if (form.nombre_perfil.trim().length > 50) return "El nombre no puede superar 50 caracteres.";

  if (!SOLO_LETRAS.test(form.apellido_perfil.trim())) return "El apellido solo puede contener letras.";
  if (form.apellido_perfil.trim().length > 50) return "El apellido no puede superar 50 caracteres.";

  if (CARACTERES_PELIGROSOS.test(form.profesion)) return "La profesión contiene caracteres no permitidos.";
  if (form.profesion.trim().length > 100) return "La profesión no puede superar 100 caracteres.";

  if (!SOLO_NUMEROS.test(form.celular.trim()))
    return "El teléfono solo puede contener números, espacios, +, - o paréntesis (7-20 dígitos).";

  if (CARACTERES_PELIGROSOS.test(form.descripcion)) return "La descripción contiene caracteres no permitidos.";
  if (form.descripcion.length > 300) return "La descripción no puede superar 300 caracteres.";

  if (!URL_VALIDA.test(form.foto_url.trim()))
    return "La URL de foto debe comenzar con http:// o https://.";
  if (form.foto_url.trim().length > 300) return "La URL de foto no puede superar 300 caracteres.";

  return null;
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
  const [error, setError] = useState<string | null>(null);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    const validationError = validarForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
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
            <label>Descripción (máx. 300 caracteres)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} maxLength={300} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>URL de foto</label>
            <input name="foto_url" value={form.foto_url} onChange={handle} placeholder="https://..." />
          </div>
        </div>
        {error && <p className={styles.modalError}>{error}</p>}
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