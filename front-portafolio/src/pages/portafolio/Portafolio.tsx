import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getCertificaciones, getExperiencias, getPortafolio } from "../../services/portafolioservice";
import type {
  Certificacion,
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

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
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
              <span key={item} className={styles.metaPill}>{item}</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    ])
      .then(([portafolioData, expData, certData]) => {
        setData(portafolioData);
        setExperiencias(expData ?? []);
        setCertificaciones(certData ?? []);
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
  const educaciones = (data?.educaciones ?? [] as Educacion[]).filter((item) => item.visibilidad === "publico");
  const cursos = (data?.cursos ?? [] as Curso[]).filter((item) => item.visibilidad === "publico");
  const logros = (data?.logros ?? [] as Logro[]).filter((item) => item.visibilidad === "publico");
  const idiomas = (data?.idiomas ?? [] as Idioma[]).filter((item) => item.visibilidad === "publico");
  const experienciasPublicas = experiencias.filter((item) => item.visibilidad !== "privado");
  const certificacionesPublicas = certificaciones.filter((item) => item.visibilidad === "publico");

  const seccionesActivas = [
    perfil ? 1 : 0,
    habilidadesTecnicas.length + habilidadesBlandas.length,
    proyectos.length,
    educaciones.length,
    experienciasPublicas.length,
    cursos.length,
    logros.length,
    idiomas.length,
    certificacionesPublicas.length,
  ].some((cantidad) => cantidad > 0);

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
            <a href="#perfil" className={styles.navLink}>Perfil</a>
            <a href="#habilidades" className={styles.navLink}>Habilidades</a>
            <a href="#proyectos" className={styles.navLink}>Proyectos</a>
            <a href="#educacion" className={styles.navLink}>Formación académica</a>
            <a href="#experiencia" className={styles.navLink}>Experiencia laboral</a>
            <a href="#cursos" className={styles.navLink}>Cursos</a>
            <a href="#certificaciones" className={styles.navLink}>Certificaciones</a>
            <a href="#logros" className={styles.navLink}>Logros y reconocimientos</a>
            <a href="#idiomas" className={styles.navLink}>Idiomas</a>
          </nav>
        </aside>

        <section className={styles.content}>
          <SectionShell id="perfil" title="Perfil profesional" count={perfil ? 1 : 0}>
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

          <SectionShell id="habilidades" title="Habilidades" count={habilidadesTecnicas.length + habilidadesBlandas.length}>
            <div className={styles.splitGrid}>
              <div className={styles.splitColumn}>
                <p className={styles.splitLabel}>Técnicas</p>
                {habilidadesTecnicas.length > 0 ? (
                  <div className={styles.chipWrap}>
                    {habilidadesTecnicas.map((item) => (
                      <SkillChip
                        key={item.id_usuario_habilidad}
                        nombre={item.nombre}
                        nivel={item.nivel}
                        tipo="tecnica"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Sin habilidades técnicas"
                    description="No hay habilidades técnicas visibles para esta vista previa."
                  />
                )}
              </div>
              <div className={styles.splitColumn}>
                <p className={styles.splitLabel}>Blandas</p>
                {habilidadesBlandas.length > 0 ? (
                  <div className={styles.chipWrap}>
                    {habilidadesBlandas.map((item) => (
                      <SkillChip
                        key={item.id_usuario_habilidad}
                        nombre={item.nombre}
                        nivel={item.nivel}
                        tipo="blanda"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Sin habilidades blandas"
                    description="No hay habilidades blandas visibles para esta vista previa."
                  />
                )}
              </div>
            </div>
          </SectionShell>

          <SectionShell id="proyectos" title="Proyectos" count={proyectos.length}>
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

          <SectionShell id="educacion" title="Formación académica" count={educaciones.length}>
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

          <SectionShell id="experiencia" title="Experiencia laboral" count={experienciasPublicas.length}>
            {experienciasPublicas.length > 0 ? (
              <div className={styles.timelineList}>
                {experienciasPublicas.map((experiencia) => (
                  <TimelineItem
                    key={experiencia.id_experiencia}
                    title={experiencia.puesto}
                    subtitle={experiencia.nombre_empresa}
                    period={formatPeriodo(experiencia.fecha_inicio, experiencia.es_actual ? null : experiencia.fecha_fin ?? null)}
                    description={experiencia.descripcion}
                    meta={[
                      experiencia.tipo ?? "Experiencia",
                      experiencia.ubicacion ? `Ubicación: ${experiencia.ubicacion}` : "",
                    ].filter(Boolean) as string[]}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin experiencia visible"
                description="No hay experiencias públicas disponibles para esta vista previa."
              />
            )}
          </SectionShell>

          <SectionShell id="cursos" title="Cursos" count={cursos.length}>
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
              <EmptyState
                title="Sin cursos visibles"
                description="No hay cursos públicos para esta vista previa."
              />
            )}
          </SectionShell>

          <SectionShell id="certificaciones" title="Certificaciones" count={certificacionesPublicas.length}>
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

          <SectionShell id="logros" title="Logros y reconocimientos" count={logros.length}>
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
                    extra={logro.url_credencial ? <a href={logro.url_credencial} target="_blank" rel="noreferrer" className={styles.inlineLink}>Ver credencial</a> : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin logros visibles"
                description="No hay logros públicos para esta vista previa."
              />
            )}
          </SectionShell>

          <SectionShell id="idiomas" title="Idiomas" count={idiomas.length}>
            {idiomas.length > 0 ? (
              <div className={styles.languagesGrid}>
                {idiomas.map((idioma) => (
                  <article key={idioma.id_usuario_idioma} className={styles.languageCard}>
                    <p className={styles.languageName}>{idioma.nombre}</p>
                    <span className={styles.languageLevel}>{NIVEL_IDIOMA[idioma.nivel] ?? idioma.nivel.toUpperCase()}</span>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin idiomas visibles"
                description="No hay idiomas públicos para esta vista previa."
              />
            )}
          </SectionShell>
        </section>
      </main>
    </div>
  );
}
