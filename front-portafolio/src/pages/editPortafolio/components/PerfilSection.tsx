import type { Perfil } from "../../../types/portafolioTypes";
import { IconPersona } from "./icons";
import styles from "../edicionPortafolio.module.css";

interface PerfilSectionProps {
  perfil: Perfil | null;
  nombreCompleto: string;
}

export default function PerfilSection({ perfil, nombreCompleto }: PerfilSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Perfil profesional</span>
      </div>
      <div className={styles.profileGrid}>
        <div className={styles.profilePhoto}>
          <div className={styles.profilePhotoCircle}>
            {perfil?.foto_url
              ? <img src={perfil.foto_url} alt="Foto perfil" />
              : <IconPersona />}
          </div>
          <span className={styles.profilePhotoLabel}>Foto de perfil</span>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>Nombre completo</span>
            <span className={styles.infoValue}>{nombreCompleto}</span>
          </div>
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>Profesión</span>
            <span className={styles.infoValue}>{perfil?.profesion ?? "—"}</span>
          </div>
          <div className={`${styles.infoField} ${styles.infoFieldFull}`}>
            <span className={styles.infoLabel}>Descripción</span>
            <span className={`${styles.infoValue} ${styles.infoValueDim}`}>
              {perfil?.descripcion || "Sin descripción"}
            </span>
          </div>
        </div>
        <div className={styles.profileActions}>
          <div className={styles.contactBlock}>
            <p className={styles.contactLabel}>Teléfono</p>
            <p className={styles.contactValue}>{perfil?.celular ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
