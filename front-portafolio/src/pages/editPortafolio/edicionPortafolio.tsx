import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./edicionPortafolio.module.css";
import skillStyles from "./components/skillCard.module.css";

import {
  getPortafolio,
  getCatalogoHabilidades,
  getExperiencias,
  getCertificaciones,
} from "../../services/portafolioservice";

import type {
  PortafolioData,
  HabilidadCatalogo,
  HabilidadItem,
  Experiencia,
  Educacion,
  Curso,
  Logro,
  Idioma,
  Certificacion,
} from "../../types/portafolioTypes";

import {
  usePortafolioHandlers,
  SECTION_LABELS,
  normalizarCertificaciones,
} from "./hooks/usePortafolioHandlers";
import type {
  AlertState,
  ModalProyectoState,
  ModalExperienciaState,
  ActiveSection,
} from "./hooks/usePortafolioHandlers";

import SidebarEdicion from "./components/sidebarEdicion";
import type { SectionAction } from "./components/sidebarEdicion";
import SkillCard from "./components/skillCard";
import ProjectRowList from "./components/projectRowList";
import ExperienciaRowList from "./components/experienciaRowList";
import ModalAgregarHabilidad from "./components/modalAgregarHabilidad";
import ModalEditarHabilidad from "./components/ModalEditarHabilidad";
import ModalProyecto from "./components/modalProyecto";
import ModalExperiencia from "./components/modalExperiencia";
import ModalEducacion from "./components/modalEducacion";
import ModalCurso from "./components/modalCurso";
import EducacionCard from "./components/educacionCard";
import CursoCard from "./components/cursoCard";
import ModalAlert from "./components/modalAlert";
import ModalSuccess from "./components/modalSuccess";
import ModalLogro from "./components/modalLogro";
import LogroCard from "./components/logroCard";
import ModalIdioma from "./components/modalIdioma";
import IdiomaCard from "./components/idiomaCard";
import CertificacionCard from "./components/certificacionCard";
import ModalCertificacion from "./components/modalCertificacion";
import PerfilSection from "./components/PerfilSection";
import ModalError from "./components/ModalError";

