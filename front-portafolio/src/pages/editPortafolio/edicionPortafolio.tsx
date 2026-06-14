import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./edicionPortafolio.module.css";
import skillStyles from "./components/skillCard.module.css";
import projectStyles from "./components/projectRow.module.css";

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
  ModalLogroState,
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
import ModalGithubImport from "./components/ModalGithubImport";
import ModalExperiencia from "./components/modalExperiencia";
import ModalEditarExperiencia from "./components/ModalEditarExperiencia";
import ModalEducacion from "./components/modalEducacion";
import ModalEditarEducacion from "./components/ModalEditarEducacion";
import ModalCurso from "./components/modalCurso";
import ModalEditarCurso from "./components/ModalEditarCurso";
import EducacionCard from "./components/educacionCard";
import CursoCard from "./components/cursoCard";
import ModalAlert from "./components/modalAlert";
import ModalSuccess from "./components/modalSuccess";
import ModalLogro from "./components/modalLogro";
import ModalEditarLogro from "./components/ModalEditarLogro";
import LogroCard from "./components/logroCard";
import ModalIdioma from "./components/modalIdioma";
import ModalEditarIdioma from "./components/ModalEditarIdioma";
import IdiomaCard from "./components/idiomaCard";
import CertificacionCard from "./components/certificacionCard";
import ModalCertificacion from "./components/modalCertificacion";
import ModalEditarCertificacion from "./components/ModalEditarCertificacion";
import PerfilSection from "./components/PerfilSection";
import ModalError from "./components/ModalError";
import ModalSeleccionHabilidad from "./components/modalSeleccionHabilidad";

