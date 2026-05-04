import type { Curso } from "../../../types/portafolioTypes";
import { formatFecha } from "./formatFecha";
import styles from "../Portafolio.module.css";

// ── Componente de item de curso ───────────────────────────────────────────────
function CursoItem({ curso }: { curso: Curso }) {
  const esActual = curso.fecha_fin === null;
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>📚</div>
      <div className={styles.timelineInfo}>
        <div className={styles.timelineTituloRow}>
          <span className={styles.timelineTitulo}>{curso.titulo}</span>
          {esActual && <span className={styles.badgeActual}>En curso</span>}
        </div>
        <span className={styles.timelineInstitucion}>{curso.institucion}</span>
        <span className={styles.timelineFechas}>
          {formatFecha(curso.fecha_inicio)} — {esActual ? "En curso" : formatFecha(curso.fecha_fin)}
        </span>
        {curso.descripcion && (
          <span className={styles.timelineDesc}>{curso.descripcion}</span>
        )}
      </div>
    </div>
  );
}

export default CursoItem;
