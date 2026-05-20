import { useEffect, useMemo, useState, type DragEvent } from "react";
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
import PageLoader from "../../components/ui/PageLoader/PageLoader";
import styles from "./Portafolio.module.css";

import { IconArrowLeft, IconSort, IconPencil, IconEye, IconUser } from "./components/PortafolioIcons";
import { SectionShell, EmptyState, TimelineItem, CertificacionCard } from "./components/PortafolioSections";
import {
  NIVEL_IDIOMA,
  DEFAULTS_SECCIONES,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  isSectionPublic,
  loadSectionOrder,
  saveSectionOrder,
  formatFecha,
  formatPeriodo,
  readPreviewCache,
} from "./components/portafolioUtils";
import type { SectionId } from "./components/portafolioUtils";

// ── Colores de acento disponibles ────────────────────────────────────────────
const COLOR_STORAGE_KEY = "portafolio_accent_color";

const PRESET_COLORS = [
  { id: "indigo",   label: "Índigo",     value: "#4f46e5" },
  { id: "sky",      label: "Cielo",      value: "#0ea5e9" },
  { id: "emerald",  label: "Esmeralda",  value: "#10b981" },
  { id: "rose",     label: "Rosa",       value: "#f43f5e" },
  { id: "amber",    label: "Ámbar",      value: "#f59e0b" },
  { id: "violet",   label: "Violeta",    value: "#8b5cf6" },
  { id: "slate",    label: "Pizarra",    value: "#475569" },
  { id: "teal",     label: "Verde azul", value: "#14b8a6" },
] as const;

function loadAccentColor(): string {
  try {
    return localStorage.getItem(COLOR_STORAGE_KEY) ?? PRESET_COLORS[0].value;
  } catch {
    return PRESET_COLORS[0].value;
  }
}

function saveAccentColor(color: string): void {
  try {
    localStorage.setItem(COLOR_STORAGE_KEY, color);
  } catch { /* noop */ }
}

