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
  getLogros,
  addLogro,
  removeLogro,
} from "../../services/portafolioservice";
import type {
  PortafolioData,
  HabilidadCatalogo,
  Proyecto,
  Logro,
} from "../../types/portafolioTypes";
import SidebarEdicion from "./components/sidebarEdicion";
import SkillCard from "./components/skillCard";
import ProjectRowList from "./components/projectRowList";
import ModalEditarPerfil from "./components/modalEditarPerfil";
import ModalAgregarHabilidad from "./components/modalAgregarHabilidad";
import ModalProyecto from "./components/modalProyecto";
import ModalLogro from "./components/ModalLogro"; // 👈 Nuevo modal
import { IconPersona, IconPencil } from "./components/icons";
import ModalAlert from "./components/modalAlert";

type AlertState = { mensaje: string; onConfirm: () => void } | null;
type ModalProyectoState = Proyecto | null | "nuevo";
type ActiveSection = "perfil" | "habilidades" | "proyectos" | "logros";

const SECTION_LABELS: Record<ActiveSection, string> = {
  perfil: "Perfil",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  logros: "Logros",
};

export default function EdicionPortafolio() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [activeSection, setActiveSection] = useState<ActiveSection>("perfil");

  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | null>(null);
  const [modalProy, setModalProy] = useState<ModalProyectoState>(null);
  const [modalLogro, setModalLogro] = useState(false);
  const [modalAlert, setModalAlert] = useState<AlertState>(null);

  const refreshData = async () => {
    const [portafolioRes, logrosRes] = await Promise.all([
      getPortafolio(),
      getLogros(),
    ]);
    setData(portafolioRes);
    setLogros(logrosRes.logros ?? []);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const [portafolioRes, catalogoRes, logrosRes] = await Promise.all([
          getPortafolio(),
          getCatalogoHabilidades(),
          getLogros(),
        ]);
        setData(portafolioRes);
        setCatalogo(catalogoRes.habilidades ?? []);
        setLogros(logrosRes.logros ?? []);
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

  const handleAddLogro = async (formData: Parameters<typeof addLogro>[0]) => {
    await addLogro(formData);
    await refreshData();
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
        logrosCount={logros.length} // 👈 Asegúrate de que el sidebar lo soporte
        onSectionChange={setActiveSection}
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
          {/* PERFIL */}
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
          <span className={styles.infoValue}>
            {perfil?.profesion ?? "—"}
          </span>
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
          <p className={styles.contactValue}>
            {perfil?.celular ?? "—"}
          </p>
        </div>

        <button
          className={styles.editBtn}
          onClick={() => setModalPerfil(true)}
        >
          <IconPencil />
          Editar perfil
        </button>
      </div>
    </div>
  </div>
)}

          {/* HABILIDADES */}
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

          {/* PROYECTOS */}
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

          {/* LOGROS */}
          {activeSection === "logros" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Logros y reconocimientos</span>
                <span className={styles.sectionMeta}>
                  {logros.length} logro{logros.length !== 1 ? "s" : ""}
                </span>
                <button
                  className={styles.addButton}
                  onClick={() => setModalLogro(true)}
                >
                  + Agregar logro
                </button>
              </div>

              {logros.length === 0 ? (
                <p>No tienes logros registrados.</p>
              ) : (
                <ul className={styles.logrosList}>
                  {logros.map((logro) => (
                    <li key={logro.id_logro} className={styles.logroItem}>
                      <div>
                        <strong>{logro.titulo}</strong>
                        <p>{logro.entidad_emisora?.nombre}</p>
                        <small>
                          {new Date(logro.fecha_obtencion).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        onClick={() => handleRemoveLogro(logro.id_logro)}
                        className={styles.deleteButton}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      {modalPerfil && (
        <ModalEditarPerfil
          perfil={perfil}
          onClose={() => setModalPerfil(false)}
          onSave={handleSavePerfil}
        />
      )}

      {modalHab && (
        <ModalAgregarHabilidad
          tipo={modalHab}
          catalogo={catalogo}
          onClose={() => setModalHab(null)}
          onSave={handleAddHabilidad}
        />
      )}

      {modalProy !== null && (
        <ModalProyecto
          proyecto={modalProy === "nuevo" ? null : modalProy}
          onClose={() => setModalProy(null)}
          onSave={handleSaveProyecto}
        />
      )}

      {modalLogro && (
        <ModalLogro
          onClose={() => setModalLogro(false)}
          onSave={handleAddLogro}
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