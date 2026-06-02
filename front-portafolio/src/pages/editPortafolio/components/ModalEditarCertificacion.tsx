import { useEffect, useRef, useState, type ChangeEvent } from "react";
import styles from "./modals.module.css";
import type { Certificacion } from "../../../types/portafolioTypes";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;

type CertificacionUpdate = {
  fecha_expiracion?: string | null;
  url_certificado?: string | null;
  url_imagen?: string | null;
  imagen_file?: File;
  visibilidad?: "publico" | "privado";
};

interface ModalEditarCertificacionProps {
  certificacion: Certificacion;
  onClose: () => void;
  onSave: (id: number, data: CertificacionUpdate) => Promise<void>;
}

export default function ModalEditarCertificacion({
  certificacion,
  onClose,
  onSave,
}: ModalEditarCertificacionProps) {
  const [form, setForm] = useState({
    fecha_expiracion: certificacion.fecha_expiracion ?? "",
    url_certificado: certificacion.url_certificado ?? "",
    visibilidad: certificacion.visibilidad ?? "publico",
  });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentImage = certificacion.url_imagen ?? certificacion.imagen_url ?? null;

  useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    };
  }, [imagenPreview]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Use JPG, PNG o WEBP.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_SIZE_MB}MB permitidos.`);
      return;
    }

    setError("");
    setImagenFile(file);
    setImagenPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    const url = form.url_certificado.trim();

    if (form.fecha_expiracion && form.fecha_expiracion <= certificacion.fecha_obtencion) {
      setError("La fecha de expiracion debe ser posterior a la fecha de expedicion.");
      return;
    }

    if (url && !/^https?:\/\/.+/.test(url)) {
      setError("La URL del certificado debe comenzar con http:// o https://.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(certificacion.id_certificacion, {
        fecha_expiracion: form.fecha_expiracion || null,
        url_certificado: url || null,
        imagen_file: imagenFile || undefined,
        visibilidad: form.visibilidad as "publico" | "privado",
      });
      onClose();
    } catch (err) {
      let message = "No se pudo actualizar la certificacion.";

      if (err && typeof err === "object" && "response" in err) {
        message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message
          || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar certificacion</span>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar formulario de edicion de certificacion"
          >
            x
          </button>
        </div>

            <div className={styles.modalGrid}>
              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-cert-nombre">Titulo</label>
                <input id="edit-cert-nombre" value={certificacion.nombre} disabled />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-cert-entidad">Entidad emisora</label>
                <input id="edit-cert-entidad" value={certificacion.nombre_entidad} disabled />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-cert-expedicion">Fecha de expedicion</label>
                <input
                  id="edit-cert-expedicion"
                  type="date"
                  value={certificacion.fecha_obtencion}
                  disabled
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-cert-expiracion">Fecha de expiracion</label>
                <input
                  id="edit-cert-expiracion"
                  type="date"
                  name="fecha_expiracion"
                  value={form.fecha_expiracion}
                  min={certificacion.fecha_obtencion}
                  onChange={handleChange}
                />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-cert-url">URL del certificado</label>
                <input
                  id="edit-cert-url"
                  name="url_certificado"
                  value={form.url_certificado}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label htmlFor="edit-cert-img">Imagen del certificado</label>
                <input
                  id="edit-cert-img"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => fileRef.current?.click()}
                >
                  Seleccionar imagen
                </button>
                {(imagenPreview || currentImage) && (
                  <img
                    src={imagenPreview ?? currentImage ?? ""}
                    alt="Vista previa de certificacion"
                    style={{
                      marginTop: 10,
                      width: 160,
                      maxWidth: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 7,
                      border: "1px solid var(--border2)",
                    }}
                  />
                )}
              </div>

              <div className={styles.modalField}>
                <label htmlFor="edit-cert-vis">Visibilidad</label>
                <select
                  id="edit-cert-vis"
                  name="visibilidad"
                  value={form.visibilidad}
                  onChange={handleChange}
                >
                  <option value="publico">Publico</option>
                  <option value="privado">Privado</option>
                </select>
              </div>

              {error && (
                <div className={`${styles.duplicadoWarning} ${styles.modalFieldFull}`} role="alert">
                  {error}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
      </div>
    </div>
  );
}
