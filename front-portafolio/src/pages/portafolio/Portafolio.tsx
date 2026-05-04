import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCertificaciones,
  getExperiencias,
  getPortafolio,
  getVisibilidadSecciones,
} from "../../services/portafolioservice";
import type {
  Certificacion,
  ConfiguracionSecciones,
  Curso,
  Educacion,
  Experiencia,
  Idioma,
  Logro,
  PortafolioData,
} from "../../types/portafolioTypes";
import ProjectCard from "../../components/portafolio/ProjectCard";
import SkillChip from "../../components/portafolio/SkillChip";
import styles from "./Portafolio.module.css";

type PreviewSnapshot = {
  data: PortafolioData | null;
  experiencias: Experiencia[];
  certificaciones: Certificacion[];
  updatedAt: string;
};

const PREVIEW_CACHE_KEY = "portafolio_preview_cache";
const SECTION_ORDER_KEY = "portafolio_section_order";

const NIVEL_IDIOMA: Record<string, string> = {
  a1: "A1 - Principiante",
  a2: "A2 - Elemental",
  b1: "B1 - Intermedio",
  b2: "B2 - Intermedio alto",
  c1: "C1 - Avanzado",
  c2: "C2 - Maestría",
  nativo: "Nativo",
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DEFAULTS_SECCIONES: ConfiguracionSecciones = {
  seccion_perfil: "publico",
  seccion_habilidades: "publico",
  seccion_proyectos: "publico",
  seccion_educacion: "publico",
  seccion_experiencia: "publico",
  seccion_cursos: "publico",
  seccion_certificaciones: "publico",
  seccion_logros: "publico",
  seccion_idiomas: "publico",
};

const DEFAULT_SECTION_ORDER = [
  "perfil",
  "habilidades",
  "proyectos",
  "educacion",
  "experiencia",
  "cursos",
  "certificaciones",
  "logros",
  "idiomas",
] as const;

type SectionId = (typeof DEFAULT_SECTION_ORDER)[number];

const SECTION_LABELS: Record<SectionId, string> = {
  perfil: "Perfil profesional",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  educacion: "Formación académica",
  experiencia: "Experiencia laboral",
  cursos: "Cursos",
  certificaciones: "Certificaciones",
  logros: "Logros y reconocimientos",
  idiomas: "Idiomas",
};

const SECTION_CONFIG_KEYS: Record<SectionId, keyof ConfiguracionSecciones> = {
  perfil: "seccion_perfil",
  habilidades: "seccion_habilidades",
  proyectos: "seccion_proyectos",
  educacion: "seccion_educacion",
  experiencia: "seccion_experiencia",
  cursos: "seccion_cursos",
  certificaciones: "seccion_certificaciones",
  logros: "seccion_logros",
  idiomas: "seccion_idiomas",
};

function isSectionPublic(id: SectionId, cfg: ConfiguracionSecciones): boolean {
  return cfg[SECTION_CONFIG_KEYS[id]] === "publico";
}

function loadSectionOrder(): SectionId[] {
  try {
    const raw = localStorage.getItem(SECTION_ORDER_KEY);
    if (!raw) return [...DEFAULT_SECTION_ORDER];
    const ids = JSON.parse(raw) as SectionId[];
    const valid = ids.filter((id) => (DEFAULT_SECTION_ORDER as readonly string[]).includes(id));
    const missing = DEFAULT_SECTION_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing] as SectionId[];
  } catch {
    return [...DEFAULT_SECTION_ORDER];
  }
}

function saveSectionOrder(order: SectionId[]) {
  try {
    localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore storage errors
  }
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconSort() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "Presente";
  const parts = fecha.split("-");
  if (parts.length < 2) return fecha;
  const year = parts[0];
  const monthIndex = Number(parts[1]) - 1;
  const month = MESES[monthIndex] ?? parts[1];
  return `${month} ${year}`;
}

function formatPeriodo(inicio?: string | null, fin?: string | null): string {
  if (!inicio && !fin) return "Sin fechas";
  return `${formatFecha(inicio)} — ${fin ? formatFecha(fin) : "Presente"}`;
}

function readPreviewCache(): PreviewSnapshot | null {
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewSnapshot;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function SectionShell({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.sectionCard}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Sección pública</p>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <span className={styles.sectionCount}>{count}</span>
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
    </div>
  );
}

