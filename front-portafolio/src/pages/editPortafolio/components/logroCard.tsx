import styles from "./logroCard.module.css";
import type { Logro } from "../../../types/portafolioTypes";

interface LogroCardProps {
  logros: Logro[];
  onAdd: () => void;
  onRemove: (id: number) => void;
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "";
  const [y, m] = fecha.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

export default function LogroCard({ logros, onAdd, onRemove }: LogroCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Logros y Reconocimientos</span>
          <span className={styles.cardCount}>
            {logros.length} registro{logros.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button className={styles.btnAdd} onClick={onAdd}>
          <span>+</span> Agregar
        </button>
      </div>

      {logros.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🏅</span>
          <p className={styles.emptyText}>No hay logros registrados.</p>
          <p className={styles.emptySubText}>
            Agrega reconocimientos, premios o certificaciones destacadas.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {logros.map((logro) => (
            <li key={logro.id_logro} className={styles.item}>
              <div className={styles.itemIcon}>🏅</div>

              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{logro.titulo}</span>

                <span className={styles.itemSub}>
                  {logro.entidad_nombre ?? "Entidad no especificada"}
                </span>

                {logro.fecha_obtencion && (
                  <span className={styles.itemDates}>
                    {formatFecha(logro.fecha_obtencion)}
                  </span>
                )}

                {logro.identificador && (
                  <span className={styles.itemMeta}>
                    ID: {logro.identificador}
                  </span>
                )}

                {logro.descripcion && (
                  <span className={styles.itemDesc}>
                    {logro.descripcion}
                  </span>
                )}
              </div>

              <div className={styles.itemActions}>
                <span
                  className={`${styles.badge} ${
                    logro.visibilidad === "publico"
                      ? styles.badgePublic
                      : styles.badgePrivate
                  }`}
                >
                  {logro.visibilidad === "publico" ? "Público" : "Privado"}
                </span>

                <button
                  className={styles.btnRemove}
                  onClick={() => onRemove(logro.id_logro)}
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