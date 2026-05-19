import { useState, useEffect } from "react";
import type { Experiencia } from "../../../types/portafolioTypes";
import styles from "./modalExperiencia.module.css";
import AutocompleteInput from "../../../components/ui/AutocompleteInput/AutocompleteInput";
import { getSugerenciasEmpresa } from "../../../services/portafolioservice";

type FormData = {
  nombre_empresa: string;
  puesto: string;
  tipo?: string | undefined;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  es_actual?: boolean;
  ubicacion?: string | null;
  visibilidad?: "publico" | "privado";
};

interface Props {
  experiencia: Experiencia | null;
  onClose: () => void;
  onSave: (data: FormData) => Promise<boolean | void>;
  duplicadoWarning?: string;
}

const TIPOS = ["Tiempo completo", "Medio tiempo", "Freelance", "Prácticas", "Voluntariado", "Contrato"];

const INITIAL: FormData = {
  nombre_empresa: "",
  puesto: "",
  tipo: undefined,
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  es_actual: false,
  ubicacion: "",
  visibilidad: "publico",
};

export default function ModalExperiencia({ experiencia, onClose, onSave, duplicadoWarning }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (experiencia) {
      setForm({
        nombre_empresa: experiencia.nombre_empresa ?? "",
        puesto: experiencia.puesto ?? "",
        tipo: experiencia.tipo ?? undefined,
        descripcion: experiencia.descripcion ?? "",
        fecha_inicio: experiencia.fecha_inicio ?? "",
        fecha_fin: experiencia.fecha_fin ?? "",
        es_actual: experiencia.es_actual ?? false,
        ubicacion: experiencia.ubicacion ?? "",
        visibilidad: experiencia.visibilidad ?? "publico",
      });
    } else {
      setForm(INITIAL);
    }
  }, [experiencia]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.nombre_empresa.trim()) errs.nombre_empresa = "Requerido";
    if (!form.puesto.trim()) errs.puesto = "Requerido";
    if (!form.fecha_inicio) {
      errs.fecha_inicio = "Requerido";
    } else if (form.fecha_inicio > hoy) {
      errs.fecha_inicio = "La fecha no puede ser futura";
    }
    if (!form.es_actual && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      errs.fecha_fin = "Debe ser posterior a la fecha de inicio";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: FormData = {
        ...form,
        tipo: form.tipo || undefined,
        descripcion: form.descripcion || null,
        fecha_fin: form.es_actual ? null : form.fecha_fin || null,
        ubicacion: form.ubicacion || null,
      };
      const guardado = await onSave(payload);
      if (guardado === false) return;
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {experiencia ? "Editar experiencia" : "Nueva experiencia"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {duplicadoWarning && (
            <div className={styles.duplicadoWarning}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {duplicadoWarning}
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Empresa <span className={styles.req}>*</span></label>
              <AutocompleteInput
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={(v) => set("nombre_empresa", v)}
                placeholder="Nombre de la empresa"
                fetchSuggestions={getSugerenciasEmpresa}
                hasError={!!errors.nombre_empresa}
                minChars={2}
              />
              {errors.nombre_empresa && <span className={styles.error}>{errors.nombre_empresa}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Puesto / Cargo <span className={styles.req}>*</span></label>
              <input
                className={`${styles.input} ${errors.puesto ? styles.inputError : ""}`}
                value={form.puesto}
                onChange={(e) => set("puesto", e.target.value)}
                placeholder="Ej: Desarrollador Frontend"
                maxLength={150}
              />
              {errors.puesto && <span className={styles.error}>{errors.puesto}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Tipo de empleo</label>
              <select
                className={styles.select}
                value={form.tipo ?? ""}
                onChange={(e) => set("tipo", e.target.value || undefined)}
              >
                <option value="">Sin especificar</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ubicación</label>
              <input
                className={styles.input}
                value={form.ubicacion ?? ""}
                onChange={(e) => set("ubicacion", e.target.value)}
                placeholder="Ej: Cochabamba, Bolivia"
                maxLength={150}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha de inicio <span className={styles.req}>*</span></label>
              <input
                type="date"
                className={`${styles.input} ${errors.fecha_inicio ? styles.inputError : ""}`}
                value={form.fecha_inicio}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("fecha_inicio", e.target.value)}
              />
              {errors.fecha_inicio && <span className={styles.error}>{errors.fecha_inicio}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Fecha de fin</label>
              <input
                type="date"
                className={`${styles.input} ${errors.fecha_fin ? styles.inputError : ""}`}
                value={form.es_actual ? "" : (form.fecha_fin ?? "")}
                onChange={(e) => set("fecha_fin", e.target.value)}
                disabled={!!form.es_actual}
                min={form.fecha_inicio || undefined}
              />
              {errors.fecha_fin && <span className={styles.error}>{errors.fecha_fin}</span>}
            </div>
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={!!form.es_actual}
              onChange={(e) => set("es_actual", e.target.checked)}
            />
            <span>Trabajo aquí actualmente</span>
          </label>

          <div className={styles.field}>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.textarea}
              value={form.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Describe tus responsabilidades, logros o tecnologías utilizadas..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Visibilidad</label>
            <select
              className={styles.select}
              value={form.visibilidad}
              onChange={(e) => set("visibilidad", e.target.value as "publico" | "privado")}
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className={styles.loadingContent}>
                <span className={styles.spinner} aria-hidden="true" />
                Guardando...
              </span>
            ) : experiencia ? "Guardar cambios" : "Agregar experiencia"}
          </button>
        </div>
      </div>
    </div>
  );
}
