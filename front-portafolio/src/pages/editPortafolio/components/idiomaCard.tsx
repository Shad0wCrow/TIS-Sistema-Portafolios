import styles from "./idiomaCard.module.css";
import type { Idioma } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface IdiomaCardProps {
  idiomas: Idioma[];
  onAdd: () => void;
  onRemove?: (id: number) => void;
  activeAction?: SectionAction;
}

export default function IdiomaCard({ idiomas, onAdd, onRemove, activeAction }: IdiomaCardProps) {
  const showAdd = activeAction === "registrar";
  const showRemove = activeAction === "eliminar";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Idiomas</span>
          <span className={styles.cardCount}>
            {idiomas.length} registro{idiomas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showAdd && (
          <button className={styles.btnAdd} onClick={onAdd} type="button">
            <span>+</span> Agregar
          </button>
        )}
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
          {idiomas.map((idioma) => (
            <li key={idioma.id_usuario_idioma} className={styles.item}>
              <div className={styles.itemIcon}>🌐</div>

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{idioma.nombre}</span>
                {idioma.nivel && <span className={styles.itemSub}>{idioma.nivel}</span>}
              </div>

              {showRemove && onRemove && (
                <button
                  type="button"
                  className={styles.btnRemove}
                  onClick={() => onRemove(idioma.id_usuario_idioma)}
                  title="Eliminar idioma"
                  aria-label={`Eliminar ${idioma.nombre}`}
                >
                  Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}