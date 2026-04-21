import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./edicionPortafolio.module.css";
import skillStyles from "./components/skillCard.module.css";
import {
  getPortafolio,
  updatePerfil,
  getCatalogoHabilidades,
  addHabilidad,
  removeHabilidad,
  addProyecto,
  updateProyecto,
  removeProyecto,
  addExperiencia,
  removeExperiencia,
  getExperiencias,
} from "../../services/portafolioservice";
import type {
  PortafolioData,
  HabilidadCatalogo,
  Proyecto,
  Experiencia,
} from "../../types/portafolioTypes";
import SidebarEdicion from "./components/sidebarEdicion";
import SkillCard from "./components/skillCard";
import ProjectRowList from "./components/projectRowList";
import ExperienciaRowList from "./components/experienciaRowList";
import ModalEditarPerfil from "./components/modalEditarPerfil";
import ModalAgregarHabilidad from "./components/modalAgregarHabilidad";
import ModalProyecto from "./components/modalProyecto";
import ModalExperiencia from "./components/modalExperiencia";
import { IconPersona, IconPencil } from "./components/icons";
import ModalAlert from "./components/modalAlert";

type AlertState = { mensaje: string; onConfirm: () => void } | null;

type ModalProyectoState = Proyecto | null | "nuevo";
type ModalExperienciaState = Experiencia | null | "nueva";
type ActiveSection = "perfil" | "habilidades" | "proyectos" | "experiencia";

const SECTION_LABELS: Record<ActiveSection, string> = {
  perfil: "Perfil",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  experiencia: "Experiencia Laboral",
};

