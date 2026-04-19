import type { Proyecto } from "../../types/portafolioTypes";
import styles from "./ProjectCard.module.css";

const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ESTADO_LABEL: Record<Proyecto["estado"], string> = {
  en_progreso: "En progreso",
  finalizado:  "Finalizado",
  pausado:     "Pausado",
};

interface Props {
  proyecto: Proyecto;
}

export default function ProjectCard({ proyecto: p }: Props) {
  return (
    <div className={styles.card}>

      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${styles[`estado_${p.estado}`]}`}>
          {ESTADO_LABEL[p.estado]}
        </span>
      </div>

      <h3 className={styles.title}>{p.titulo}</h3>

      {p.descripcion && <p className={styles.desc}>{p.descripcion}</p>}

      {p.roles?.length > 0 && (
        <div className={styles.roles}>
          {p.roles.map((r, i) => (
            <span key={i} className={styles.roleTag}>{r}</span>
          ))}
        </div>
      )}

      {(p.demo_url || p.repositorio_url) && (
        <div className={styles.links}>
          {p.demo_url && (
            <a href={p.demo_url} target="_blank" rel="noreferrer" className={styles.link}>
              <IconLink /> Demo
            </a>
          )}
          {p.repositorio_url && (
            <a href={p.repositorio_url} target="_blank" rel="noreferrer" className={styles.link}>
              <IconLink /> Repositorio
            </a>
          )}
        </div>
      )}

      {(p.fecha_inicio || p.fecha_fin) && (
        <p className={styles.dates}>
          {p.fecha_inicio ?? "?"} → {p.fecha_fin ?? "presente"}
        </p>
      )}

    </div>
  );
}