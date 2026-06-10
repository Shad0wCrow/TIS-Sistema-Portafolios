import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { IconPersona } from "../../editPortafolio/components/icons";
import styles from "../editarperfil.module.css";

const URL_VALIDA = /^(https?:\/\/.+\..+|data:image\/.+)/;

interface ProfilePhotoFieldProps {
  fotoUrl: string;
  error?: string;
  onChange: (fotoUrl: string) => void;
  onError: (message?: string) => void;
}

export default function ProfilePhotoField({
  fotoUrl,
  error,
  onChange,
  onError,
}: ProfilePhotoFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"upload" | "url">("upload");
  const [modalUrl, setModalUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modalPreview, setModalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleQuitarFoto() {
    onChange("");
    onError(undefined);
  }

  function handleOpenModal() {
    setModalUrl(fotoUrl);
    setModalPreview(fotoUrl || null);
    setModalTab("upload");
    setDragging(false);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setModalUrl("");
    setModalPreview(null);
  }

  function handleModalConfirm() {
    if (modalTab === "url" && modalUrl.trim()) {
      onChange(modalUrl.trim());
      onError(undefined);
    } else if (modalTab === "upload" && modalPreview) {
      onChange(modalPreview);
      onError(undefined);
    }
    setModalOpen(false);
  }

  function loadFile(file?: File) {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setModalPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files?.[0]);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    loadFile(e.target.files?.[0]);
  }

  return (
    <>
      <div className={styles.fotoCard}>
        <div className={styles.fotoLeft}>
          <div className={styles.fotoCircleWrap}>
            <div className={styles.fotoCircle} onClick={handleOpenModal}>
              {fotoUrl.trim() ? (
                <img
                  src={fotoUrl.trim()}
                  alt="Foto de perfil"
                  crossOrigin="anonymous"
                  onError={() => onError("La URL no pudo cargarse. Revisa el enlace.")}
                />
              ) : (
                <IconPersona />
              )}
              <div className={styles.fotoOverlay}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.fotoRight}>
          <div className={styles.fotoMeta}>
            <p className={styles.fotoTitle}>
              {fotoUrl.trim() ? "Foto cargada" : "Sin foto de perfil"}
            </p>
            <p className={styles.fotoSubtitle}>
              {fotoUrl.trim()
                ? "Haz clic en la imagen o en el botón para cambiarla."
                : "Sube una foto o pega una URL pública para mostrarla en tu portafolio."}
            </p>
          </div>

          <div className={styles.fotoActions}>
            <button className={styles.addFotoBtn} type="button" onClick={handleOpenModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {fotoUrl.trim() ? "Cambiar foto" : "Agregar foto"}
            </button>

            {fotoUrl.trim() && (
              <>
                <button className={styles.fotoRemoveBtn} type="button" onClick={handleQuitarFoto}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  Quitar
                </button>
                <div className={styles.fotoUrlPreview}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>
                    {fotoUrl.trim().length > 38 ? fotoUrl.trim().slice(0, 38) + "..." : fotoUrl.trim()}
                  </span>
                </div>
              </>
            )}
          </div>

          {error && <span className={styles.fotoError}>{error}</span>}
        </div>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Foto de perfil</span>
              <button className={styles.modalClose} onClick={handleCloseModal} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalTabs}>
              <button className={`${styles.modalTab} ${modalTab === "upload" ? styles.modalTabActive : ""}`} onClick={() => setModalTab("upload")} type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Subir archivo
              </button>
              <button className={`${styles.modalTab} ${modalTab === "url" ? styles.modalTabActive : ""}`} onClick={() => setModalTab("url")} type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Desde URL
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalTab === "upload" ? (
                <div
                  className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
                  {modalPreview ? (
                    <div className={styles.dropzonePreview}>
                      <img src={modalPreview} alt="Vista previa" crossOrigin="anonymous" />
                      <span className={styles.dropzoneChange}>Haz clic para cambiar</span>
                    </div>
                  ) : (
                    <div className={styles.dropzoneEmpty}>
                      <div className={styles.dropzoneIcon}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className={styles.dropzoneText}>Arrastra tu foto aquí</p>
                      <p className={styles.dropzoneSubtext}>o haz clic para seleccionar · JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.modalUrlTab}>
                  <label className={styles.modalLabel}>URL de la imagen</label>
                  <input
                    className={styles.modalInput}
                    type="url"
                    value={modalUrl}
                    onChange={(e) => {
                      setModalUrl(e.target.value);
                      if (URL_VALIDA.test(e.target.value.trim())) {
                        setModalPreview(e.target.value.trim());
                      } else {
                        setModalPreview(null);
                      }
                    }}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    autoFocus
                  />
                  {modalPreview && (
                    <div className={styles.modalUrlPreview}>
                      <img src={modalPreview} alt="Vista previa" crossOrigin="anonymous" onError={() => setModalPreview(null)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={handleCloseModal} type="button">
                Cancelar
              </button>
              <button className={styles.modalConfirmBtn} onClick={handleModalConfirm} type="button" disabled={modalTab === "url" && !modalUrl.trim()}>
                Aplicar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
