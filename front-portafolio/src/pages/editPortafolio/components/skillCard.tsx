import styles from "./skillCard.module.css";
import type { HabilidadItem } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface SkillCardProps {
  tipo: "tecnica" | "blanda";
  lista: HabilidadItem[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onEdit: (habilidad: HabilidadItem) => void;
  activeAction?: SectionAction;
}

const IconTecnica = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconBlanda = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const NIVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

export default function SkillCard({
  tipo,
  lista,
  onAdd,
  onRemove,
  onEdit,
  activeAction,
}: SkillCardProps) {
  const titulo = tipo === "tecnica" ? "Habilidades Técnicas" : "Habilidades Blandas";
  const emptyLabel = tipo === "tecnica" ? "habilidades técnicas" : "habilidades blandas";
  const emptySubLabel =
    tipo === "tecnica"
      ? "Agrega lenguajes, frameworks y herramientas que dominas."
      : "Agrega habilidades interpersonales y de trabajo en equipo.";

  const showAdd = activeAction === "registrar";
  const showEdit = activeAction === "editar";
  const showRemove = activeAction === "eliminar";

  const isActionActive = showEdit || showRemove;
  const actionText = showEdit ? "SELECCIONA LA HABILIDAD A EDITAR" : showRemove ? "SELECCIONA LA HABILIDAD A ELIMINAR" : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>{titulo}</span>
          <span className={styles.cardCount}>
            {lista.length} registro{lista.length !== 1 ? "s" : ""}
          </span>
        </div>

      </div>

      {lista.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            {tipo === "tecnica" ? "💻" : "🤝"}
          </span>
          <p className={styles.emptyText}>No hay {emptyLabel} registradas.</p>
          <p className={styles.emptySubText}>{emptySubLabel}</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {lista.map((h) => (
            <li 
              key={h.id_usuario_habilidad} 
              className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
              onClick={() => {
                if (showEdit) onEdit(h);
                if (showRemove) onRemove(h.id_usuario_habilidad);
              }}
            >
              <div className={styles.itemIconWrap}>
                {tipo === "tecnica" ? <IconTecnica /> : <IconBlanda />}
              </div>

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{h.nombre}</span>
                {h.nivel && (
                  <span className={styles.itemSub}>
                    {NIVEL_LABEL[h.nivel] ?? h.nivel}
                  </span>
                )}
              </div>

              <div className={styles.itemActions}>
                {h.nivel && (
                  <span
                    className={`${styles.badge} ${
                      styles[`badgeNivel_${h.nivel}`] ?? styles.badgeDefault
                    }`}
                  >
                    {NIVEL_LABEL[h.nivel] ?? h.nivel}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}