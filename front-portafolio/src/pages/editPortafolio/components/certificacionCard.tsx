import { useState } from "react";
import styles from "./certificacionCard.module.css";
import type { Certificacion } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface CertificacionCardProps {
  certificaciones: Certificacion[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onEdit: (certificacion: Certificacion) => void;
  activeAction?: SectionAction;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "";
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m, 10) - 1]} ${y}`;
}

export default function CertificacionCard({
  certificaciones,
  onRemove,
  onEdit,
  activeAction,
}: CertificacionCardProps) {
  const showRemove = activeAction === "eliminar";
  const showEdit = activeAction === "editar";
  const isActionActive = showRemove || showEdit;
  const actionText = showRemove
    ? "SELECCIONA LA CERTIFICACION A ELIMINAR"
    : showEdit
      ? "SELECCIONA LA CERTIFICACION A EDITAR"
      : "";
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSelect = (cert: Certificacion) => {
    if (showRemove) onRemove(cert.id_certificacion);
    if (showEdit) onEdit(cert);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Certificaciones</span>
          <span className={styles.cardCount}>
            {certificaciones.length} registro{certificaciones.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {certificaciones.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>*</span>
          <p className={styles.emptyText}>No hay certificaciones registradas.</p>
          <p className={styles.emptySubText}>Agrega tus certificaciones profesionales.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {certificaciones.map((cert) => (
            <li
              key={cert.id_certificacion}
              className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
              onClick={() => handleSelect(cert)}
              tabIndex={isActionActive ? 0 : undefined}
              role={isActionActive ? "button" : undefined}
              onKeyDown={(e) => {
                if (!isActionActive) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(cert);
                }
              }}
            >
              {cert.url_imagen ? (
                <img
                  src={cert.url_imagen}
                  alt={cert.nombre}
                  className={styles.itemImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(cert.url_imagen || null);
                  }}
                  style={{ cursor: "zoom-in" }}
                  title="Clic para ver la imagen en grande"
                />
              ) : (
                <div className={styles.itemIcon}>*</div>
              )}

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{cert.nombre}</span>
                <span className={styles.itemSub}>{cert.nombre_entidad}</span>
                <span className={styles.itemDates}>
                  {formatFecha(cert.fecha_obtencion)}
                  {cert.fecha_expiracion && ` - ${formatFecha(cert.fecha_expiracion)}`}
                </span>
                {cert.url_certificado && (
                  <a
                    href={cert.url_certificado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.itemLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver certificado
                  </a>
                )}
              </div>

              <div className={styles.itemActions}>
                <span
                  className={`${styles.badge} ${
                    cert.visibilidad === "publico" ? styles.badgePublic : styles.badgePrivate
                  }`}
                >
                  {cert.visibilidad === "publico" ? "Publico" : "Privado"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "-10px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "32px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <img
              src={previewImage}
              alt="Certificacion en grande"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
