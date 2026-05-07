import { useState } from "react";
import styles from "./sidebarEdicion.module.css";
import {
  IconPersona,
  IconStar,
  IconFolder,
  IconArrowLeft,
  IconBook,
  IconGraduate,
  IconBriefcase,
  IconHabilidades,
  IconIdiomas,
  IconCertificacion,
} from "./icons";
import type { PortafolioData } from "../../../types/portafolioTypes";

type ActiveSection =
  | "perfil"
  | "habilidades"
  | "proyectos"
  | "educacion"
  | "cursos"
  | "logros"
  | "idiomas"
  | "experiencia"
  | "certificaciones";

export type SectionAction = "mostrar" | "registrar" | "editar" | "eliminar";

interface SidebarEdicionProps {
  perfil: PortafolioData["perfil"] | null;
  nombreCompleto: string;
  activeSection: ActiveSection;
  activeAction: SectionAction;
  proyectosCount: number;
  educacionCount: number;
  cursosCount: number;
  logrosCount: number;
  IdiomasCount: number;
  certificacionesCount: number;
  experienciaCount: number;
  onSectionChange: (section: ActiveSection) => void;
  onActionChange: (action: SectionAction) => void;
  onBack: () => void;
}

/**
 * Qué acciones admite cada sección.
 *
 * - "mostrar"    → siempre disponible
 * - "registrar"  → siempre disponible
 * - "editar"     → solo proyectos, experiencia y habilidades tienen modal de edición
 * - "eliminar"   → siempre disponible (excepto perfil, que no se elimina)
 */
const SECTION_ACTIONS: Record<ActiveSection, SectionAction[]> = {
  perfil:          ["mostrar"],
  habilidades:     ["mostrar", "registrar", "editar", "eliminar"],
  proyectos:       ["mostrar", "registrar", "editar", "eliminar"],
  experiencia:     ["mostrar", "registrar", "eliminar"],
  educacion:       ["mostrar", "registrar", "eliminar"],
  cursos:          ["mostrar", "registrar", "eliminar"],
  logros:          ["mostrar", "registrar", "eliminar"],
  idiomas:         ["mostrar", "registrar", "eliminar"],
  certificaciones: ["mostrar", "registrar", "eliminar"],
};

const ACTION_LABELS: Record<SectionAction, string> = {
  mostrar:   "Mostrar",
  registrar: "Registrar",
  editar:    "Editar",
  eliminar:  "Eliminar",
};

export default function SidebarEdicion({
  perfil,
  nombreCompleto,
  activeSection,
  activeAction,
  proyectosCount,
  educacionCount,
  cursosCount,
  logrosCount,
  IdiomasCount,
  certificacionesCount,
  experienciaCount,
  onSectionChange,
  onActionChange,
  onBack,
}: SidebarEdicionProps) {
  // Controla qué sección tiene el dropdown abierto
  const [openDropdown, setOpenDropdown] = useState<ActiveSection | null>(null);

  const navItems: { key: ActiveSection; label: string; icon: React.ReactNode }[] = [
    { key: "perfil",          label: "Perfil",              icon: <IconPersona />     },
    { key: "habilidades",     label: "Habilidades",         icon: <IconHabilidades /> },
    { key: "proyectos",       label: "Proyectos",           icon: <IconFolder />      },
    { key: "educacion",       label: "Educación",           icon: <IconGraduate />    },
    { key: "cursos",          label: "Cursos",              icon: <IconBook />        },
    { key: "logros",          label: "Logros",              icon: <IconStar />        },
    { key: "idiomas",         label: "Idiomas",             icon: <IconIdiomas />     },
    { key: "experiencia",     label: "Experiencia Laboral", icon: <IconBriefcase />   },
    { key: "certificaciones", label: "Certificaciones",     icon: <IconCertificacion />},
  ];

  const badgeCount: Partial<Record<ActiveSection, number>> = {
    proyectos:       proyectosCount,
    educacion:       educacionCount,
    cursos:          cursosCount,
    logros:          logrosCount,
    idiomas:         IdiomasCount,
    certificaciones: certificacionesCount,
    experiencia:     experienciaCount,
  };

  const handleSectionClick = (key: ActiveSection) => {
    // Si es perfil, va directo a "mostrar" sin dropdown
    if (key === "perfil") {
      onSectionChange(key);
      onActionChange("mostrar");
      setOpenDropdown(null);
      return;
    }
      onSectionChange(key);
      onActionChange("mostrar");
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleActionClick = (section: ActiveSection, action: SectionAction) => {
    onSectionChange(section);
    onActionChange(action);
    setOpenDropdown(null);
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

        {navItems.map(({ key, label, icon }) => {
          const isActive   = activeSection === key;
          const isOpen     = openDropdown === key;
          const actions    = SECTION_ACTIONS[key];
          const hasDropdown = actions.length > 1; // perfil solo tiene "mostrar"

          return (
            <div key={key} className={styles.navGroup}>
              {/* Botón principal de la sección */}
              <button
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={() => handleSectionClick(key)}
                aria-expanded={isOpen}
              >
                {icon}
                <span className={styles.navItemLabel}>{label}</span>
                {(badgeCount[key] ?? 0) > 0 && (
                  <span className={styles.navBadge}>{badgeCount[key]}</span>
                )}
                {hasDropdown && (
                  <span className={`${styles.navChevron} ${isOpen ? styles.navChevronOpen : ""}`}>
                    ‹
                  </span>
                )}
              </button>

              {/* Dropdown de acciones */}
              {isOpen && hasDropdown && (
                <div className={styles.navDropdown}>
                  {actions.map((action) => (
                    <button
                      key={action}
                      className={`${styles.navDropdownItem} ${
                        isActive && activeAction === action ? styles.navDropdownItemActive : ""
                      }`}
                      onClick={() => handleActionClick(key, action)}
                    >
                      {ACTION_LABELS[action]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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