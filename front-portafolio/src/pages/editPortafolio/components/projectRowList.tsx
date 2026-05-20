import type { ReactNode } from "react";
import styles from "./projectRow.module.css";
import type { Proyecto } from "../../../types/portafolioTypes";

type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface ProjectRowListProps {
  proyectos: Proyecto[];
  onEdit: (proyecto: Proyecto) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
  activeAction?: SectionAction;
  headerAction?: ReactNode;
  importState?: {
    importedUrls: Set<string>;
    importingUrls: Set<string>;
    onImport: (proyecto: Proyecto) => void;
  };
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
  activeAction,
  headerAction,
  importState,
}: ProjectRowListProps) {
  const showEdit = activeAction === "editar";
  const showRemove = activeAction === "eliminar";
  
  const isActionActive = showEdit || showRemove;
  const actionText = showEdit ? "SELECCIONA EL PROYECTO A EDITAR" : showRemove ? "SELECCIONA EL PROYECTO A ELIMINAR" : ""; 

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>Proyectos</span>
          <span className={styles.cardCount}>
            {proyectos.length} registro{proyectos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {headerAction && (
          <div className={styles.headerActions}>
            {headerAction}
          </div>
        )}
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
          {isActionActive && <div className={styles.actionBanner}>{actionText}</div>}
          {proyectos.map((p) => (
            <li 
              key={p.id_proyecto} 
              className={`${styles.item} ${isActionActive ? styles.itemClickable : ""}`}
              onClick={() => {
                if (showEdit) onEdit(p);
                if (showRemove) onRemove(p.id_proyecto);
              }}
              tabIndex={isActionActive ? 0 : undefined}
              role={isActionActive ? "button" : undefined}
              onKeyDown={(e) => {
                if (isActionActive && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  if (showEdit) onEdit(p);
                  if (showRemove) onRemove(p.id_proyecto);
                }
              }}
            >
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

                {p.descripcion && <span className={styles.itemDesc}>{p.descripcion}</span>}

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
                        tabIndex={isActionActive ? -1 : 0}
                        onClick={(e) => {
                          if (isActionActive) e.preventDefault();
                        }}
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
                        tabIndex={isActionActive ? -1 : 0}
                        onClick={(e) => {
                          if (isActionActive) e.preventDefault();
                        }}
                      >
                        Repositorio ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {importState && (
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.btnEdit}
                    disabled={
                      !p.repositorio_url ||
                      importState.importedUrls.has(p.repositorio_url) ||
                      importState.importingUrls.has(p.repositorio_url)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      importState.onImport(p);
                    }}
                  >
                    {p.repositorio_url && importState.importedUrls.has(p.repositorio_url)
                      ? "Importado"
                      : p.repositorio_url && importState.importingUrls.has(p.repositorio_url)
                        ? "Importando..."
                        : "Importar"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
