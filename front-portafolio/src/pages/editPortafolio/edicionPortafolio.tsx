//comentario

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
  addEducacion,
  removeEducacion,
  addCurso,
  removeCurso,
  addLogro,
  removeLogro,
  addIdioma,
} from "../../services/portafolioservice";

import type {
  PortafolioData,
  HabilidadCatalogo,
  Proyecto,
  Educacion,
  Curso,
  Logro,
  Idioma
} from "../../types/portafolioTypes";


import SidebarEdicion from "./components/sidebarEdicion";
import SkillCard from "./components/skillCard";
import ProjectRowList from "./components/projectRowList";
import ModalEditarPerfil from "./components/modalEditarPerfil";
import ModalAgregarHabilidad from "./components/modalAgregarHabilidad";
import ModalProyecto from "./components/modalProyecto";
import ModalEducacion from "./components/modalEducacion";
import ModalCurso from "./components/modalCurso";
import EducacionCard from "./components/educacionCard";
import CursoCard from "./components/cursoCard";
import { IconPersona, IconPencil } from "./components/icons";
import ModalAlert from "./components/modalAlert";
import ModalLogro from "./components/modalLogro";
import LogroCard from "./components/logroCard";
import ModalIdioma from "./components/modalIdioma";
import IdiomaCard from "./components/idiomaCard";

type AlertState = { mensaje: string; onConfirm: () => void } | null;
type ModalProyectoState = Proyecto | null | "nuevo";
type ActiveSection = "perfil" | "habilidades" | "proyectos" | "educacion" | "cursos" | "logros" | "idiomas";

const SECTION_LABELS: Record<ActiveSection, string> = {
  perfil: "Perfil",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  educacion: "Educación",
  cursos: "Cursos",
  logros: "Logros",
  idiomas: "Idiomas",
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
  const [modalEducacion, setModalEducacion] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [modalAlert, setModalAlert] = useState<AlertState>(null);
  const [modalLogro, setModalLogro] = useState(false);
  const [modalIdioma, setModalIdioma] = useState(false);

  const refreshData = async () => setData(await getPortafolio());

  useEffect(() => {
    const cargar = async () => {
      try {
        const [portafolioRes, catalogoRes] = await Promise.all([
          getPortafolio(),
          getCatalogoHabilidades(),
        ]);
        setData(portafolioRes);
        setCatalogo(catalogoRes.habilidades ?? []);
      } catch {
        setErrorPage("Error al cargar el portafolio. Verifica tu conexión.");
      } finally {
        setLoadingPage(false);
      }
    };
    cargar();
  }, []);

  const perfil             = data?.perfil ?? null;
  const habilidadesTecnicas = data?.habilidades_tecnicas ?? [];
  const habilidadesBlandas  = data?.habilidades_blandas ?? [];
  const proyectos           = data?.proyectos ?? [];
  const educaciones         = (data?.educaciones ?? []) as Educacion[];
  const cursos              = (data?.cursos ?? []) as Curso[];
  const logros              = (data?.logros ?? []) as Logro[];
  const idiomas             = (data?.idiomas ?? []) as Idioma[];


  const nombreCompleto = useMemo(() => {
    if (!perfil) return "Nombre completo";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Nombre completo";
  }, [perfil]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

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

  const handleSaveEducacion = async (formData: Parameters<typeof addEducacion>[0]) => {
    await addEducacion(formData);
    await refreshData();
  };

  const handleRemoveEducacion = async (id: number) => {
    setModalAlert({
      mensaje: "Este registro de educación será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeEducacion(id);
        await refreshData();
      },
    });
  };

  const handleSaveCurso = async (formData: Parameters<typeof addCurso>[0]) => {
    await addCurso(formData);
    await refreshData();
  };

  const handleRemoveCurso = async (id: number) => {
    setModalAlert({
      mensaje: "Este curso será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeCurso(id);
        await refreshData();
      },
    });
  };

  const handleRemoveLogro = async (id: number) => {
    setModalAlert({
      mensaje: "Este logro será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        await removeLogro(id);
        await refreshData();
      },
    });
  };

  const handleAddLogro = async (formData: Parameters<typeof addLogro>[0]) => {
    await addLogro(formData);
    await refreshData();
  };

  const handleAddIdioma = async (formData: Parameters<typeof addIdioma>[0]) => {
    await addIdioma(formData);
    await refreshData();
  } 

  if (loadingPage) return <div className={styles.stateScreen}>Cargando portafolio...</div>;
  if (errorPage)   return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;
  if (!data)       return null;

  return (
    <div className={styles.layout}>

      <SidebarEdicion
        perfil={perfil}
        nombreCompleto={nombreCompleto}
        activeSection={activeSection}
        proyectosCount={proyectos.length}
        educacionCount={educaciones.length}
        cursosCount={cursos.length}
        logrosCount={logros.length}
        IdiomasCount={idiomas.length}
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

          {activeSection === "educacion" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Formación Académica</span>
                <span className={styles.sectionMeta}>
                  {educaciones.length} registro{educaciones.length !== 1 ? "s" : ""}
                </span>
              </div>
              <EducacionCard
                educaciones={educaciones}
                onAdd={() => setModalEducacion(true)}
                onRemove={handleRemoveEducacion}
              />
            </div>
          )}

          {activeSection === "cursos" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Cursos y Certificados</span>
                <span className={styles.sectionMeta}>
                  {cursos.length} registro{cursos.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CursoCard
                cursos={cursos}
                onAdd={() => setModalCurso(true)}
                onRemove={handleRemoveCurso}
              />
            </div>
          )}

          {activeSection === "logros" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Logros</span>
                <span className={styles.sectionMeta}>
                  {logros.length} logro{logros.length !== 1 ? "s" : ""}
                </span>
              </div>

              <LogroCard
                logros={logros}
                onAdd={() => setModalLogro(true)}
                onRemove={handleRemoveLogro}
              />
            </div>
          )}

          {activeSection === "idiomas" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Idiomas</span>
                <span className={styles.sectionMeta}>
                  {idiomas.length} idioma{idiomas.length !== 1 ? "s" : ""}
                </span>
              </div>

              <IdiomaCard
                idiomas={idiomas}
                onAdd={() => setModalIdioma(true)}
                
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
      {modalEducacion && (
        <ModalEducacion
          onClose={() => setModalEducacion(false)}
          onSave={handleSaveEducacion}
        />
      )}
      {modalCurso && (
        <ModalCurso
          onClose={() => setModalCurso(false)}
          onSave={handleSaveCurso}
        />
      )}

      {modalLogro && (
        <ModalLogro
          onClose={() => setModalLogro(false)}
          onSave={handleAddLogro}
        />
      )}

      {modalIdioma && (
        <ModalIdioma
          onClose={() => setModalIdioma(false)}
          onSave={handleAddIdioma}
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