function TimelineItem({
  title,
  subtitle,
  period,
  description,
  meta,
  extra,
}: {
  title: string;
  subtitle?: string | null;
  period?: string;
  description?: string | null;
  meta?: string[];
  extra?: ReactNode;
}) {
  return (
    <article className={styles.timelineItem}>
      <span className={styles.timelineDot} />
      <div className={styles.timelineContent}>
        <div className={styles.timelineTop}>
          <div className={styles.timelineTitles}>
            <h3 className={styles.timelineName}>{title}</h3>
            {subtitle && <p className={styles.timelineSubtitle}>{subtitle}</p>}
          </div>
          {period && <span className={styles.timelinePeriod}>{period}</span>}
        </div>

        {meta && meta.length > 0 && (
          <div className={styles.metaRow}>
            {meta.map((item) => (
              <span key={item} className={styles.metaPill}>
                {item}
              </span>
            ))}
          </div>
        )}

        {description && <p className={styles.timelineDescription}>{description}</p>}
        {extra}
      </div>
    </article>
  );
}

function CertificacionCard({ cert }: { cert: Certificacion }) {
  const vencida = cert.fecha_expiracion ? new Date(cert.fecha_expiracion).getTime() < Date.now() : false;

  return (
    <article className={styles.certCard}>
      {cert.imagen_url ? (
        <img className={styles.certImage} src={cert.imagen_url} alt={cert.nombre} />
      ) : (
        <div className={styles.certImagePlaceholder}>
          <IconEye />
        </div>
      )}

      <div className={styles.certInfo}>
        <div className={styles.certTop}>
          <h3 className={styles.certTitle}>{cert.nombre}</h3>
          <span className={`${styles.certBadge} ${vencida ? styles.certBadgeExpired : styles.certBadgeActive}`}>
            {vencida ? "Vencida" : "Vigente"}
          </span>
        </div>

        <p className={styles.certEntity}>{cert.nombre_entidad}</p>

        <div className={styles.certMeta}>
          <span className={styles.metaPill}>Obtenida: {formatFecha(cert.fecha_obtencion)}</span>
          {cert.fecha_expiracion && (
            <span className={styles.metaPill}>
              {vencida ? `Venció: ${formatFecha(cert.fecha_expiracion)}` : `Vence: ${formatFecha(cert.fecha_expiracion)}`}
            </span>
          )}
        </div>

        {cert.url_certificado && (
          <a href={cert.url_certificado} target="_blank" rel="noreferrer" className={styles.inlineLink}>
            Ver certificado
          </a>
        )}
      </div>
    </article>
  );
}

