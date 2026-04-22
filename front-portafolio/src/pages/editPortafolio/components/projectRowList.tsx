import styles from "./projectRow.module.css";
import { IconPencil, IconPlus } from "./icons";
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

export default function ProjectRowList({ proyectos, onEdit, onRemove, onAdd }: ProjectRowListProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Proyectos</span>
          <span className={styles.cardCount}>
            {proyectos.length} registro{proyectos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button className={styles.btnAdd} onClick={onAdd}>
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
              <div className={styles.itemInfo}>
                <div className={styles.itemTitleRow}>
                  <span className={styles.itemTitle}>{p.titulo}</span>
                  <span className={`${styles.estadoBadge} ${styles[`estado_${p.estado}`]}`}>
                    {ESTADO_LABEL[p.estado]}
                  </span>
                </div>

                {(p.fecha_inicio || p.fecha_fin) && (
                  <span className={styles.itemDates}>
                    {p.fecha_inicio ?? "—"} — {p.fecha_fin ?? "Actualidad"}
                  </span>
                )}

                {p.descripcion && (
                  <span className={styles.itemDesc}>{p.descripcion}</span>
                )}

                {p.roles.length > 0 && (
                  <div className={styles.roleList}>
                    {p.roles.map((r, i) => (
                      <span key={i} className={styles.rolePill}>{r}</span>
                    ))}
                  </div>
                )}

                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.demoLink}
                  >
                    Ver proyecto ↗
                  </a>
                )}
              </div>

              <div className={styles.itemActions}>
                <button
                  className={styles.btnEdit}
                  onClick={() => onEdit(p)}
                  title="Editar"
                >
                  <IconPencil />
                  Editar
                </button>
                <button
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

      <div className={styles.cardFooter}>
        <button className={styles.addBtn} onClick={onAdd}>
          <IconPlus />
          Agregar proyecto
        </button>
      </div>
    </div>
  );
}