export default function EdicionPortafolio() {
  const navigate = useNavigate();

  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("perfil");
  const [activeAction, setActiveAction] = useState<SectionAction>("mostrar");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | "seleccion" | null>(null);
  const [modalEditarHab, setModalEditarHab] = useState<HabilidadItem | null>(null);
  const [modalProy, setModalProy] = useState<ModalProyectoState>(null);
  const [modalGithubImport, setModalGithubImport] = useState(false);
  const [modalExp, setModalExp] = useState<ModalExperienciaState>(null);
  const [modalEditarExp, setModalEditarExp] = useState<Experiencia | null>(null);
  const [modalAlert, setModalAlert] = useState<AlertState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [modalEducacion, setModalEducacion] = useState(false);
  const [modalEditarEducacion, setModalEditarEducacion] = useState<Educacion | null>(null);
  const [modalCurso, setModalCurso] = useState(false);
  const [modalEditarCurso, setModalEditarCurso] = useState<Curso | null>(null);
  const [modalLogro, setModalLogro] = useState<ModalLogroState>(null);
  const [modalEditarLogro, setModalEditarLogro] = useState<Logro | null>(null);
  const [modalIdioma, setModalIdioma] = useState(false);
  const [modalEditarIdioma, setModalEditarIdioma] = useState<Idioma | null>(null);
  const [modalCertificacion, setModalCertificacion] = useState(false);
  const [modalEditarCertificacion, setModalEditarCertificacion] = useState<Certificacion | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);

  const [warningHabilidad, setWarningHabilidad] = useState<string | undefined>();
  const [warningProyecto, setWarningProyecto] = useState<string | undefined>();
  const [warningExperiencia, setWarningExperiencia] = useState<string | undefined>();
  const [warningEducacion, setWarningEducacion] = useState<string | undefined>();
  const [warningCurso, setWarningCurso] = useState<string | undefined>();
  const [warningLogro, setWarningLogro] = useState<string | undefined>();
  const [warningIdioma, setWarningIdioma] = useState<string | undefined>();
  const [warningCertificacion, setWarningCertificacion] = useState<string | undefined>();

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

  const certConImagenes = certificaciones;

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
    handleEditExperiencia,
    handleRemoveExperiencia,
    handleSaveEducacion,
    handleEditEducacion,
    handleRemoveEducacion,
    handleSaveCurso,
    handleEditCurso,
    handleRemoveCurso,
    handleRemoveLogro,
    handleAddLogro,
    handleEditLogro,
    handleAddIdioma,
    handleEditIdioma,
    handleRemoveIdioma,
    handleSaveCertificacion,
    handleEditCertificacion,
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
    modalLogro,
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
  });

  const openRegistrarModal = (section: ActiveSection) => {
    switch (section) {
      case "habilidades":
        setModalHab("seleccion");
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
        setModalLogro("nuevo");
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

  useEffect(() => {
    if (window.innerWidth <= 900) {
      setSidebarVisible(false);
    }
  }, []);

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
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <main className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.sidebarToggleButton}
              onClick={() => setSidebarVisible((value) => !value)}
            >
              {sidebarVisible ? "Ocultar menú" : "Mostrar menú"}
            </button>
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
                headerAction={
                  activeAction === "registrar" ? (
                    <button
                      type="button"
                      className={projectStyles.btnAdd}
                      onClick={() => setModalGithubImport(true)}
                    >
                      Importar desde GitHub
                    </button>
                  ) : null
                }
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
                onEdit={(experiencia) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarExp(experiencia);
                  }
                }}
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
                activeAction={activeAction}
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
                onEdit={(educacion) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarEducacion(educacion);
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
                onEdit={(curso) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarCurso(curso);
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
                    setModalLogro("nuevo");
                  }
                }}
                onRemove={(id) => {
                  if (activeAction === "eliminar" || activeAction === "mostrar") {
                    handleRemoveLogro(id);
                  }
                }}
                onEdit={(l) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarLogro(l);
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
                onEdit={(idioma) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarIdioma(idioma);
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
                onEdit={(certificacion) => {
                  if (activeAction === "editar" || activeAction === "mostrar") {
                    setModalEditarCertificacion(certificacion);
                  }
                }}
                activeAction={activeAction}
              />
            </div>
          )}
        </div>
      </main>

      {modalHab === "seleccion" && (
        <ModalSeleccionHabilidad
          onSelect={(tipo) => setModalHab(tipo)}
          onClose={() => setModalHab(null)}
        />
      )}

      {(modalHab === "tecnica" || modalHab === "blanda") && (
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

      {modalGithubImport && (
        <ModalGithubImport
          proyectosExistentes={proyectos}
          onClose={() => {
            setModalGithubImport(false);
            setWarningProyecto(undefined);
          }}
          onImport={handleSaveProyecto}
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

      {modalEditarExp && (
        <ModalEditarExperiencia
          experiencia={modalEditarExp}
          onClose={() => setModalEditarExp(null)}
          onSave={handleEditExperiencia}
        />
      )}

      {modalEditarEducacion && (
        <ModalEditarEducacion
          educacion={modalEditarEducacion}
          onClose={() => setModalEditarEducacion(null)}
          onSave={handleEditEducacion}
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

      {modalEditarCurso && (
        <ModalEditarCurso
          curso={modalEditarCurso}
          onClose={() => setModalEditarCurso(null)}
          onSave={handleEditCurso}
        />
      )}

      {modalLogro !== null && (
        <ModalLogro
          logro={null}
          onClose={() => {
            setModalLogro(null);
            setWarningLogro(undefined);
          }}
          onSave={handleAddLogro}
          logrosExistentes={logros}
          duplicadoWarning={warningLogro}
        />
      )}

      {modalEditarLogro && (
        <ModalEditarLogro
          logro={modalEditarLogro}
          onClose={() => setModalEditarLogro(null)}
          onSave={handleEditLogro}
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

      {modalEditarIdioma && (
        <ModalEditarIdioma
          idioma={modalEditarIdioma}
          onClose={() => setModalEditarIdioma(null)}
          onSave={handleEditIdioma}
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

      {modalEditarCertificacion && (
        <ModalEditarCertificacion
          certificacion={modalEditarCertificacion}
          onClose={() => setModalEditarCertificacion(null)}
          onSave={handleEditCertificacion}
        />
      )}
    </div>
  );
}
