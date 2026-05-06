import styles from "./projectRow.module.css";
import { IconPencil } from "./icons";
import type { Proyecto } from "../../../types/portafolioTypes";

interface ProjectRowListProps {
  proyectos: Proyecto[];
  onEdit: (proyecto: Proyecto) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
}

const ESTADO_LABEL: Record<Proyecto["estado"], string> = {
  en_progreso: "En progreso",
  finalizado: "Finalizado",
  pausado: "Pausado",
};

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Actualidad";
  return fecha;
}

function ProjectIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h6" />
      <path d="M7 16h8" />
    </svg>
  );
}

export default function ProjectRowList({
  proyectos,
  onEdit,
  onRemove,
  onAdd,
}: ProjectRowListProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Proyectos</span>
          <span className={styles.cardCount}>
            {proyectos.length} registro{proyectos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button type="button" className={styles.btnAdd} onClick={onAdd}>
          <span>+</span> Agregar
        </button>
      </div>

      {proyectos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🗂️</span>
          <p className={styles.emptyText}>No hay proyectos registrados.</p>
          <p className={styles.emptySubText}>
            Agrega proyectos personales, académicos o profesionales.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {proyectos.map((p) => (
            <li key={p.id_proyecto} className={styles.item}>
              <div className={styles.itemIcon}>
                <ProjectIcon />
              </div>

              <div className={styles.itemInfo}>
                <div className={styles.itemTitleRow}>
                  <span className={styles.itemTitle}>{p.titulo}</span>
                  <span className={`${styles.estadoBadge} ${styles[`estado_${p.estado}`]}`}>
                    {ESTADO_LABEL[p.estado]}
                  </span>
                </div>

                <span className={styles.itemSub}>
                  {formatFecha(p.fecha_inicio)} — {formatFecha(p.fecha_fin)}
                </span>

                {p.descripcion && (
                  <span className={styles.itemDesc}>{p.descripcion}</span>
                )}

                {p.roles?.length > 0 && (
                  <div className={styles.roleList}>
                    {p.roles.map((r, i) => (
                      <span key={i} className={styles.rolePill}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {(p.demo_url || p.repositorio_url) && (
                  <div className={styles.linkRow}>
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.demoLink}
                      >
                        Ver demo ↗
                      </a>
                    )}

                    {p.repositorio_url && (
                      <a
                        href={p.repositorio_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.repoLink}
                      >
                        Repositorio ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => onEdit(p)}
                  title="Editar"
                >
                  <IconPencil />
                  Editar
                </button>

                <button
                  type="button"
                  className={styles.btnRemove}
                  onClick={() => onRemove(p.id_proyecto)}
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
