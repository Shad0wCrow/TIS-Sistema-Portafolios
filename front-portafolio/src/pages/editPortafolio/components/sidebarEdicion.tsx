import styles from "./sidebarEdicion.module.css";
import { IconPersona, IconStar, IconFolder, IconArrowLeft, IconBook, IconGraduate } from "./icons";
import type { PortafolioData } from "../../../types/portafolioTypes";



type ActiveSection = "perfil" | "habilidades" | "proyectos" | "educacion" | "cursos" | "logros";

interface SidebarEdicionProps {
  perfil: PortafolioData["perfil"] | null;
  nombreCompleto: string;
  activeSection: ActiveSection;
  proyectosCount: number;
  educacionCount: number;
  cursosCount: number;
  logrosCount: number;
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
  logrosCount,
  onSectionChange,
  onBack,
}: SidebarEdicionProps) {
  const navItems: { key: ActiveSection; label: string; icon: React.ReactNode }[] = [
    { key: "perfil",      label: "Perfil",      icon: <IconPersona />  },
    { key: "habilidades", label: "Habilidades", icon: <IconStar />     },
    { key: "proyectos",   label: "Proyectos",   icon: <IconFolder />   },
    { key: "educacion",   label: "Educación",   icon: <IconGraduate /> },
    { key: "cursos",      label: "Cursos",      icon: <IconBook />     },
    { key: "logros",      label: "Logros",      icon: <IconStar />     },
  ];

  const badgeCount: Partial<Record<ActiveSection, number>> = {
    proyectos: proyectosCount,
    educacion: educacionCount,
    cursos: cursosCount,
    logros: logrosCount,
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