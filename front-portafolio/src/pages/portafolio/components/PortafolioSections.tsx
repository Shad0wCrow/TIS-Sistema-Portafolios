import { type ReactNode, useState } from "react";
import type { Certificacion } from "../../../types/portafolioTypes";
import { IconEye } from "./PortafolioIcons";
import { formatFecha } from "./portafolioUtils";
import styles from "../Portafolio.module.css";

// ── SectionShell ─────────────────────────────────────────────────────────────

function SectionShell({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.sectionCard}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Sección pública</p>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <span className={styles.sectionCount}>{count}</span>
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
    </div>
  );
}

// ── TimelineItem ─────────────────────────────────────────────────────────────

function TimelineItem({
  title,
  subtitle,
  period,
  description,
  meta,
  extra,
}: {
  title: string;
  subtitle?: string | null;
  period?: string;
  description?: string | null;
  meta?: string[];
  extra?: ReactNode;
}) {
  return (
    <article className={styles.timelineItem}>
      <span className={styles.timelineDot} />
      <div className={styles.timelineContent}>
        <div className={styles.timelineTop}>
          <div className={styles.timelineTitles}>
            <h3 className={styles.timelineName}>{title}</h3>
            {subtitle && <p className={styles.timelineSubtitle}>{subtitle}</p>}
          </div>
          {period && <span className={styles.timelinePeriod}>{period}</span>}
        </div>

        {meta && meta.length > 0 && (
          <div className={styles.metaRow}>
            {meta.map((item) => (
              <span key={item} className={styles.metaPill}>
                {item}
              </span>
            ))}
          </div>
        )}

        {description && <p className={styles.timelineDescription}>{description}</p>}
        {extra}
      </div>
    </article>
  );
}

// ── CertificacionCard ────────────────────────────────────────────────────────

function CertificacionCard({ cert }: { cert: Certificacion }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const vencida = cert.fecha_expiracion ? new Date(cert.fecha_expiracion).getTime() < Date.now() : false;

  return (
    <article className={styles.certCard}>
      {cert.imagen_url ? (
        <img
          className={styles.certImage}
          src={cert.imagen_url}
          alt={cert.nombre}
          onClick={() => setPreviewImage(cert.imagen_url)}
          style={{ cursor: "zoom-in" }}
          title="Clic para ampliar"
        />
      ) : (
        <div className={styles.certImagePlaceholder}>
          <IconEye />
        </div>
      )}

      <div className={styles.certInfo}>
        <div className={styles.certTop}>
          <h3 className={styles.certTitle}>{cert.nombre}</h3>
          <span className={`${styles.certBadge} ${vencida ? styles.certBadgeExpired : styles.certBadgeActive}`}>
            {vencida ? "Vencida" : "Vigente"}
          </span>
        </div>

        <p className={styles.certEntity}>{cert.nombre_entidad}</p>

        <div className={styles.certMeta}>
          <span className={styles.metaPill}>Obtenida: {formatFecha(cert.fecha_obtencion)}</span>
          {cert.fecha_expiracion && (
            <span className={styles.metaPill}>
              {vencida ? `Venció: ${formatFecha(cert.fecha_expiracion)}` : `Vence: ${formatFecha(cert.fecha_expiracion)}`}
            </span>
          )}
        </div>

        {cert.url_certificado && (
          <a href={cert.url_certificado} target="_blank" rel="noreferrer" className={styles.inlineLink}>
            Ver certificado
          </a>
        )}
      </div>

      {previewImage && (
        <div
          className={styles.imageZoomOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <div className={styles.imageZoomContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.imageZoomClose} onClick={() => setPreviewImage(null)}>
              &times;
            </button>
            <img src={previewImage} alt="Certificado ampliado" className={styles.imageZoomImg} />
          </div>
        </div>
      )}
    </article>
  );
}

export { SectionShell, EmptyState, TimelineItem, CertificacionCard };
