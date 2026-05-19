import styles from "./cursoCard.module.css";
import type { Curso } from "../../../types/portafolioTypes";
import { ROL_CURSO_LABELS } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface CursoCardProps {
  cursos: Curso[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  activeAction?: SectionAction;
}

function formatFecha(fecha: string | null, esActual: boolean): string {
  if (esActual || !fecha) return "En curso";
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

function formatFechaInicio(fecha: string): string {
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

export default function CursoCard({ cursos, onRemove, activeAction }: CursoCardProps) {
  const showRemove = activeAction === "eliminar";

  const isActionActive = showRemove;
  const actionText = showRemove ? "SELECCIONA EL CURSO A ELIMINAR" : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Cursos</span>
          <span className={styles.cardCount}>
            {cursos.length} registro{cursos.length !== 1 ? "s" : ""}
          </span>
        </div>

      </div>

      {cursos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📚</span>
          <p className={styles.emptyText}>No hay cursos registrados.</p>
          <p className={styles.emptySubText}>
            Agrega cursos, certificaciones o talleres que hayas completado.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {cursos.map((curso) => {
            const esActual = curso.fecha_fin === null;
            return (
              <li 
                key={curso.id_educacion} 
                className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
                onClick={() => {
                  if (showRemove) onRemove(curso.id_educacion);
                }}
              >
                <div className={styles.itemIcon}>📚</div>

                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{curso.titulo}</span>

                  {/* HU-14: badge con el rol en el curso */}
                  {curso.rol_curso && curso.rol_curso !== "no_aplica" && (
                    <span className={styles.itemRol}>
                      {ROL_CURSO_LABELS[curso.rol_curso]}
                    </span>
                  )}

                  <span className={styles.itemSub}>{curso.institucion}</span>
                  <span className={styles.itemDates}>
                    {formatFechaInicio(curso.fecha_inicio)} — {formatFecha(curso.fecha_fin, esActual)}
                  </span>
                  {esActual && <span className={styles.badgeActual}>En curso</span>}
                  {curso.descripcion && (
                    <span className={styles.itemDesc}>{curso.descripcion}</span>
                  )}
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.badge} ${
                      curso.visibilidad === "publico" ? styles.badgePublic : styles.badgePrivate
                    }`}
                  >
                    {curso.visibilidad === "publico" ? "Público" : "Privado"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
