import styles from "./educacionCard.module.css";
import type { Educacion } from "../../../types/portafolioTypes";
import { GRADO_LABELS } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface EducacionCardProps {
  educaciones: Educacion[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  activeAction?: SectionAction;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Presente";
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

export default function EducacionCard({
  educaciones,
  onRemove,
  activeAction,
}: EducacionCardProps) {
  const showRemove = activeAction === "eliminar";

  const isActionActive = showRemove;
  const actionText = showRemove ? "SELECCIONA LA FORMACIÓN ACADÉMICA A ELIMINAR" : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Formación Académica</span>
          <span className={styles.cardCount}>
            {educaciones.length} registro{educaciones.length !== 1 ? "s" : ""}
          </span>
        </div>

      </div>

      {educaciones.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎓</span>
          <p className={styles.emptyText}>No hay formación académica registrada.</p>
          <p className={styles.emptySubText}>
            Agrega institutos o universidades donde hayas estudiado.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {educaciones.map((edu) => (
            <li 
              key={edu.id_educacion} 
              className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
              onClick={() => {
                if (showRemove) onRemove(edu.id_educacion);
              }}
              tabIndex={isActionActive ? 0 : undefined}
              role={isActionActive ? "button" : undefined}
              onKeyDown={(e) => {
                if (isActionActive && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  if (showRemove) onRemove(edu.id_educacion);
                }
              }}
            >
              <div className={styles.itemIcon}>🎓</div>

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{edu.titulo}</span>

                {/* HU-8: badge con el grado de formación */}
                {edu.grado && (
                  <span className={styles.itemGrado}>
                    {GRADO_LABELS[edu.grado]}
                  </span>
                )}

                <span className={styles.itemSub}>{edu.institucion}</span>
                {edu.area_estudio && (
                  <span className={styles.itemArea}>{edu.area_estudio}</span>
                )}
                <span className={styles.itemDates}>
                  {formatFecha(edu.fecha_inicio)} — {formatFecha(edu.fecha_fin)}
                </span>
                {edu.descripcion && (
                  <span className={styles.itemDesc}>{edu.descripcion}</span>
                )}
              </div>

              <div className={styles.itemActions}>
                <span
                  className={`${styles.badge} ${
                    edu.visibilidad === "publico" ? styles.badgePublic : styles.badgePrivate
                  }`}
                >
                  {edu.visibilidad === "publico" ? "Público" : "Privado"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
