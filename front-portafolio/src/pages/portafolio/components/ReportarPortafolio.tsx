import { useState } from "react";
import styles from "./ReportarPortafolio.module.css";

const MOTIVOS = [
  { value: "contenido_inapropiado", label: "Contenido inapropiado" },
  { value: "spam", label: "Spam o publicidad no deseada" },
  { value: "perfil_falso", label: "Perfil falso o suplantación de identidad" },
  { value: "informacion_falsa", label: "Información falsa o engañosa" },
  { value: "derechos_autor", label: "Violación de derechos de autor" },
  { value: "acoso", label: "Acoso o comportamiento abusivo" },
  { value: "otro", label: "Otro" },
] as const;

type Motivo = (typeof MOTIVOS)[number]["value"];

interface Props {
  slug: string;
  esPropioPerfil: boolean;
}

type EstadoReporte = "idle" | "loading" | "success" | "ya_reportado" | "error";

export default function ReportarPortafolio({ slug, esPropioPerfil }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState<Motivo | "">("");
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<EstadoReporte>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [motivoError, setMotivoError] = useState(false);

  // CA #6: No renderizar si es el propio perfil
  if (esPropioPerfil) return null;

  const handleAbrir = () => {
    setAbierto(true);
    setEstado("idle");
    setMotivo("");
    setComentario("");
    setMotivoError(false);
    setErrorMsg("");
  };

  const handleCerrar = () => {
    if (estado === "loading") return;
    setAbierto(false);
  };

  const handleEnviar = async () => {
    // CA #4: Validar motivo obligatorio
    if (!motivo) {
      setMotivoError(true);
      return;
    }
    setMotivoError(false);

    try {
      setEstado("loading");
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/api/public/portafolios/${slug}/reportar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          motivo,
          comentario: comentario.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        // CA #5: Ya fue reportado
        setEstado("ya_reportado");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo enviar el reporte.");
      }

      // CA #3: Reporte registrado con éxito
      setEstado("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al enviar el reporte.";
      setErrorMsg(message);
      setEstado("error");
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        className={styles.fab}
        onClick={handleAbrir}
        aria-label="Reportar portafolio"
        title="Reportar portafolio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        <span className={styles.fabLabel}>Reportar</span>
      </button>

      {/* Modal overlay */}
      {abierto && (
        <div
          className={styles.overlay}
          onClick={(e) => { if (e.target === e.currentTarget) handleCerrar(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className={styles.modal}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <div>
                <h2 id="report-modal-title" className={styles.modalTitle}>
                  Reportar portafolio
                </h2>
                <p className={styles.modalSubtitle}>
                  Ayúdanos a mantener la comunidad segura
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleCerrar}
                disabled={estado === "loading"}
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Contenido condicional */}
            {estado === "success" && (
              <div className={styles.feedbackState}>
                <div className={styles.feedbackIcon + " " + styles.feedbackIconSuccess}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className={styles.feedbackTitle}>¡Reporte enviado!</h3>
                <p className={styles.feedbackText}>
                  Gracias por ayudarnos a mantener la calidad de la comunidad. Nuestro equipo revisará este portafolio a la brevedad.
                </p>
                <button type="button" className={styles.btnPrimary} onClick={handleCerrar}>
                  Cerrar
                </button>
              </div>
            )}

            {estado === "ya_reportado" && (
              <div className={styles.feedbackState}>
                <div className={styles.feedbackIcon + " " + styles.feedbackIconWarn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className={styles.feedbackTitle}>Ya has reportado este perfil</h3>
                <p className={styles.feedbackText}>
                  Tu reporte previo ya está registrado y se encuentra bajo revisión por nuestro equipo.
                </p>
                <button type="button" className={styles.btnPrimary} onClick={handleCerrar}>
                  Entendido
                </button>
              </div>
            )}

            {(estado === "idle" || estado === "loading" || estado === "error") && (
              <div className={styles.modalBody}>
                {/* Motivo */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="report-motivo">
                    Motivo del reporte <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="report-motivo"
                      className={`${styles.select} ${motivoError ? styles.selectError : ""}`}
                      value={motivo}
                      onChange={(e) => {
                        setMotivo(e.target.value as Motivo);
                        setMotivoError(false);
                      }}
                      disabled={estado === "loading"}
                    >
                      <option value="">Selecciona un motivo…</option>
                      {MOTIVOS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <svg className={styles.selectChevron} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {motivoError && (
                    <p className={styles.fieldError} role="alert">
                      Debes seleccionar un motivo para continuar.
                    </p>
                  )}
                </div>

                {/* Comentario */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="report-comentario">
                    Comentario adicional <span className={styles.optional}>(opcional)</span>
                  </label>
                  <textarea
                    id="report-comentario"
                    className={styles.textarea}
                    placeholder="Describe brevemente el problema que encontraste…"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    disabled={estado === "loading"}
                    rows={3}
                    maxLength={500}
                  />
                  <p className={styles.charCount}>{comentario.length}/500</p>
                </div>

                {/* Error */}
                {estado === "error" && (
                  <p className={styles.formError} role="alert">{errorMsg}</p>
                )}

                {/* Aviso */}
                <p className={styles.disclaimer}>
                  Los reportes falsos o de mala fe pueden resultar en restricciones en tu cuenta.
                </p>

                {/* Acciones */}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleCerrar}
                    disabled={estado === "loading"}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={handleEnviar}
                    disabled={estado === "loading"}
                  >
                    {estado === "loading" ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />
                        Enviando…
                      </>
                    ) : (
                      "Enviar reporte"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}