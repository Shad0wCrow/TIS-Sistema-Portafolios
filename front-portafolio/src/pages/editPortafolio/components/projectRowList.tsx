import styles from "./projectRow.module.css";
import { IconPencil, IconPlus, IconImagen } from "./icons";
import type { Proyecto } from "../../types/portafolioTypes";

interface ProjectRowListProps {
  proyectos: Proyecto[];
  onEdit: (proyecto: Proyecto) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
}

export default function ProjectRowList({ proyectos, onEdit, onRemove, onAdd }: ProjectRowListProps) {
  return (
    <div className={styles.projectsCard}>
      <div className={styles.projectsList}>
        {proyectos.length === 0 ? (
          <div className={styles.projEmpty}>
            <p>No hay proyectos aún. ¡Agrega tu primer proyecto!</p>
          </div>
        ) : (
          proyectos.map((p) => (
            <article key={p.id_proyecto} className={styles.projectRow}>
              <div className={styles.projMain}>
                <div className={styles.projTitleRow}>
                  <div>
                    <p className={styles.projTitle}>{p.titulo}</p>
                    <p className={styles.projDates}>{p.fecha_inicio ?? "año ini"} — {p.fecha_fin ?? "año fin"}</p>
                  </div>
                  <div className={styles.projActions}>
                    <button
                      className={`${styles.projBtn} ${styles.projBtnDel}`}
                      onClick={() => onRemove(p.id_proyecto)}
                      title="Eliminar"
                    >
                      ×
                    </button>
                    <button
                      className={`${styles.projBtn} ${styles.projBtnEdit}`}
                      onClick={() => onEdit(p)}
                      title="Editar"
                    >
                      <IconPencil />
                    </button>
                  </div>
                </div>
                <div className={styles.projRoles}>
                  <span className={styles.projRolesLabel}>Roles</span>
                  {p.roles.length === 0
                    ? <span className={styles.projRoleEmpty}>Sin roles</span>
                    : (
                      <div className={styles.projRoleList}>
                        {p.roles.map((r, i) => (
                          <span key={i} className={styles.projRolePill}>{r}</span>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <div className={styles.projDesc}>{p.descripcion || "Sin descripción"}</div>
              <div className={styles.projMedia}>
                <div className={styles.projImgBox}>
                  {p.imagen_principal_url
                    ? <img src={p.imagen_principal_url} alt={p.titulo} />
                    : <IconImagen />}
                </div>
                {p.demo_url && (
                  <a href={p.demo_url} target="_blank" rel="noreferrer" className={styles.projLink}>
                    Ver proyecto
                  </a>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <div className={styles.projectsFooter}>
        <button className={styles.addProjBtn} onClick={onAdd}>
          <IconPlus />
          Agregar proyecto
        </button>
      </div>
    </div>
  );
}