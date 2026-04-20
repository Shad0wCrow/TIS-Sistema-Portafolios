import styles from "./sidebarEdicion.module.css";
import { IconPersona, IconStar, IconFolder, IconArrowLeft, IconBook } from "./icons";
import type { PortafolioData } from "../../../types/portafolioTypes";

// Ícono de birrete para Educación
const IconGraduate = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.25V16l7 3.85L19 16v-3.75l-7 3.85-7-3.85z" />
  </svg>
);

type ActiveSection = "perfil" | "habilidades" | "proyectos" | "educacion" | "cursos";

interface SidebarEdicionProps {
  perfil: PortafolioData["perfil"] | null;
  nombreCompleto: string;
  activeSection: ActiveSection;
  proyectosCount: number;
  educacionCount: number;
  cursosCount: number;
  onSectionChange: (section: ActiveSection) => void;
  onBack: () => void;
}

export default function SidebarEdicion({
  perfil,
  nombreCompleto,
  activeSection,
  proyectosCount,
  educacionCount,
  cursosCount,
  onSectionChange,
  onBack,
}: SidebarEdicionProps) {
  const navItems: { key: ActiveSection; label: string; icon: React.ReactNode }[] = [
    { key: "perfil",      label: "Perfil",      icon: <IconPersona />  },
    { key: "habilidades", label: "Habilidades", icon: <IconStar />     },
    { key: "proyectos",   label: "Proyectos",   icon: <IconFolder />   },
    { key: "educacion",   label: "Educación",   icon: <IconGraduate /> },
    { key: "cursos",      label: "Cursos",      icon: <IconBook />     },
  ];

  const badgeCount: Partial<Record<ActiveSection, number>> = {
    proyectos: proyectosCount,
    educacion: educacionCount,
    cursos: cursosCount,
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <span className={styles.brandTag}>Portfolio</span>
        <p className={styles.brandName}>Editor</p>
        <p className={styles.brandSub}>Vista de edición</p>
      </div>

      <div className={styles.sidebarAvatar}>
        <div className={styles.avatarCircle}>
          {perfil?.foto_url
            ? <img src={perfil.foto_url} alt="avatar" />
            : <IconPersona />}
        </div>
        <div className={styles.avatarInfo}>
          <p className={styles.avatarName}>{nombreCompleto}</p>
          <p className={styles.avatarRole}>{perfil?.profesion ?? "Profesión"}</p>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <span className={styles.navLabel}>Secciones</span>
        {navItems.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`${styles.navItem} ${activeSection === key ? styles.navItemActive : ""}`}
            onClick={() => onSectionChange(key)}
          >
            {icon}
            {label}
            {(badgeCount[key] ?? 0) > 0 && (
              <span className={styles.navBadge}>{badgeCount[key]}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.backBtn} onClick={onBack}>
          <IconArrowLeft />
          Volver atrás
        </button>
      </div>
    </aside>
  );
}