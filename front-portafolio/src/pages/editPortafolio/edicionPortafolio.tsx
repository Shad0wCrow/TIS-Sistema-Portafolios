//comentario

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./edicionPortafolio.module.css";
import skillStyles from "./components/skillCard.module.css";
import {
  getPortafolio,
  getCatalogoHabilidades,
  addHabilidad,
  removeHabilidad,
  addProyecto,
  updateProyecto,
  removeProyecto,
  addExperiencia,
  removeExperiencia,
  getExperiencias,
  updateExperiencia,
  addEducacion,
  removeEducacion,
  addCurso,
  removeCurso,
  addLogro,
  removeLogro,
  addIdioma,
  removeIdioma,
  getCertificaciones,
  addCertificacion,
  removeCertificacion
} from "../../services/portafolioservice";

import type {
  PortafolioData,
  HabilidadCatalogo,
  Proyecto,
  Experiencia,
  Educacion,
  Curso,
  Logro,
  Idioma,
  Certificacion
} from "../../types/portafolioTypes";

import SidebarEdicion from "./components/sidebarEdicion";
import SkillCard from "./components/skillCard";
import ProjectRowList from "./components/projectRowList";
import ExperienciaRowList from "./components/experienciaRowList";
import ModalAgregarHabilidad from "./components/modalAgregarHabilidad";
import ModalProyecto from "./components/modalProyecto";
import ModalExperiencia from "./components/modalExperiencia";
import ModalEducacion from "./components/modalEducacion";
import ModalCurso from "./components/modalCurso";
import EducacionCard from "./components/educacionCard";
import CursoCard from "./components/cursoCard";
import { IconPersona } from "./components/icons";
import ModalAlert from "./components/modalAlert";
import ModalSuccess from "./components/modalSuccess";
import ModalLogro from "./components/modalLogro";
import LogroCard from "./components/logroCard";
import ModalIdioma from "./components/modalIdioma";
import IdiomaCard from "./components/idiomaCard";
import CertificacionCard from "./components/certificacionCard";
import ModalCertificacion from "./components/modalCertificacion";

type AlertState = { mensaje: string; onConfirm: () => void } | null;
type ModalProyectoState = Proyecto | null | "nuevo";
type ModalExperienciaState = Experiencia | null | "nueva";
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

type ModalHabilidadEdit = {
  id_usuario_habilidad: number;
  nombre: string;
  nivel: string | null;
  tipo: "tecnica" | "blanda";
};

const SECTION_LABELS: Record<ActiveSection, string> = {
  perfil: "Perfil",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  experiencia: "Experiencia Laboral",
  educacion: "Educación",
  cursos: "Cursos",
  logros: "Logros",
  idiomas: "Idiomas",
  certificaciones: "Certificaciones"
};