export default function EdicionPortafolio() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("perfil");

  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | null>(null);
  const [modalProy, setModalProy] = useState<ModalProyectoState>(null);
  const [modalExp, setModalExp] = useState<ModalExperienciaState>(null);
  const [modalAlert, setModalAlert] = useState<AlertState>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);


  useEffect(() => {
  const cargar = async () => {
      try {
        const [portafolioRes, catalogoRes, experienciasRes] = await Promise.all([
          getPortafolio(),
          getCatalogoHabilidades(),
          getExperiencias(),
        ]);

        setData(portafolioRes);
        setCatalogo(catalogoRes.habilidades ?? []);
        setExperiencias(experienciasRes);
      } catch {
        setErrorPage("Error al cargar el portafolio. Verifica tu conexión.");
      } finally {
        setLoadingPage(false);
      }
    };
    cargar();
  }, []);

  const refreshData = async () => {
  const [portafolioRes, experienciasRes] = await Promise.all([
    getPortafolio(),
    getExperiencias(),
  ]);

  setData(portafolioRes);
  setExperiencias(experienciasRes);
};

  useEffect(() => {
    const cargar = async () => {
      try {
        const [portafolioRes, catalogoRes, experienciasRes] = await Promise.all([
          getPortafolio(),
          getCatalogoHabilidades(),
          getExperiencias(),
        ]);

        setData(portafolioRes);
        setCatalogo(catalogoRes.habilidades ?? []);
        setExperiencias(experienciasRes);
      } catch {
        setErrorPage("Error al cargar el portafolio. Verifica tu conexión.");
      } finally {
        setLoadingPage(false);
      }
    };
    cargar();
  }, []);

  const perfil = data?.perfil ?? null;
  const habilidadesTecnicas = data?.habilidades_tecnicas ?? [];
  const habilidadesBlandas = data?.habilidades_blandas ?? [];
  const proyectos = data?.proyectos ?? [];
  //const experiencias = data?.experiencias ?? [];

  const nombreCompleto = useMemo(() => {
    if (!perfil) return "Nombre completo";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Nombre completo";
  }, [perfil]);

  const handleSavePerfil = async (formData: Parameters<typeof updatePerfil>[0]) => {
    await updatePerfil(formData);
    await refreshData();
  };

  const handleAddHabilidad = async (habilidadId: number, nivel: string) => {
    await addHabilidad({ habilidad_id: habilidadId, nivel });
    await refreshData();
  };

  const handleRemoveHabilidad = async (id: number) => {
    setModalAlert({
      mensaje: "Esta habilidad será eliminada de tu perfil.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeHabilidad(id);
        await refreshData();
      },
    });
  };

  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    if (modalProy && modalProy !== "nuevo") {
      await updateProyecto(modalProy.id_proyecto, formData);
    } else {
      await addProyecto(formData);
    }
    await refreshData();
  };

  const handleRemoveProyecto = async (id: number) => {
    setModalAlert({
      mensaje: "Este proyecto será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeProyecto(id);
        await refreshData();
      },
    });
  };

  // ── Experiencia handlers ──────────────────────────────────────────────────

  const handleSaveExperiencia = async (formData: Parameters<typeof addExperiencia>[0]) => {
    if (modalExp && modalExp !== "nueva") {
      await updateExperiencia(modalExp.id_experiencia, formData);
    } else {
      await addExperiencia(formData);
    }
    await refreshData();
  };

  const handleRemoveExperiencia = async (id: number) => {
    setModalAlert({
      mensaje: "Esta experiencia laboral será eliminada permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeExperiencia(id);
        await refreshData();
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loadingPage) return <div className={styles.stateScreen}>Cargando portafolio...</div>;
  if (errorPage) return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;
  if (!data) return null;

  return (
    <div className={styles.layout}>

      <SidebarEdicion
        perfil={perfil}
        nombreCompleto={nombreCompleto}
        activeSection={activeSection}
        proyectosCount={proyectos.length}
        onSectionChange={setActiveSection}
        onBack={() => navigate(-1)}
      />

      <main className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.breadcrumb}>
              Portafolio
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{SECTION_LABELS[activeSection]}</span>
            </span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Activo
            </span>
          </div>
        </div>

        <div className={styles.content}>

          {activeSection === "perfil" && (
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
                  <button className={styles.editBtn} onClick={() => setModalPerfil(true)}>
                    <IconPencil />
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "habilidades" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Habilidades</span>
                <span className={styles.sectionMeta}>
                  {habilidadesTecnicas.length + habilidadesBlandas.length} registradas
                </span>
              </div>
              <div className={skillStyles.skillsGrid}>
                <SkillCard
                  tipo="tecnica"
                  lista={habilidadesTecnicas}
                  onAdd={() => setModalHab("tecnica")}
                  onRemove={handleRemoveHabilidad}
                />
                <SkillCard
                  tipo="blanda"
                  lista={habilidadesBlandas}
                  onAdd={() => setModalHab("blanda")}
                  onRemove={handleRemoveHabilidad}
                />
              </div>
            </div>
          )}

          {activeSection === "proyectos" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Proyectos</span>
                <span className={styles.sectionMeta}>
                  {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ProjectRowList
                proyectos={proyectos}
                onEdit={(p) => setModalProy(p)}
                onRemove={handleRemoveProyecto}
                onAdd={() => setModalProy("nuevo")}
              />
            </div>
          )}

          {activeSection === "experiencia" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Experiencia Laboral</span>
                <span className={styles.sectionMeta}>
                  {experiencias.length} entrada{experiencias.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ExperienciaRowList
                experiencias={experiencias}
                onEdit={(e) => setModalExp(e)}
                onRemove={handleRemoveExperiencia}
                onAdd={() => setModalExp("nueva")}
              />
            </div>
          )}

        </div>
      </main>

      {modalPerfil && (
        <ModalEditarPerfil perfil={perfil} onClose={() => setModalPerfil(false)} onSave={handleSavePerfil} />
      )}
      {modalHab && (
        <ModalAgregarHabilidad tipo={modalHab} catalogo={catalogo} onClose={() => setModalHab(null)} onSave={handleAddHabilidad} />
      )}
      {modalProy !== null && (
        <ModalProyecto
          proyecto={modalProy === "nuevo" ? null : modalProy}
          onClose={() => setModalProy(null)}
          onSave={handleSaveProyecto}
        />
      )}
      {modalExp !== null && (
        <ModalExperiencia
          experiencia={modalExp === "nueva" ? null : modalExp}
          onClose={() => setModalExp(null)}
          onSave={handleSaveExperiencia}
        />
      )}
      {modalAlert && (
        <ModalAlert
          title="¿Confirmar eliminación?"
          message={modalAlert.mensaje}
          onConfirm={modalAlert.onConfirm}
          onCancel={() => setModalAlert(null)}
        />
      )}
    </div>
  );
}