export default function EdicionPortafolio() {
  const navigate = useNavigate();

  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("perfil");
  const [activeAction, setActiveAction] = useState<SectionAction>("mostrar");

  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | null>(null);
  const [modalEditarHab, setModalEditarHab] = useState<HabilidadItem | null>(null);
  const [modalProy, setModalProy] = useState<ModalProyectoState>(null);
  const [modalExp, setModalExp] = useState<ModalExperienciaState>(null);
  const [modalAlert, setModalAlert] = useState<AlertState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [modalEducacion, setModalEducacion] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [modalLogro, setModalLogro] = useState(false);
  const [modalIdioma, setModalIdioma] = useState(false);
  const [modalCertificacion, setModalCertificacion] = useState(false);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);

  const [warningHabilidad, setWarningHabilidad] = useState<string | undefined>();
  const [warningProyecto, setWarningProyecto] = useState<string | undefined>();
  const [warningExperiencia, setWarningExperiencia] = useState<string | undefined>();
  const [warningEducacion, setWarningEducacion] = useState<string | undefined>();
  const [warningCurso, setWarningCurso] = useState<string | undefined>();
  const [warningLogro, setWarningLogro] = useState<string | undefined>();
  const [warningIdioma, setWarningIdioma] = useState<string | undefined>();
  const [warningCertificacion, setWarningCertificacion] = useState<string | undefined>();

  const refreshData = async () => {
    const [portafolioRes, experienciasRes, certRes] = await Promise.all([
      getPortafolio(),
      getExperiencias(),
      getCertificaciones(),
    ]);
    setData(portafolioRes);
    setExperiencias(experienciasRes);
    setCertificaciones(normalizarCertificaciones(certRes));
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const [portafolioRes, catalogoRes, experienciasRes, certRes] = await Promise.all([
          getPortafolio(),
          getCatalogoHabilidades(),
          getExperiencias(),
          getCertificaciones(),
        ]);
        setData(portafolioRes);
        setCatalogo(catalogoRes.habilidades ?? []);
        setExperiencias(experienciasRes);
        setCertificaciones(normalizarCertificaciones(certRes));
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
  const educaciones = (data?.educaciones ?? []) as Educacion[];
  const cursos = (data?.cursos ?? []) as Curso[];
  const logros = (data?.logros ?? []) as Logro[];
  const idiomas = (data?.idiomas ?? []) as Idioma[];

  const certConImagenes = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
    return certificaciones.map((c) => ({
      ...c,
      imagen_url: stored[c.id_certificacion] ?? null,
    }));
  }, [certificaciones]);

  const nombreCompleto = useMemo(() => {
    if (!perfil) return "Nombre completo";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Nombre completo";
  }, [perfil]);

  const {
    handleAddHabilidad,
    handleEditHabilidad,
    handleRemoveHabilidad,
    handleSaveProyecto,
    handleRemoveProyecto,
    handleSaveExperiencia,
    handleRemoveExperiencia,
    handleSaveEducacion,
    handleRemoveEducacion,
    handleSaveCurso,
    handleRemoveCurso,
    handleRemoveLogro,
    handleAddLogro,
    handleAddIdioma,
    handleRemoveIdioma,
    handleSaveCertificacion,
    handleRemoveCertificacion,
  } = usePortafolioHandlers({
    data,
    setData,
    catalogo,
    experiencias,
    setExperiencias,
    certificaciones,
    setCertificaciones,
    modalProy,
    modalExp,
    setModalAlert,
    setSuccessMessage,
    setErrorMessage,
    setWarningHabilidad,
    setWarningProyecto,
    setWarningExperiencia,
    setWarningEducacion,
    setWarningCurso,
    setWarningLogro,
    setWarningIdioma,
    setWarningCertificacion,
    refreshData,
  });

  const openRegistrarModal = (section: ActiveSection) => {
    switch (section) {
      case "habilidades":
        setModalHab("tecnica");
        break;
      case "proyectos":
        setModalProy("nuevo");
        break;
      case "experiencia":
        setModalExp("nueva");
        break;
      case "educacion":
        setModalEducacion(true);
        break;
      case "cursos":
        setModalCurso(true);
        break;
      case "logros":
        setModalLogro(true);
        break;
      case "idiomas":
        setModalIdioma(true);
        break;
      case "certificaciones":
        setModalCertificacion(true);
        break;
      default:
        break;
    }
  };

  const handleActionChange = (action: SectionAction, targetSection?: ActiveSection) => {
    setActiveAction(action);
    if (action === "registrar") {
      openRegistrarModal(targetSection || activeSection);
    }
  };

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    setActiveAction("mostrar");
  };

  if (loadingPage) return <div className={styles.stateScreen}>Cargando portafolio...</div>;
  if (errorPage) return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;
  if (!data) return null;

  return (
    <div className={styles.layout}>
      <SidebarEdicion
        perfil={perfil}
        nombreCompleto={nombreCompleto}
        activeSection={activeSection}
        activeAction={activeAction}
        proyectosCount={proyectos.length}
        educacionCount={educaciones.length}
        cursosCount={cursos.length}
        logrosCount={logros.length}
        IdiomasCount={idiomas.length}
        certificacionesCount={certConImagenes.length}
        experienciaCount={experiencias.length}
        onSectionChange={handleSectionChange}
        onActionChange={handleActionChange}
        onBack={() => navigate(-1)}
      />

      <main className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.breadcrumb}>
              Portafolio
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>
                {SECTION_LABELS[activeSection]}
              </span>
              {activeAction !== "mostrar" && (
                <>
                  <span className={styles.breadcrumbSep}>/</span>
                  <span
                    className={styles.breadcrumbCurrent}
                    style={{ textTransform: "capitalize" }}
                  >
                    {activeAction}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <button
              type="button"
              className={styles.previewButton}
              onClick={() => navigate("/generar-cv")}
            >
              Generar CV
            </button>
            <button
              type="button"
              className={styles.previewButton}
              onClick={() => navigate("/portafolio")}
            >
              Vista previa
            </button>
            <button
              type="button"
              className={styles.publishButton}
              onClick={() => navigate("/portafolio/publicar")}
            >
              Publicar
            </button>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Activo
            </span>
          </div>
        </div>

        <div className={styles.content}>
          {activeSection === "perfil" && (
            <PerfilSection perfil={perfil} nombreCompleto={nombreCompleto} />
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
                  onAdd={() => {
                    if (activeAction === "registrar" || activeAction === "mostrar") {
                      setModalHab("tecnica");
                    }
                  }}
                  onRemove={(id) => {
                    if (activeAction === "eliminar" || activeAction === "mostrar") {
                      handleRemoveHabilidad(id);
                    }
                  }}
                  onEdit={(h) => {
                    if (activeAction === "editar" || activeAction === "mostrar") {
                      setModalEditarHab(h);
                    }
                  }}
                  activeAction={activeAction}
                />

                <SkillCard
                  tipo="blanda"
                  lista={habilidadesBlandas}
                  onAdd={() => {
                    if (activeAction === "registrar" || activeAction === "mostrar") {
                      setModalHab("blanda");
                    }
                  }}
                  onRemove={(id) => {
                    if (activeAction === "eliminar" || activeAction === "mostrar") {
                      handleRemoveHabilidad(id);
                    }
                  }}
                  onEdit={(h) => {
                    if (activeAction === "editar" || activeAction === "mostrar") {
                      setModalEditarHab(h);
                    }
                  }}
                  activeAction={activeAction}
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
                onEdit={(p) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalProy(p);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveProyecto(id);
                  }
                }}
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalProy("nuevo");
                  }
                }}
                activeAction={activeAction}
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
                onEdit={() => {}}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveExperiencia(id);
                  }
                }}
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalExp("nueva");
                  }
                }}
                activeAction={activeAction === "editar" ? "mostrar" : activeAction}
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
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalEducacion(true);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveEducacion(id);
                  }
                }}
                activeAction={activeAction}
              />
            </div>
          )}

          {activeSection === "cursos" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Cursos</span>
                <span className={styles.sectionMeta}>
                  {cursos.length} registro{cursos.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CursoCard
                cursos={cursos}
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalCurso(true);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveCurso(id);
                  }
                }}
                activeAction={activeAction}
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
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalLogro(true);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveLogro(id);
                  }
                }}
                activeAction={activeAction}
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
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalIdioma(true);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveIdioma(id);
                  }
                }}
                activeAction={activeAction}
              />
            </div>
          )}

          {activeSection === "certificaciones" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Certificaciones</span>
                <span className={styles.sectionMeta}>
                  {certConImagenes.length} registro{certConImagenes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CertificacionCard
                certificaciones={certConImagenes}
                onAdd={() => {
                  if (activeAction === "registrar" || activeAction === "mostrar") {
                    setModalCertificacion(true);
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveCertificacion(id);
                  }
                }}
                activeAction={activeAction}
              />
            </div>
          )}
        </div>
      </main>

      {modalHab && (
        <ModalAgregarHabilidad
          tipo={modalHab}
          catalogo={catalogo}
          onClose={() => {
            setModalHab(null);
            setWarningHabilidad(undefined);
          }}
          onSave={handleAddHabilidad}
          duplicadoWarning={warningHabilidad}
        />
      )}

      {modalEditarHab && (
        <ModalEditarHabilidad
          habilidad={modalEditarHab}
          onClose={() => setModalEditarHab(null)}
          onSave={handleEditHabilidad}
        />
      )}

      {modalProy !== null && (
        <ModalProyecto
          proyecto={modalProy === "nuevo" ? null : modalProy}
          onClose={() => {
            setModalProy(null);
            setWarningProyecto(undefined);
          }}
          onSave={handleSaveProyecto}
          duplicadoWarning={warningProyecto}
        />
      )}

      {modalExp !== null && (
        <ModalExperiencia
          experiencia={null}
          onClose={() => {
            setModalExp(null);
            setWarningExperiencia(undefined);
          }}
          onSave={handleSaveExperiencia}
          duplicadoWarning={warningExperiencia}
        />
      )}

      {modalEducacion && (
        <ModalEducacion
          onClose={() => {
            setModalEducacion(false);
            setWarningEducacion(undefined);
          }}
          onSave={handleSaveEducacion}
          duplicadoWarning={warningEducacion}
        />
      )}

      {modalCurso && (
        <ModalCurso
          onClose={() => {
            setModalCurso(false);
            setWarningCurso(undefined);
          }}
          onSave={handleSaveCurso}
          duplicadoWarning={warningCurso}
        />
      )}

      {modalLogro && (
        <ModalLogro
          onClose={() => {
            setModalLogro(false);
            setWarningLogro(undefined);
          }}
          onSave={handleAddLogro}
          logrosExistentes={logros}
          duplicadoWarning={warningLogro}
        />
      )}

      {modalIdioma && (
        <ModalIdioma
          onClose={() => {
            setModalIdioma(false);
            setWarningIdioma(undefined);
          }}
          onSave={handleAddIdioma}
          duplicadoWarning={warningIdioma}
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

      {successMessage && (
        <ModalSuccess
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <ModalError
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {modalCertificacion && (
        <ModalCertificacion
          onClose={() => {
            setModalCertificacion(false);
            setWarningCertificacion(undefined);
          }}
          onSave={handleSaveCertificacion}
          duplicadoWarning={warningCertificacion}
        />
      )}
    </div>
  );
}
