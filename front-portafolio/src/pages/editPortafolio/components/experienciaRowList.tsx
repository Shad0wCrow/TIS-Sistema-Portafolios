import styles from "./experienciaRowList.module.css";
import type { Experiencia } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface Props {
  experiencias: Experiencia[];
  onEdit: (e: Experiencia) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
  activeAction?: SectionAction;
}

function formatFecha(fecha: string) {
  const [year, month] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(month, 10) - 1]} ${year}`;
}

export default function ExperienciaRowList({
  experiencias,
  onEdit,
  onRemove,
  activeAction,
}: Props) {
  const showEdit = activeAction === "editar"; 
  const showRemove = activeAction === "eliminar";
  
  const isActionActive = showEdit || showRemove;
  const actionText = showEdit ? "SELECCIONA LA EXPERIENCIA A EDITAR" : showRemove ? "SELECCIONA LA EXPERIENCIA A ELIMINAR" : "";

  return (
    <div className={styles.container}>
      {experiencias.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💼</span>
          <p>Sin experiencia laboral registrada</p>
        </div>
      )}

      <div className={styles.list}>
        {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
        {experiencias.map((exp) => (
          <div 
            key={exp.id_experiencia} 
            className={`${styles.card} ${isActionActive ? styles.itemClickable : ""}`}
            onClick={() => {
              if (showEdit) onEdit(exp);
              if (showRemove) onRemove(exp.id_experiencia);
            }}
          >
            <div className={styles.cardTimeline}>
              <span className={styles.timelineDot} />
              <span className={styles.timelineLine} />
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <div className={styles.cardMain}>
                  <span className={styles.puesto}>{exp.puesto}</span>
                  <span className={styles.empresa}>{exp.nombre_empresa}</span>
                </div>

                <div className={styles.cardMeta}>
                  {exp.tipo && <span className={styles.badge}>{exp.tipo}</span>}
                  {exp.visibilidad === "privado" && (
                    <span className={`${styles.badge} ${styles.badgePrivado}`}>Privado</span>
                  )}
                </div>
              </div>

              <div className={styles.cardDetails}>
                {exp.ubicacion && (
                  <span className={styles.detail}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {exp.ubicacion}
                  </span>
                )}

                <span className={styles.detail}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatFecha(exp.fecha_inicio)} — {exp.es_actual ? "Actualidad" : exp.fecha_fin ? formatFecha(exp.fecha_fin) : "—"}
                </span>
              </div>

              {exp.descripcion && <p className={styles.descripcion}>{exp.descripcion}</p>}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
