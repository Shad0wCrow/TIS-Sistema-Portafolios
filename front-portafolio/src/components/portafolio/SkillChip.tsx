import styles from "./SkillChip.module.css";

interface Props {
  nombre: string;
  nivel?: string | null;
  tipo?: "tecnica" | "blanda";
}

export default function SkillChip({ nombre, nivel, tipo = "tecnica" }: Props) {
  return (
    <span className={`${styles.chip} ${tipo === "blanda" ? styles.blanda : ""}`}>
      {nombre}
      {nivel && <span className={styles.level}>{nivel}</span>}
    </span>
  );
}