function applyAccentColor(color: string): void {
  document.documentElement.style.setProperty("--color-accent", color);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  document.documentElement.style.setProperty(
    "--color-accent-soft",
    `rgba(${r},${g},${b},0.12)`
  );
}
// ────────────────────────────────────────────────────────────────────────────

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

  // ── Color de acento ─────────────────────────────────────────────────────────
  const [accentColor, setAccentColor] = useState<string>(loadAccentColor);
  const [showColorModal, setShowColorModal] = useState(false);
  const [draftColor, setDraftColor] = useState<string>(loadAccentColor);

  // Aplica el color guardado al montar el componente
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  const openColorModal = () => {
    setDraftColor(accentColor);
    setShowColorModal(true);
  };

  const saveColor = () => {
    saveAccentColor(draftColor);
    setAccentColor(draftColor);
    applyAccentColor(draftColor);
    setShowColorModal(false);
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ── PDF export ──────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = document.querySelector<HTMLElement>("#portafolio-content");
      if (!element) throw new Error("Elemento no encontrado");

      const sectionsToHide: HTMLElement[] = [];
      (Object.keys(sectionHasContent) as SectionId[]).forEach((id) => {
        if (!sectionHasContent[id]) {
          const el = document.getElementById(id);
          if (el) {
            el.style.visibility = "hidden";
            el.style.height = "0";
            el.style.overflow = "hidden";
            el.style.padding = "0";
            el.style.margin = "0";
            sectionsToHide.push(el);
          }
        }
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        ignoreElements: (el: Element) => el.classList.contains("pdf-ignore"),
      });

      sectionsToHide.forEach((el) => {
        el.style.visibility = "";
        el.style.height = "";
        el.style.overflow = "";
        el.style.padding = "";
        el.style.margin = "";
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `portafolio-${nombreCompleto.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      (Object.keys(sectionHasContent) as SectionId[]).forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.visibility = "";
          el.style.height = "";
          el.style.overflow = "";
          el.style.padding = "";
          el.style.margin = "";
        }
      });
      alert("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setExporting(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

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
  const certificacionesConImagenes = useMemo(() => {
    return certificaciones.map((c) => ({
      ...c,
      url_imagen: c.url_imagen ?? c.imagen_url ?? null,
    }));
  }, [certificaciones]);

  const certificacionesPublicas = certificacionesConImagenes.filter((item) => item.visibilidad === "publico");

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
    const isEmpty = !sectionHasContent[id];

    switch (id) {
      case "perfil":
        return (
          <SectionShell key="perfil" id="perfil" title="Perfil profesional" count={perfil ? 1 : 0} data-empty={isEmpty ? "true" : undefined}>
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
            data-empty={isEmpty ? "true" : undefined}
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
          <SectionShell key="proyectos" id="proyectos" title="Proyectos" count={proyectos.length} data-empty={isEmpty ? "true" : undefined}>
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
          <SectionShell key="educacion" id="educacion" title="Formación académica" count={educaciones.length} data-empty={isEmpty ? "true" : undefined}>
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
          <SectionShell key="experiencia" id="experiencia" title="Experiencia laboral" count={experienciasPublicas.length} data-empty={isEmpty ? "true" : undefined}>
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
          <SectionShell key="cursos" id="cursos" title="Cursos" count={cursos.length} data-empty={isEmpty ? "true" : undefined}>
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
            data-empty={isEmpty ? "true" : undefined}
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
          <SectionShell key="logros" id="logros" title="Logros y reconocimientos" count={logros.length} data-empty={isEmpty ? "true" : undefined}>
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
          <SectionShell key="idiomas" id="idiomas" title="Idiomas" count={idiomas.length} data-empty={isEmpty ? "true" : undefined}>
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
    return <PageLoader message="Cargando vista previa del portafolio..." />;
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
            <button type="button" className={styles.secondaryButton} onClick={() => navigate("/portafolio/editar")}>
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
          <button type="button" className={styles.secondaryButton} onClick={() => navigate("/portafolio/editar")}>
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

          {/* ── Botón Color ── */}
          <button type="button" className={styles.secondaryButton} onClick={openColorModal}>
            <span
              style={{
                display: "inline-block",
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: accentColor,
                border: "2px solid currentColor",
                flexShrink: 0,
              }}
            />
            Color
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/portafolio/visibilidad")}
          >
            Configurar visibilidad
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleExportPdf}
            disabled={exporting}
          >
            {exporting ? "Generando PDF…" : "⬇ Exportar PDF"}
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate("/portafolio/publicar")}>
            Publicar
          </button>
        </div>
      </header>

      <main id="portafolio-content" className={styles.main}>
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

      {/* ── Modal: Ordenar secciones ── */}
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

      {/* ── Modal: Color del portafolio ── */}
      {showColorModal && (
        <div className={styles.modalOverlay} onClick={() => setShowColorModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Color del portafolio</h2>
            <p className={styles.modalSub}>
              Elige el color de acento que verán quienes visiten tu portafolio.
            </p>

            {/* Vista previa del color seleccionado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                background: `rgba(${parseInt(draftColor.slice(1, 3), 16)},${parseInt(draftColor.slice(3, 5), 16)},${parseInt(draftColor.slice(5, 7), 16)},0.10)`,
                border: `1.5px solid ${draftColor}`,
                marginBottom: "1.25rem",
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: draftColor,
                  display: "block",
                  flexShrink: 0,
                  boxShadow: `0 0 0 4px ${draftColor}33`,
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Color seleccionado:&nbsp;
                <code style={{ fontFamily: "monospace", letterSpacing: "0.03em" }}>{draftColor}</code>
              </span>
            </div>

            {/* Paleta de colores predefinidos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.65rem",
                marginBottom: "1.25rem",
              }}
            >
              {PRESET_COLORS.map((preset) => {
                const isSelected = draftColor === preset.value;
                const r = parseInt(preset.value.slice(1, 3), 16);
                const g = parseInt(preset.value.slice(3, 5), 16);
                const b = parseInt(preset.value.slice(5, 7), 16);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() => setDraftColor(preset.value)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.65rem 0.4rem",
                      borderRadius: "0.5rem",
                      border: isSelected
                        ? `2px solid ${preset.value}`
                        : "2px solid transparent",
                      background: isSelected
                        ? `rgba(${r},${g},${b},0.10)`
                        : "var(--color-surface-alt, #f8fafc)",
                      cursor: "pointer",
                      transition: "border 0.15s, background 0.15s, transform 0.1s",
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: preset.value,
                        display: "block",
                        boxShadow: isSelected
                          ? `0 0 0 3px ${preset.value}55`
                          : "0 1px 3px rgba(0,0,0,0.15)",
                        transition: "box-shadow 0.15s",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--color-text-muted, #64748b)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Color personalizado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: "0.5rem",
                background: "var(--color-surface-alt, #f8fafc)",
                border: "1.5px solid var(--color-border, #e2e8f0)",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted, #64748b)", flexShrink: 0 }}>
                Personalizado:
              </span>
              <input
                type="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.375rem",
                  border: "1.5px solid var(--color-border, #e2e8f0)",
                  cursor: "pointer",
                  padding: 2,
                  background: "none",
                }}
              />
              <code
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted, #64748b)",
                  fontFamily: "monospace",
                  letterSpacing: "0.04em",
                }}
              >
                {draftColor}
              </code>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowColorModal(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton} onClick={saveColor}>
                Aplicar color
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
