import styles from "./skillCard.module.css";
import { IconPlus, IconPencil } from "./icons";
import type { HabilidadUsuario } from "../../types/portafolioTypes";

interface SkillCardProps {
  tipo: "tecnica" | "blanda";
  lista: HabilidadUsuario[];
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export default function SkillCard({ tipo, lista, onAdd, onRemove }: SkillCardProps) {
  const titulo = tipo === "tecnica" ? "Habilidades técnicas" : "Habilidades blandas";
  const emptyLabel = tipo === "tecnica" ? "habilidades técnicas" : "habilidades blandas";

  return (
    <div className={styles.skillCard}>
      <div className={styles.skillCardHead}>
        <span className={styles.skillCardTitle}>{titulo}</span>
        <span className={styles.skillCountBadge}>{lista.length}</span>
      </div>
      <div className={styles.skillBody}>
        {lista.length === 0
          ? <p className={styles.skillEmpty}>Sin {emptyLabel}</p>
          : (
            <div className={styles.skillTags}>
              {lista.map((h) => (
                <div key={h.id_usuario_habilidad} className={styles.skillTag}>
                  <span>{h.nombre}</span>
                  <button
                    className={styles.skillTagDel}
                    onClick={() => onRemove(h.id_usuario_habilidad)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
      <div className={styles.skillFooter}>
        <button className={`${styles.btnSm} ${styles.btnSmAccent}`} onClick={onAdd}>
          <IconPlus /> Agregar
        </button>
        <button className={`${styles.btnSm} ${styles.btnSmGhost}`} onClick={onAdd}>
          <IconPencil /> Editar
        </button>
      </div>
    </div>
  );
}