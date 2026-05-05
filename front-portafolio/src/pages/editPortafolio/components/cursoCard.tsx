import styles from "./cursoCard.module.css";
import type { Curso } from "../../../types/portafolioTypes";

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

export default function CursoCard({
  cursos,
  onAdd,
  onRemove,
  activeAction,
}: CursoCardProps) {
  const showAdd = activeAction === "registrar";
  const showRemove = activeAction === "eliminar";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Cursos</span>
          <span className={styles.cardCount}>
            {cursos.length} registro{cursos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showAdd && (
          <button className={styles.btnAdd} onClick={onAdd} type="button">
            <span>+</span> Agregar
          </button>
        )}
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
          {cursos.map((curso) => {
            const esActual = curso.fecha_fin === null;
            return (
              <li key={curso.id_educacion} className={styles.item}>
                <div className={styles.itemIcon}>📚</div>

                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{curso.titulo}</span>
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

                  {showRemove && (
                    <button
                      className={styles.btnRemove}
                      onClick={() => onRemove(curso.id_educacion)}
                      title="Eliminar"
                      type="button"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}