export default function Portafolio() {
  const navigate = useNavigate();

  const [data, setData] = useState<PortafolioData | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [secciones, setSecciones] = useState<ConfiguracionSecciones>(DEFAULTS_SECCIONES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(loadSectionOrder);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [dragOrder, setDragOrder] = useState<SectionId[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const openOrderModal = () => {
    setDragOrder([...sectionOrder]);
    setShowOrderModal(true);
  };

  const saveOrder = () => {
    saveSectionOrder(dragOrder);
    setSectionOrder([...dragOrder]);
    setShowOrderModal(false);
  };

  const resetOrder = () => setDragOrder([...DEFAULT_SECTION_ORDER]);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;

    const next = [...dragOrder];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);

    setDragOrder(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    const cached = readPreviewCache();
    if (cached?.data) {
      setData(cached.data);
      setExperiencias(cached.experiencias ?? []);
      setCertificaciones(cached.certificaciones ?? []);
    }

    Promise.all([
      getPortafolio(),
      getExperiencias().catch(() => [] as Experiencia[]),
      getCertificaciones().catch(() => [] as Certificacion[]),
      getVisibilidadSecciones().catch(() => null),
    ])
      .then(([portafolioData, expData, certData, seccionesData]) => {
        setData(portafolioData);
        setExperiencias(expData ?? []);
        setCertificaciones(certData ?? []);
        setSecciones(seccionesData ?? DEFAULTS_SECCIONES);
      })
      .catch(() => setError("Error al cargar el portafolio. Verifica tu conexión."))
      .finally(() => setLoading(false));
  }, []);

  const nombreCompleto = useMemo(() => {
    const perfil = data?.perfil;
    if (!perfil) return "Sin nombre definido";
    return `${perfil.nombre_perfil ?? ""} ${perfil.apellido_perfil ?? ""}`.trim() || "Sin nombre definido";
  }, [data]);

  const perfil = data?.perfil ?? null;
  const habilidadesTecnicas = data?.habilidades_tecnicas ?? [];
  const habilidadesBlandas = data?.habilidades_blandas ?? [];
  const proyectos = data?.proyectos ?? [];
  const educaciones = (data?.educaciones ?? ([] as Educacion[])).filter((item) => item.visibilidad === "publico");
  const cursos = (data?.cursos ?? ([] as Curso[])).filter((item) => item.visibilidad === "publico");
  const logros = (data?.logros ?? ([] as Logro[])).filter((item) => item.visibilidad === "publico");
  const idiomas = (data?.idiomas ?? ([] as Idioma[])).filter((item) => item.visibilidad === "publico");
  const experienciasPublicas = experiencias.filter((item) => item.visibilidad !== "privado");
  const certificacionesPublicas = certificaciones.filter((item) => item.visibilidad === "publico");

  const cfg = secciones;

  const sectionHasContent: Record<SectionId, boolean> = {
    perfil: Boolean(perfil),
    habilidades: habilidadesTecnicas.length + habilidadesBlandas.length > 0,
    proyectos: proyectos.length > 0,
    educacion: educaciones.length > 0,
    experiencia: experienciasPublicas.length > 0,
    cursos: cursos.length > 0,
    certificaciones: certificacionesPublicas.length > 0,
    logros: logros.length > 0,
    idiomas: idiomas.length > 0,
  };

  const seccionesActivas = sectionOrder.some((id) => isSectionPublic(id, cfg) && sectionHasContent[id]);

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
            </div>
          </SectionShell>
        );

      case "habilidades":
        return (
          <SectionShell
            key="habilidades"
            id="habilidades"
            title="Habilidades"
            count={habilidadesTecnicas.length + habilidadesBlandas.length}
          >
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
                  <EmptyState title="Sin habilidades técnicas" description="No hay habilidades técnicas visibles para esta vista previa." />
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
                  <EmptyState title="Sin habilidades blandas" description="No hay habilidades blandas visibles para esta vista previa." />
                )}
              </div>
            </div>
          </SectionShell>
        );

      case "proyectos":
        return (
          <SectionShell key="proyectos" id="proyectos" title="Proyectos" count={proyectos.length}>
            {proyectos.length > 0 ? (
              <div className={styles.projectGrid}>
                {proyectos.map((proyecto) => (
                  <ProjectCard key={proyecto.id_proyecto} proyecto={proyecto} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin proyectos visibles"
                description="Todavía no hay proyectos listos para mostrarse en esta vista previa."
              />
            )}
          </SectionShell>
        );

      case "educacion":
        return (
          <SectionShell key="educacion" id="educacion" title="Formación académica" count={educaciones.length}>
            {educaciones.length > 0 ? (
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
            ) : (
              <EmptyState
                title="Sin formación académica visible"
                description="No hay registros públicos de formación académica para esta vista previa."
              />
            )}
          </SectionShell>
        );

      case "experiencia":
        return (
          <SectionShell key="experiencia" id="experiencia" title="Experiencia laboral" count={experienciasPublicas.length}>
            {experienciasPublicas.length > 0 ? (
              <div className={styles.timelineList}>
                {experienciasPublicas.map((experiencia) => (
                  <TimelineItem
                    key={experiencia.id_experiencia}
                    title={experiencia.puesto}
                    subtitle={experiencia.nombre_empresa}
                    period={formatPeriodo(
                      experiencia.fecha_inicio,
                      experiencia.es_actual ? null : experiencia.fecha_fin ?? null,
                    )}
                    description={experiencia.descripcion}
                    meta={[
                      experiencia.tipo ?? "Experiencia",
                      experiencia.ubicacion ? `Ubicación: ${experiencia.ubicacion}` : "",
                    ].filter(Boolean) as string[]}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Sin experiencia visible" description="No hay experiencias públicas disponibles para esta vista previa." />
            )}
          </SectionShell>
        );

      case "cursos":
        return (
          <SectionShell key="cursos" id="cursos" title="Cursos" count={cursos.length}>
            {cursos.length > 0 ? (
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
            ) : (
              <EmptyState title="Sin cursos visibles" description="No hay cursos públicos para esta vista previa." />
            )}
          </SectionShell>
        );

      case "certificaciones":
        return (
          <SectionShell
            key="certificaciones"
            id="certificaciones"
            title="Certificaciones"
            count={certificacionesPublicas.length}
          >
            {certificacionesPublicas.length > 0 ? (
              <div className={styles.certGrid}>
                {certificacionesPublicas.map((certificacion) => (
                  <CertificacionCard key={certificacion.id_certificacion} cert={certificacion} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin certificaciones visibles"
                description="No hay certificaciones públicas disponibles para esta vista previa."
              />
            )}
          </SectionShell>
        );

      case "logros":
        return (
          <SectionShell key="logros" id="logros" title="Logros y reconocimientos" count={logros.length}>
            {logros.length > 0 ? (
              <div className={styles.timelineList}>
                {logros.map((logro) => (
                  <TimelineItem
                    key={logro.id_logro}
                    title={logro.titulo}
                    subtitle={logro.entidad_nombre ?? "Entidad no especificada"}
                    period={logro.fecha_obtencion ? formatFecha(logro.fecha_obtencion) : undefined}
                    description={logro.descripcion}
                    meta={logro.identificador ? [`ID: ${logro.identificador}`] : []}
                    extra={
                      logro.url_credencial ? (
                        <a href={logro.url_credencial} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                          Ver credencial
                        </a>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Sin logros visibles" description="No hay logros públicos para esta vista previa." />
            )}
          </SectionShell>
        );

      case "idiomas":
        return (
          <SectionShell key="idiomas" id="idiomas" title="Idiomas" count={idiomas.length}>
            {idiomas.length > 0 ? (
              <div className={styles.languagesGrid}>
                {idiomas.map((idioma) => (
                  <article key={idioma.id_usuario_idioma} className={styles.languageCard}>
                    <p className={styles.languageName}>{idioma.nombre}</p>
                    <span className={styles.languageLevel}>
                      {NIVEL_IDIOMA[idioma.nivel] ?? idioma.nivel.toUpperCase()}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin idiomas visibles" description="No hay idiomas públicos para esta vista previa." />
            )}
          </SectionShell>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.stateScreen}>
        <div className={styles.stateCard}>
          <span className={styles.loadingDot} />
          <p>Cargando vista previa del portafolio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={`${styles.stateScreen} ${styles.stateError}`}>{error}</div>;
  }

  if (!seccionesActivas) {
    return (
      <div className={styles.stateScreen}>
        <div className={styles.emptyPreviewCard}>
          <div className={styles.emptyPreviewIcon}>
            <IconEye />
          </div>
          <h1 className={styles.emptyPreviewTitle}>Vista previa no disponible</h1>
          <p className={styles.emptyPreviewText}>
            Debes activar al menos una sección para visualizar cómo quedará tu portafolio antes de publicarlo.
          </p>
          <div className={styles.emptyPreviewActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>
              <IconArrowLeft />
              Volver
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate("/portafolio/editar")}>
              <IconPencil />
              Editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brandBlock}>
          <span className={styles.brandKicker}>Portafolio</span>
          <div>
            <h1 className={styles.brandTitle}>Vista previa</h1>
            <p className={styles.brandSubtitle}>Revisa el contenido tal como se mostrará públicamente.</p>
          </div>
        </div>

        <div className={styles.topActions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>
            <IconArrowLeft />
            Volver
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate("/portafolio/editar")}>
            <IconPencil />
            Editar
          </button>
          <button type="button" className={styles.secondaryButton} onClick={openOrderModal}>
            <IconSort />
            Ordenar secciones
          </button>
                  <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate("/portafolio/visibilidad")}
        >
          Configurar visibilidad
        </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate("/portafolio/editar")}>
            Publicar
          </button>

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
              {perfil?.descripcion && <p className={styles.profileDescription}>{perfil.descripcion}</p>}
            </div>
          </div>

          <nav className={styles.navCard} aria-label="Secciones del portafolio">
            <p className={styles.navTitle}>Secciones</p>
            {sectionOrder.map((id) =>
              isSectionPublic(id, cfg) ? (
                <a key={id} href={`#${id}`} className={styles.navLink}>
                  {SECTION_LABELS[id]}
                </a>
              ) : null,
            )}
          </nav>
        </aside>

        <section className={styles.content}>
          {sectionOrder.map((id) => (isSectionPublic(id, cfg) ? renderSection(id) : null))}
        </section>
      </main>

      {showOrderModal && (
        <div className={styles.modalOverlay} onClick={() => setShowOrderModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Ordenar secciones</h2>
            <p className={styles.modalSub}>Arrastra cada sección para cambiar el orden de visualización.</p>

            <div className={styles.modalList}>
              {dragOrder.map((id, index) => (
                <div
                  key={id}
                  className={[
                    styles.modalItem,
                    dragIndex === index ? styles.modalItemDragging : "",
                    dragOverIndex === index ? styles.modalItemOver : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.modalHandle} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>

                  <span className={styles.modalItemLabel}>{SECTION_LABELS[id]}</span>
                  <span className={styles.modalItemNum}>{index + 1}</span>
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={resetOrder}>
                Restablecer
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowOrderModal(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton} onClick={saveOrder}>
                Guardar orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}