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
  onAdd,
  onRemove,
  activeAction,
}: EducacionCardProps) {
  const showAdd    = activeAction === "registrar";
  const showRemove = activeAction === "eliminar";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Formación Académica</span>
          <span className={styles.cardCount}>
            {educaciones.length} registro{educaciones.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showAdd && (
          <button className={styles.btnAdd} onClick={onAdd} type="button">
            <span>+</span> Agregar
          </button>
        )}
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
          {educaciones.map((edu) => (
            <li key={edu.id_educacion} className={styles.item}>
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

                {showRemove && (
                  <button
                    className={styles.btnRemove}
                    onClick={() => onRemove(edu.id_educacion)}
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