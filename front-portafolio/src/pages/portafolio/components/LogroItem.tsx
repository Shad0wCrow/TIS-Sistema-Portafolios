import type { Logro } from "../../../types/portafolioTypes";
import { formatFecha } from "./formatFecha";
import styles from "../Portafolio.module.css";

function LogroItem({ logro }: { logro: Logro }) {
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>🏅</div>
      <div className={styles.timelineInfo}>
        <span className={styles.timelineTitulo}>{logro.titulo}</span>
        <span className={styles.timelineInstitucion}>
          {logro.entidad_nombre ?? "Entidad no especificada"}
        </span>
        {logro.fecha_obtencion && (
          <span className={styles.timelineFechas}>
            {formatFecha(logro.fecha_obtencion)}
          </span>
        )}
        {logro.identificador && (
          <span className={styles.timelineArea}>ID: {logro.identificador}</span>
        )}
        {logro.descripcion && (
          <span className={styles.timelineDesc}>{logro.descripcion}</span>
        )}
      </div>
    </div>
  );
}

export default LogroItem;
