import styles from "./idiomaCard.module.css";
import type { Idioma } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface IdiomaCardProps {
  idiomas: Idioma[];
  onAdd: () => void;
  onRemove?: (id: number) => void;
  onEdit?: (idioma: Idioma) => void;
  activeAction?: SectionAction;
}

export default function IdiomaCard({ idiomas, onRemove, onEdit, activeAction }: IdiomaCardProps) {
  const showRemove = activeAction === "eliminar";
  const showEdit   = activeAction === "editar";

  const isActionActive = showRemove || showEdit;
  const actionText = showRemove
    ? "SELECCIONA EL IDIOMA A ELIMINAR"
    : showEdit
    ? "SELECCIONA EL IDIOMA A EDITAR"
    : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Idiomas</span>
          <span className={styles.cardCount}>
            {idiomas.length} registro{idiomas.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {idiomas.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🌐</span>
          <p className={styles.emptyText}>No hay idiomas registrados.</p>
          <p className={styles.emptySubText}>
            Agrega los idiomas que manejas y tu nivel de dominio.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {idiomas.map((idioma) => (
            <li
              key={idioma.id_usuario_idioma}
              className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
              onClick={() => {
                if (showRemove && onRemove) onRemove(idioma.id_usuario_idioma);
                if (showEdit && onEdit) onEdit(idioma);
              }}
              tabIndex={isActionActive ? 0 : undefined}
              role={isActionActive ? "button" : undefined}
              onKeyDown={(e) => {
                if (isActionActive && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  if (showRemove && onRemove) onRemove(idioma.id_usuario_idioma);
                  if (showEdit && onEdit) onEdit(idioma);
                }
              }}
            >
              <div className={styles.itemIcon}>🌐</div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{idioma.nombre}</span>
                {idioma.nivel && <span className={styles.itemSub}>{idioma.nivel}</span>}
              </div>
              {showEdit && (
                <span style={{
                  fontSize: "0.72rem",
                  color: "var(--color-accent, #4f46e5)",
                  fontWeight: 600,
                  marginLeft: "auto",
                  flexShrink: 0,
                }}>
                  Editar
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