export default function EdicionPortafolio() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("perfil");

  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | null>(null);
  const [modalHabEdit, setModalHabEdit] = useState<ModalHabilidadEdit | null>(null);
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

  const refreshData = async () => {
    const [portafolioRes, experienciasRes, certRes] = await Promise.all([
      getPortafolio(),
      getExperiencias(),
      getCertificaciones(),
    ]);

    setData(portafolioRes);
    setExperiencias(experienciasRes);
    setCertificaciones(certRes);
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
        setCertificaciones(certRes);
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

  const certConImagenes = certificaciones.map((c) => {
    const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
    return { ...c, imagen_url: stored[c.id_certificacion] ?? null };
  });

  const nombreCompleto = useMemo(() => {
    if (!perfil) return "Nombre completo";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Nombre completo";
  }, [perfil]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAddHabilidad = async (habilidadId: number, nivel: string) => {
    const res = await addHabilidad({ habilidad_id: habilidadId, nivel });
    const habilidad = res.habilidad;
    const item = {
      id_usuario_habilidad: habilidad.id_usuario_habilidad,
      nombre: habilidad.habilidad?.nombre ?? "",
      nivel: habilidad.nivel ?? null,
    };

    setData((prev) => {
      if (!prev) return prev;
      const key = habilidad.habilidad?.tipo === "tecnica" ? "habilidades_tecnicas" : "habilidades_blandas";
      return { ...prev, [key]: [...prev[key], item] };
    });
  };

  const handleUpdateHabilidad = async (id: number, nivel: string) => {
    const res = await updateHabilidad(id, { nivel });

    setData((prev) => {
      if (!prev) return prev;

      const actualizarLista = (lista: any[]) =>
        lista.map((h) =>
          h.id_usuario_habilidad === id
            ? { ...h, nivel: res.habilidad?.nivel ?? nivel }
            : h
        );

      return {
        ...prev,
        habilidades_tecnicas: actualizarLista(prev.habilidades_tecnicas),
        habilidades_blandas: actualizarLista(prev.habilidades_blandas),
      };
    });
  };

  const handleRemoveHabilidad = async (id: number) => {
    setModalAlert({
      mensaje: "Esta habilidad será eliminada de tu perfil.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeHabilidad(id);
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  habilidades_tecnicas: prev.habilidades_tecnicas.filter((habilidad) => habilidad.id_usuario_habilidad !== id),
                  habilidades_blandas: prev.habilidades_blandas.filter((habilidad) => habilidad.id_usuario_habilidad !== id),
                }
              : prev
          );
          setSuccessMessage("La habilidad ha sido eliminada de tu perfil.");
        } catch (error) {
          setErrorMessage("Error al eliminar la habilidad. Intenta de nuevo");
        }
      },
    });
  };

  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    if (modalProy && modalProy !== "nuevo") {
      const res = await updateProyecto(modalProy.id_proyecto, formData);
      setData((prev) =>
        prev
          ? {
              ...prev,
              proyectos: prev.proyectos.map((proyecto) =>
                proyecto.id_proyecto === modalProy.id_proyecto ? res.proyecto : proyecto
              ),
            }
          : prev
      );
    } else {
      const res = await addProyecto(formData);
      setData((prev) =>
        prev
          ? { ...prev, proyectos: [res.proyecto, ...prev.proyectos] }
          : prev
      );
    }
  };

  const handleRemoveProyecto = async (id: number) => {
    setModalAlert({
      mensaje: "Este proyecto será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeProyecto(id);
          setData((prev) =>
            prev
              ? { ...prev, proyectos: prev.proyectos.filter((proyecto) => proyecto.id_proyecto !== id) }
              : prev
          );
          setSuccessMessage("El proyecto ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el proyecto. Intenta de nuevo.");
        }
      },
    });
  };

  // ── Experiencia handlers ──────────────────────────────────────────────────

  const handleSaveExperiencia = async (formData: Parameters<typeof addExperiencia>[0]) => {
    if (modalExp && modalExp !== "nueva") {
      await updateExperiencia(modalExp.id_experiencia, formData);
      await refreshData();
    } else {
      const res = await addExperiencia(formData);
      const experiencia = {
        ...res.experiencia,
        nombre_empresa: formData.nombre_empresa,
      };
      setExperiencias((prev) => [experiencia, ...prev]);
    }
  };

  const handleRemoveExperiencia = async (id: number) => {
    setModalAlert({
      mensaje: "Esta experiencia laboral será eliminada permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeExperiencia(id);
          setExperiencias((prev) => prev.filter((experiencia) => experiencia.id_experiencia !== id));
          setSuccessMessage("La experiencia laboral ha sido eliminada correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar la experiencia laboral. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveEducacion = async (
    formData: Parameters<typeof addEducacion>[0]
  ) => {
    const res = await addEducacion(formData);
    setData((prev) => prev ? { ...prev, educaciones: [res.educacion, ...prev.educaciones] } : prev);
  };

  const handleRemoveEducacion = async (id: number) => {
    setModalAlert({
      mensaje: "Este registro de educación será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeEducacion(id);
          setData((prev) =>
            prev
              ? { ...prev, educaciones: prev.educaciones.filter((educacion) => educacion.id_educacion !== id) }
              : prev
          );
          setSuccessMessage("El registro de educación ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el registro de educación. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveCurso = async (formData: Parameters<typeof addCurso>[0]) => {
    const res = await addCurso(formData);
    setData((prev) => prev ? { ...prev, cursos: [res.curso, ...prev.cursos] } : prev);
  };

  const handleRemoveCurso = async (id: number) => {
    setModalAlert({
      mensaje: "Este curso será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);

        try {
          await removeCurso(id);
          setData((prev) =>
            prev
              ? { ...prev, cursos: prev.cursos.filter((curso) => curso.id_educacion !== id) }
              : prev
          );
          setSuccessMessage("El curso ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el curso. Intenta de nuevo.");
        }
      },
    });
  };

  const handleRemoveLogro = async (id: number) => {
    setModalAlert({
      mensaje: "Este logro será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeLogro(id);
          setData((prev) =>
            prev
              ? { ...prev, logros: prev.logros.filter((logro) => logro.id_logro !== id) }
              : prev
          );
          setSuccessMessage("El logro ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el logro. Intenta de nuevo.");
        }
      },
    });
  };

  const handleAddLogro = async (formData: Parameters<typeof addLogro>[0]) => {
    const res = await addLogro(formData);
    const logro = {
      ...res.logro,
      entidad_nombre: res.logro.entidad_emisora?.nombre ?? res.logro.entidadEmisora?.nombre ?? res.logro.entidad_nombre ?? null,
    };
    setData((prev) => prev ? { ...prev, logros: [logro, ...prev.logros] } : prev);
  };

  const handleAddIdioma = async (formData: Parameters<typeof addIdioma>[0]) => {
    const res = await addIdioma(formData);
    const idioma = {
      id_usuario_idioma: res.idioma.id_usuario_idioma,
      nombre: res.idioma.idioma?.nombre ?? formData.nombre_idioma,
      nivel: res.idioma.nivel,
      visibilidad: res.idioma.visibilidad,
    };
    setData((prev) => prev ? { ...prev, idiomas: [...prev.idiomas, idioma] } : prev);
  };

  const handleRemoveIdioma = async (id: number) => {
    setModalAlert({
      mensaje: "Este idioma será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeIdioma(id);
          setData((prev) =>
            prev
              ? { ...prev, idiomas: prev.idiomas.filter((idioma) => idioma.id_usuario_idioma !== id) }
              : prev
          );
          setSuccessMessage("El idioma ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el idioma. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveCertificacion = async (
    formData: Parameters<typeof addCertificacion>[0],
    imagenBase64: string | null
  ) => {
    const res = await addCertificacion(formData);
    const id = res.certificacion?.id_certificacion;
    if (imagenBase64 && id) {
      const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
      stored[id] = imagenBase64;
      localStorage.setItem("certificaciones_imagenes", JSON.stringify(stored));
    }
    const certificacion = {
      ...res.certificacion,
      nombre_entidad: formData.nombre_entidad,
      imagen_url: imagenBase64,
    };
    setCertificaciones((prev) => [certificacion, ...prev]);
  };

  const handleRemoveCertificacion = async (id: number) => {
    setModalAlert({
      mensaje: "Esta certificación será eliminada permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeCertificacion(id);
          const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
          delete stored[id];
          localStorage.setItem("certificaciones_imagenes", JSON.stringify(stored));
          setCertificaciones((prev) => prev.filter((certificacion) => certificacion.id_certificacion !== id));
          setSuccessMessage("La certificacion ha sido eliminada correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar la certificacion. Intenta de nuevo.");
        }
      },
    });
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
        proyectosCount={proyectos.length}
        educacionCount={educaciones.length}
        cursosCount={cursos.length}
        logrosCount={logros.length}
        IdiomasCount={idiomas.length}
        certificacionesCount={certConImagenes.length}
        experienciaCount={experiencias.length}
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
                  onEdit={(habilidad) =>
                    setModalHabEdit({
                      ...habilidad,
                      tipo: "tecnica",
                    })
                  }
                  onRemove={handleRemoveHabilidad}
                />
                <SkillCard
                  tipo="blanda"
                  lista={habilidadesBlandas}
                  onAdd={() => setModalHab("blanda")}
                  onEdit={(habilidad) =>
                    setModalHabEdit({
                      ...habilidad,
                      tipo: "blanda",
                    })
                  }
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
                onRemove={handleRemoveIdioma}
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
                onAdd={() => setModalCertificacion(true)}
                onRemove={handleRemoveCertificacion}
              />
            </div>
          )}
        </div>
      </main>

      {(modalHab !== null || modalHabEdit !== null) && (
        <ModalAgregarHabilidad
          tipo={modalHab ?? modalHabEdit?.tipo ?? "tecnica"}
          catalogo={catalogo}
          habilidad={modalHabEdit}
          onClose={() => {
            setModalHab(null);
            setModalHabEdit(null);
          }}
          onSave={async (habilidadId: number, nivel: string) => {
            if (modalHabEdit) {
              await handleUpdateHabilidad(modalHabEdit.id_usuario_habilidad, nivel);
              setModalHabEdit(null);
              return;
            }
            await handleAddHabilidad(habilidadId, nivel);
            setModalHab(null);
          }}
        />
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

      {successMessage && (
        <ModalSuccess
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,25,20,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: 16,
            backdropFilter: "blur(3px)",
          }}
          onClick={() => setErrorMessage(null)}
        >
          <div
            style={{
              background: "var(--bg3)",
              border: "1px solid #f5c6c2",
              borderRadius: 12,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 360,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.13)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--red-lt)",
                border: "1.5px solid #f5c6c2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
              Error al eliminar
            </p>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 22px", lineHeight: 1.6 }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              style={{
                background: "var(--red)",
                border: "1.5px solid var(--red)",
                color: "#fff",
                padding: "9px 24px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {modalCertificacion && (
        <ModalCertificacion
          onClose={() => setModalCertificacion(false)}
          onSave={handleSaveCertificacion}
        />
      )}
    </div>
  );
}