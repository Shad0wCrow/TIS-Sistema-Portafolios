import styles from "./educacionCard.module.css";
import type { Educacion } from "../../../types/portafolioTypes";

interface EducacionCardProps {
  educaciones: Educacion[];
  onAdd: () => void;
  onRemove: (id: number) => void;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Presente";
  const [y, m] = fecha.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

export default function EducacionCard({ educaciones, onAdd, onRemove }: EducacionCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Formación Académica</span>
          <span className={styles.cardCount}>{educaciones.length} registro{educaciones.length !== 1 ? "s" : ""}</span>
        </div>
        <button className={styles.btnAdd} onClick={onAdd}>
          <span>+</span> Agregar
        </button>
      </div>

      {educaciones.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎓</span>
          <p className={styles.emptyText}>No hay formación académica registrada.</p>
          <p className={styles.emptySubText}>Agrega institutos o universidades donde hayas estudiado.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {educaciones.map((edu) => (
            <li key={edu.id_educacion} className={styles.item}>
              <div className={styles.itemIcon}>🎓</div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{edu.titulo}</span>
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
                <span className={`${styles.badge} ${edu.visibilidad === "publico" ? styles.badgePublic : styles.badgePrivate}`}>
                  {edu.visibilidad === "publico" ? "Público" : "Privado"}
                </span>
                <button
                  className={styles.btnRemove}
                  onClick={() => onRemove(edu.id_educacion)}
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}