import styles from "./certificacionCard.module.css";
import type { Certificacion } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface CertificacionCardProps {
  certificaciones: Certificacion[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  activeAction?: SectionAction;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "";
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

export default function CertificacionCard({
  certificaciones,
  onAdd,
  onRemove,
  activeAction,
}: CertificacionCardProps) {
  const showAdd = activeAction === "registrar" ;
  const showRemove = activeAction === "eliminar";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Certificaciones</span>
          <span className={styles.cardCount}>
            {certificaciones.length} registro{certificaciones.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showAdd && (
          <button className={styles.btnAdd} onClick={onAdd} type="button">
            <span>+</span> Agregar
          </button>
        )}
      </div>

      {certificaciones.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎓</span>
          <p className={styles.emptyText}>No hay certificaciones registradas.</p>
          <p className={styles.emptySubText}>Agrega tus certificaciones profesionales.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {certificaciones.map((cert) => (
            <li key={cert.id_certificacion} className={styles.item}>
              {cert.imagen_url ? (
                <img
                  src={cert.imagen_url}
                  alt={cert.nombre}
                  className={styles.itemImage}
                />
              ) : (
                <div className={styles.itemIcon}>🎓</div>
              )}

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{cert.nombre}</span>
                <span className={styles.itemSub}>{cert.nombre_entidad}</span>
                <span className={styles.itemDates}>
                  {formatFecha(cert.fecha_obtencion)}
                  {cert.fecha_expiracion && ` — ${formatFecha(cert.fecha_expiracion)}`}
                </span>
                {cert.url_certificado && (
                  <a
                    href={cert.url_certificado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.itemLink}
                  >
                    Ver certificado ↗
                  </a>
                )}
              </div>

              <div className={styles.itemActions}>
                <span
                  className={`${styles.badge} ${
                    cert.visibilidad === "publico" ? styles.badgePublic : styles.badgePrivate
                  }`}
                >
                  {cert.visibilidad === "publico" ? "Público" : "Privado"}
                </span>

                {showRemove && (
                  <button
                    className={styles.btnRemove}
                    onClick={() => onRemove(cert.id_certificacion)}
                    title="Eliminar"
                    type="button"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}