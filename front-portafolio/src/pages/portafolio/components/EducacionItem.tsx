import type { Educacion } from "../../../types/portafolioTypes";
import { formatFecha } from "./formatFecha";
import styles from "../Portafolio.module.css";

// ── Componente de item de educación ──────────────────────────────────────────
function EducacionItem({ edu }: { edu: Educacion }) {
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>🎓</div>
      <div className={styles.timelineInfo}>
        <span className={styles.timelineTitulo}>{edu.titulo}</span>
        <span className={styles.timelineInstitucion}>{edu.institucion}</span>
        {edu.area_estudio && (
          <span className={styles.timelineArea}>{edu.area_estudio}</span>
        )}
        <span className={styles.timelineFechas}>
          {formatFecha(edu.fecha_inicio)} — {formatFecha(edu.fecha_fin)}
        </span>
        {edu.descripcion && (
          <span className={styles.timelineDesc}>{edu.descripcion}</span>
        )}
      </div>
    </div>
  );
}

export default EducacionItem;
