import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  eliminarPortafolioGuardado,
  getEstadoGuardado,
  getEstadoPublicacion,
  getPortafolioPublico,
  guardarPortafolio,
  registrarContactoDirecto,
  registrarVisualizacionPortafolio,
} from "../../services/portafolioservice";
import ReportarPortafolio from "./components/ReportarPortafolio";
import type {
  Certificacion,
  Curso,
  Educacion,
  Experiencia,
  HabilidadItem,
  Idioma,
  Logro,
  Perfil,
  PortafolioData,
  Proyecto,
} from "../../types/portafolioTypes";
import ProjectCard from "../../components/portafolio/ProjectCard";
import SkillChip from "../../components/portafolio/SkillChip";
import PageLoader from "../../components/ui/PageLoader/PageLoader";
import styles from "./Portafolio.module.css";
import { IconEye, IconUser } from "./components/PortafolioIcons";
import { EmptyState, SectionShell, TimelineItem, CertificacionCard } from "./components/PortafolioSections";
import {
  DEFAULT_SECTION_ORDER,
  formatFecha,
  formatPeriodo,
  NIVEL_IDIOMA,
  SECTION_LABELS,
} from "./components/portafolioUtils";
import type { SectionId } from "./components/portafolioUtils";

const emptyData: Required<Pick<
  PortafolioData,
  | "habilidades_tecnicas"
  | "habilidades_blandas"
  | "proyectos"
  | "educaciones"
  | "cursos"
  | "logros"
  | "idiomas"
  | "certificaciones"
  | "experiencias"
>> = {
  habilidades_tecnicas: [],
  habilidades_blandas: [],
  proyectos: [],
  educaciones: [],
  cursos: [],
  logros: [],
  idiomas: [],
  certificaciones: [],
  experiencias: [],
};

const DEFAULT_ACCENT_COLOR = "#1a6644";

function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.trim();
  const normalized = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT_COLOR;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildAccentStyle(color?: string | null): CSSProperties {
  const accent = color && /^#[0-9a-fA-F]{6}$/.test(color.trim())
    ? color.trim()
    : DEFAULT_ACCENT_COLOR;

  return {
    ["--color-accent" as any]: accent,
    ["--color-accent-soft" as any]: hexToRgba(accent, 0.22),
  };
}

const getRequestMessage = (err: unknown, fallback: string): string => {
  if (
    err &&
    typeof err === "object" &&
    "response" in err
  ) {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    const firstError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : "";
    return firstError || response?.data?.message || fallback;
  }

  return fallback;
};

