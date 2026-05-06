import { useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import { addProyecto } from "../../../services/portafolioservice";
import type { Proyecto } from "../../../types/portafolioTypes";

interface ModalProyectoProps {
  proyecto?: Proyecto | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof addProyecto>[0]) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

interface FormErrors {
  titulo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export default function ModalProyecto({ proyecto, onClose, onSave, duplicadoWarning }: ModalProyectoProps) {
  const [form, setForm] = useState({
    titulo: proyecto?.titulo ?? "",
    descripcion: proyecto?.descripcion ?? "",
    fecha_inicio: proyecto?.fecha_inicio ?? "",
    fecha_fin: proyecto?.fecha_fin ?? "",
    demo_url: proyecto?.demo_url ?? "",
    repositorio_url: proyecto?.repositorio_url ?? "",
    rolesStr: proyecto?.roles?.join(", ") ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.titulo.trim()) {
      newErrors.titulo = "El título del proyecto es obligatorio.";
    }
    if (!form.fecha_inicio) {
      newErrors.fecha_inicio = "La fecha de inicio es obligatoria.";
    }
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin) {
      newErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const roles = form.rolesStr.split(",").map((r) => r.trim()).filter(Boolean);
    try {
      const guardado = await onSave({ ...form, roles });
      if (guardado === false) return;
      onClose();
    }
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

        {/* TÍTULO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label htmlFor="proj-titulo">Título *</label>
          <input
            id="proj-titulo"
            name="titulo"
            value={form.titulo}
            onChange={handle}
            placeholder="Nombre del proyecto"
            disabled={!!proyecto}
            aria-required="true"
            aria-describedby={errors.titulo ? "proj-titulo-err" : undefined}
            style={errors.titulo ? { borderColor: "var(--red, #e53e3e)" } : {}}
          />
          {errors.titulo && (
            <span id="proj-titulo-err" style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
              {errors.titulo}
            </span>
          )}
        </div>

        {/* DESCRIPCIÓN */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label htmlFor="proj-desc">Descripción</label>
          <textarea
            id="proj-desc"
            name="descripcion"
            value={form.descripcion}
            onChange={handle}
            placeholder="Describe el proyecto..."
          />
        </div>

        {/* FECHA INICIO */}
        <div className={styles.modalField}>
          <label htmlFor="proj-finicio">Fecha inicio *</label>
          <input
            id="proj-finicio"
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handle}
            disabled={!!proyecto}
            aria-describedby={errors.fecha_inicio ? "proj-finicio-err" : undefined}
            style={errors.fecha_inicio ? { borderColor: "var(--red, #e53e3e)" } : {}}
          />
          {errors.fecha_inicio && (
            <span id="proj-finicio-err" style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
              {errors.fecha_inicio}
            </span>
          )}
        </div>

        {/* FECHA FIN */}
        <div className={styles.modalField}>
          <label htmlFor="proj-ffin">Fecha fin</label>
          <input
            id="proj-ffin"
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handle}
            disabled={!!proyecto}
            aria-describedby={errors.fecha_fin ? "proj-ffin-err" : undefined}
            style={errors.fecha_fin ? { borderColor: "var(--red, #e53e3e)" } : {}}
          />
          {errors.fecha_fin && (
            <span id="proj-ffin-err" style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 2 }}>
              {errors.fecha_fin}
            </span>
          )}
        </div>

        {/* ROLES */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label htmlFor="proj-roles">Roles trabajados (separados por coma)</label>
          <input
            id="proj-roles"
            name="rolesStr"
            value={form.rolesStr}
            onChange={handle}
            placeholder="Frontend, Backend, DevOps"
            disabled={!!proyecto}
          />
        </div>

        {/* DEMO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label htmlFor="proj-demo">URL Demo / Enlace</label>
          <input
            id="proj-demo"
            name="demo_url"
            value={form.demo_url}
            onChange={handle}
            placeholder="https://..."
          />
        </div>

        {/* REPO */}
        <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
          <label htmlFor="proj-repo">URL Repositorio</label>
          <input
            id="proj-repo"
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
          disabled={loading}
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