export default function PortafolioPublico() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [savingGuardado, setSavingGuardado] = useState(false);
  const [guardadoMessage, setGuardadoMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [contactError, setContactError] = useState("");
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const [esPropioPerfil, setEsPropioPerfil] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("El portafolio no está disponible.");
      setLoading(false);
      return;
    }

    getPortafolioPublico(slug)
      .then((portafolio) => {
        setData(portafolio);
        registrarVisualizacionPortafolio(slug).catch(() => undefined);
      })
      .catch((err) => {
        const message = err?.response?.data?.message ?? "El portafolio no está disponible.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!slug || !token) return;

    getEstadoGuardado(slug)
      .then((estado) => setGuardado(estado.guardado))
      .catch(() => setGuardado(false));
  }, [slug]);

  // CA #6: Detectar si el portafolio pertenece al usuario logueado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!slug || !token) return;

    getEstadoPublicacion()
      .then((publicacion) => {
        if (publicacion.slug_publico && publicacion.slug_publico === slug) {
          setEsPropioPerfil(true);
        }
      })
      .catch(() => undefined);
  }, [slug]);

  const perfil = (data?.perfil ?? null) as Perfil | null;
  const habilidadesTecnicas = (data?.habilidades_tecnicas ?? emptyData.habilidades_tecnicas) as HabilidadItem[];
  const habilidadesBlandas = (data?.habilidades_blandas ?? emptyData.habilidades_blandas) as HabilidadItem[];
  const proyectos = (data?.proyectos ?? emptyData.proyectos) as Proyecto[];
  const educaciones = (data?.educaciones ?? emptyData.educaciones) as Educacion[];
  const cursos = (data?.cursos ?? emptyData.cursos) as Curso[];
  const logros = (data?.logros ?? emptyData.logros) as Logro[];
  const idiomas = (data?.idiomas ?? emptyData.idiomas) as Idioma[];
  const certificaciones = (data?.certificaciones ?? emptyData.certificaciones) as Certificacion[];
  const certificacionesConImagenes = useMemo(() => {
    return certificaciones.map((c) => ({
      ...c,
      url_imagen: c.url_imagen ?? c.imagen_url ?? null,
    }));
  }, [certificaciones]);
  const experiencias = (data?.experiencias ?? emptyData.experiencias) as Experiencia[];
  const contactoDirecto = data?.contacto_directo;
  const telefonoContacto = contactoDirecto?.telefono || perfil?.celular || null;
  const correoContacto   = contactoDirecto?.correo  || perfil?.correo_contacto || null;
  const tieneTelefonoContacto = Boolean(telefonoContacto);
  const tieneCorreoContacto = Boolean(correoContacto);
  const enlacesPerfil = perfil?.enlaces_personalizados ?? perfil?.enlacesPersonalizados ?? [];
  const ubicacionPerfil = [perfil?.ciudad, perfil?.pais].filter(Boolean).join(", ");
  const mostrarContactoDirecto = Boolean(contactoDirecto?.habilitado && (tieneTelefonoContacto || tieneCorreoContacto) && slug);
  const tieneMultiplesMediosContacto = tieneTelefonoContacto && tieneCorreoContacto;

  const nombreCompleto = useMemo(() => {
    if (!perfil) return "Portafolio profesional";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Portafolio profesional";
  }, [perfil]);

  const accentStyle = useMemo(() => buildAccentStyle(data?.color_acento), [data?.color_acento]);

  const sectionHasContent: Record<SectionId, boolean> = {
    perfil: Boolean(perfil),
    habilidades: habilidadesTecnicas.length + habilidadesBlandas.length > 0,
    proyectos: proyectos.length > 0,
    educacion: educaciones.length > 0,
    experiencia: experiencias.length > 0,
    cursos: cursos.length > 0,
    certificaciones: certificacionesConImagenes.length > 0,
    logros: logros.length > 0,
    idiomas: idiomas.length > 0,
  };

  const visibleSections = DEFAULT_SECTION_ORDER.filter((id) => sectionHasContent[id]);

  const handleToggleGuardado = async () => {
    if (!slug || savingGuardado) return;

    if (!localStorage.getItem("token")) {
      setGuardadoMessage("Inicia sesion o registrate para guardar este portafolio.");
      return;
    }

    try {
      setSavingGuardado(true);
      setGuardadoMessage("");

      if (guardado) {
        await eliminarPortafolioGuardado(slug);
        setGuardado(false);
        setGuardadoMessage("Portafolio eliminado de guardados.");
      } else {
        await guardarPortafolio(slug);
        setGuardado(true);
        setGuardadoMessage("Portafolio guardado correctamente.");
      }
    } catch (err) {
      setGuardadoMessage(getRequestMessage(err, "No se pudo actualizar guardados."));
    } finally {
      setSavingGuardado(false);
    }
  };

  const handleContactoDirecto = async (tipo: "whatsapp" | "correo") => {
    if (!slug || contactLoading) return;
    setContactError("");

    if (tipo === "whatsapp") {
      if (!telefonoContacto) {
        setContactError("El usuario no tiene número registrado");
        return;
      }
      const numero = telefonoContacto.replace(/\D/g, "");
      if (!numero) {
        setContactError("El usuario no tiene número de WhatsApp válido");
        return;
      }
      const fallbackWhatsapp = `https://wa.me/${numero}`;
      try {
        setContactLoading(true);
        const response = await registrarContactoDirecto(slug, "whatsapp");
        window.open(response.whatsapp_url || fallbackWhatsapp, "_blank", "noreferrer");
      } catch {
        window.open(fallbackWhatsapp, "_blank", "noreferrer");
      } finally {
        setContactLoading(false);
        setContactDropdownOpen(false);
      }
      return;
    }

    if (tipo === "correo") {
      if (!correoContacto) {
        setContactError("El usuario no tiene correo registrado");
        return;
      }
      const fallbackMailto = `mailto:${correoContacto}`;
      try {
        setContactLoading(true);
        const response = await registrarContactoDirecto(slug, "email");
        window.open(response.mailto || fallbackMailto, "_blank", "noreferrer");
      } catch {
        window.open(fallbackMailto, "_blank", "noreferrer");
      } finally {
        setContactLoading(false);
        setContactDropdownOpen(false);
      }
    }
  };

  const renderSection = (id: SectionId) => {
    switch (id) {
      case "perfil":
        return (
          <SectionShell key="perfil" id="perfil" title="Perfil profesional" count={perfil ? 1 : 0}>
            <div className={styles.profileGrid}>
              <div className={styles.profileInfoCard}>
                <p className={styles.fieldLabel}>Nombre completo</p>
                <p className={styles.fieldValue}>{nombreCompleto}</p>
              </div>
              <div className={styles.profileInfoCard}>
                <p className={styles.fieldLabel}>Profesión</p>
                <p className={styles.fieldValue}>{perfil?.profesion ?? "Sin información"}</p>
              </div>
              <div className={`${styles.profileInfoCard} ${styles.profileInfoCardFull}`}>
                <p className={styles.fieldLabel}>Descripción</p>
                <p className={styles.fieldValueMuted}>{perfil?.descripcion ?? "Sin descripción"}</p>
              </div>
              <div className={styles.profileInfoCard}>
                <p className={styles.fieldLabel}>Teléfono</p>
                <p className={styles.fieldValue}>{perfil?.celular ?? "Sin información"}</p>
              </div>
              <div className={styles.profileInfoCard}>
                <p className={styles.fieldLabel}>Ubicación</p>
                <p className={styles.fieldValue}>{ubicacionPerfil || "Sin información"}</p>
              </div>
              <div className={styles.profileInfoCard}>
                <p className={styles.fieldLabel}>Correo</p>
                <p className={styles.fieldValue}>{perfil?.correo_contacto ?? "Sin información"}</p>
              </div>
              {enlacesPerfil.length > 0 && (
                <div className={`${styles.profileInfoCard} ${styles.profileInfoCardFull}`}>
                  <p className={styles.fieldLabel}>Enlaces personalizados</p>
                  <div className={styles.profileLinks}>
                    {enlacesPerfil.map((enlace, index) => (
                      <a
                        key={`${enlace.url}-${index}`}
                        href={enlace.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.profileLink}
                      >
                        {enlace.titulo}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionShell>
        );

      case "habilidades":
        return (
          <SectionShell key="habilidades" id="habilidades" title="Habilidades" count={habilidadesTecnicas.length + habilidadesBlandas.length}>
            <div className={styles.splitGrid}>
              <div className={styles.splitColumn}>
                <p className={styles.splitLabel}>Técnicas</p>
                {habilidadesTecnicas.length > 0 ? (
                  <div className={styles.chipWrap}>
                    {habilidadesTecnicas.map((item) => (
                      <SkillChip key={item.id_usuario_habilidad} nombre={item.nombre} nivel={item.nivel} tipo="tecnica" />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Sin habilidades técnicas" description="No hay habilidades técnicas públicas." />
                )}
              </div>
              <div className={styles.splitColumn}>
                <p className={styles.splitLabel}>Blandas</p>
                {habilidadesBlandas.length > 0 ? (
                  <div className={styles.chipWrap}>
                    {habilidadesBlandas.map((item) => (
                      <SkillChip key={item.id_usuario_habilidad} nombre={item.nombre} nivel={item.nivel} tipo="blanda" />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Sin habilidades blandas" description="No hay habilidades blandas públicas." />
                )}
              </div>
            </div>
          </SectionShell>
        );

      case "proyectos":
        return (
          <SectionShell key="proyectos" id="proyectos" title="Proyectos" count={proyectos.length}>
            <div className={styles.projectGrid}>
              {proyectos.map((proyecto) => <ProjectCard key={proyecto.id_proyecto} proyecto={proyecto} />)}
            </div>
          </SectionShell>
        );

      case "educacion":
        return (
          <SectionShell key="educacion" id="educacion" title="Formación académica" count={educaciones.length}>
            <div className={styles.timelineList}>
              {educaciones.map((educacion) => (
                <TimelineItem
                  key={educacion.id_educacion}
                  title={educacion.titulo}
                  subtitle={educacion.institucion}
                  period={formatPeriodo(educacion.fecha_inicio, educacion.fecha_fin)}
                  description={educacion.descripcion}
                  meta={educacion.area_estudio ? [educacion.area_estudio] : []}
                />
              ))}
            </div>
          </SectionShell>
        );

      case "experiencia":
        return (
          <SectionShell key="experiencia" id="experiencia" title="Experiencia laboral" count={experiencias.length}>
            <div className={styles.timelineList}>
              {experiencias.map((experiencia) => (
                <TimelineItem
                  key={experiencia.id_experiencia}
                  title={experiencia.puesto}
                  subtitle={experiencia.nombre_empresa}
                  period={formatPeriodo(experiencia.fecha_inicio, experiencia.es_actual ? null : experiencia.fecha_fin ?? null)}
                  description={experiencia.descripcion}
                  meta={[experiencia.tipo ?? "Experiencia", experiencia.ubicacion ? `Ubicación: ${experiencia.ubicacion}` : ""].filter(Boolean) as string[]}
                />
              ))}
            </div>
          </SectionShell>
        );

      case "cursos":
        return (
          <SectionShell key="cursos" id="cursos" title="Cursos" count={cursos.length}>
            <div className={styles.timelineList}>
              {cursos.map((curso) => (
                <TimelineItem
                  key={curso.id_educacion}
                  title={curso.titulo}
                  subtitle={curso.institucion}
                  period={formatPeriodo(curso.fecha_inicio, curso.fecha_fin)}
                  description={curso.descripcion}
                  meta={curso.fecha_fin === null ? ["En curso"] : []}
                />
              ))}
            </div>
          </SectionShell>
        );

      case "certificaciones":
        return (
          <SectionShell key="certificaciones" id="certificaciones" title="Certificaciones" count={certificaciones.length}>
            <div className={styles.certGrid}>
              {certificacionesConImagenes.map((certificacion) => (
                <CertificacionCard key={certificacion.id_certificacion} cert={certificacion} />
              ))}
            </div>
          </SectionShell>
        );

      case "logros":
        return (
          <SectionShell key="logros" id="logros" title="Logros y reconocimientos" count={logros.length}>
            <div className={styles.timelineList}>
              {logros.map((logro) => (
                <TimelineItem
                  key={logro.id_logro}
                  title={logro.titulo}
                  subtitle={logro.entidad_nombre ?? "Entidad no especificada"}
                  period={logro.fecha_obtencion ? formatFecha(logro.fecha_obtencion) : undefined}
                  description={logro.descripcion}
                  meta={logro.identificador ? [`ID: ${logro.identificador}`] : []}
                  extra={logro.url_credencial ? (
                    <a href={logro.url_credencial} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                      Ver credencial
                    </a>
                  ) : undefined}
                />
              ))}
            </div>
          </SectionShell>
        );

      case "idiomas":
        return (
          <SectionShell key="idiomas" id="idiomas" title="Idiomas" count={idiomas.length}>
            <div className={styles.languagesGrid}>
              {idiomas.map((idioma) => (
                <article key={idioma.id_usuario_idioma} className={styles.languageCard}>
                  <p className={styles.languageName}>{idioma.nombre}</p>
                  <span className={styles.languageLevel}>{NIVEL_IDIOMA[idioma.nivel] ?? idioma.nivel.toUpperCase()}</span>
                </article>
              ))}
            </div>
          </SectionShell>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <PageLoader message="Cargando portafolio..." />;
  }

  if (error || !data || visibleSections.length === 0) {
    return (
      <div className={styles.stateScreen}>
        <div className={styles.emptyPreviewCard}>
          <div className={styles.emptyPreviewIcon}>
            <IconEye />
          </div>
          <h1 className={styles.emptyPreviewTitle}>Portafolio no disponible</h1>
          <p className={styles.emptyPreviewText}>{error || "El portafolio no está disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} style={accentStyle}>
      <header className={styles.topBar}>
        <div className={styles.brandBlock}>
          <span className={styles.brandKicker}>Devfolio</span>
          <div>
            <h1 className={styles.brandTitle}>Portafolio público</h1>
            <p className={styles.brandSubtitle}>Contenido compartido por {nombreCompleto}.</p>
          </div>
        </div>
        <div className={styles.publicActions}>
          <button
            type="button"
            className={`${styles.savePortfolioBtn} ${guardado ? styles.savePortfolioBtnActive : ""}`}
            onClick={handleToggleGuardado}
            disabled={savingGuardado}
          >
            {savingGuardado ? "Guardando..." : guardado ? "Guardado" : "Guardar"}
          </button>
          {!localStorage.getItem("token") && (
            <button type="button" className={styles.loginHintBtn} onClick={() => navigate("/login")}>
              Iniciar sesion
            </button>
          )}
          {guardadoMessage && <p className={styles.guardadoMessage}>{guardadoMessage}</p>}
        </div>
      </header>

      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.profileAvatar}>
              {perfil?.foto_url ? <img src={perfil.foto_url} alt={nombreCompleto} /> : <IconUser />}
            </div>
            <div className={styles.profileHeader}>
              <h2 className={styles.profileName}>{nombreCompleto}</h2>
              {perfil?.profesion && <p className={styles.profileRole}>{perfil.profesion}</p>}
              {ubicacionPerfil && <p className={styles.profileRole}>{ubicacionPerfil}</p>}
              {perfil?.descripcion && <p className={styles.profileDescription}>{perfil.descripcion}</p>}
              {mostrarContactoDirecto && (
                <div className={styles.contactWrapper}>
                  <button
                    ref={contactBtnRef}
                    type="button"
                    className={styles.contactButton}
                    onClick={() => {
                      setContactError("");
                      if (!tieneMultiplesMediosContacto) {
                        handleContactoDirecto(tieneTelefonoContacto ? "whatsapp" : "correo");
                        return;
                      }

                      if (contactDropdownOpen) {
                        setContactDropdownOpen(false);
                        setDropdownPos(null);
                      } else {
                        const rect = contactBtnRef.current?.getBoundingClientRect();
                        if (rect) setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
                        setContactDropdownOpen(true);
                      }
                    }}
                    aria-haspopup={tieneMultiplesMediosContacto ? "true" : undefined}
                    aria-expanded={contactDropdownOpen}
                  >
                    Contacto directo
                  </button>
                  {contactError && (
                    <p className={styles.contactErrorMsg} role="alert">{contactError}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className={styles.navCard} aria-label="Secciones del portafolio">
            <p className={styles.navTitle}>Secciones</p>
            {visibleSections.map((id) => (
              <a key={id} href={`#${id}`} className={styles.navLink}>
                {SECTION_LABELS[id]}
              </a>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          {visibleSections.map(renderSection)}
        </section>
      </main>

      {/* CA #1 y #6: Botón flotante de reporte (oculto para el propietario) */}
      {slug && (
        <ReportarPortafolio slug={slug} esPropioPerfil={esPropioPerfil} />
      )}
      {contactDropdownOpen && dropdownPos && tieneMultiplesMediosContacto && createPortal(
        <div
          className={styles.contactDropdown}
          role="menu"
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 99999 }}
        >
          {tieneTelefonoContacto && (
            <button
              type="button"
              className={styles.contactDropdownItem}
              role="menuitem"
              onClick={() => handleContactoDirecto("whatsapp")}
              disabled={contactLoading}
            >
              WhatsApp
            </button>
          )}
          {tieneCorreoContacto && (
            <button
              type="button"
              className={styles.contactDropdownItem}
              role="menuitem"
              onClick={() => handleContactoDirecto("correo")}
              disabled={contactLoading}
            >
              Correo
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
