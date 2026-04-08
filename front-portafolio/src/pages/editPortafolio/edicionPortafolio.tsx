import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./edicionPortafolio.module.css";
import {
  getPortafolio,
  updatePerfil,
  getCatalogoHabilidades,
  addHabilidad,
  removeHabilidad,
  addProyecto,
  updateProyecto,
  removeProyecto,
} from "../../services/portafolioservice";
import type {
  PortafolioData,
  HabilidadCatalogo,
  Proyecto,
} from "../../types/portafolioTypes";

type ModalProyectoState = Proyecto | null | "nuevo";
type ActiveSection = "perfil" | "habilidades" | "proyectos";

// ─── ICONS ───────────────────────────────────────────────────────────────────

const IconPersona = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const IconImagen = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.4 11H20a1 1 0 1 1 0 2h-9.6l4.3 4.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
  </svg>
);

const IconPencil = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.55-9.55.92.92-9.55 9.55zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.82 1.82 3.75 3.75 1.82-1.82z" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5z" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 6h-1V4c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h1v3l4-3h7l4 3v-3h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9 8H5v-2h6v2zm6-4H5V8h12v2z" />
  </svg>
);

// ─── MODAL PERFIL ─────────────────────────────────────────────────────────────

interface ModalPerfilProps {
  perfil: PortafolioData["perfil"] | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof updatePerfil>[0]) => Promise<void>;
}

function ModalEditarPerfil({ perfil, onClose, onSave }: ModalPerfilProps) {
  const [form, setForm] = useState({
    nombre_perfil: perfil?.nombre_perfil ?? "",
    apellido_perfil: perfil?.apellido_perfil ?? "",
    profesion: perfil?.profesion ?? "",
    celular: perfil?.celular ?? "",
    descripcion: perfil?.descripcion ?? "",
    foto_url: perfil?.foto_url ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try { await onSave(form); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Editar perfil</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalGrid}>
          <div className={styles.modalField}>
            <label>Nombre</label>
            <input name="nombre_perfil" value={form.nombre_perfil} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Apellido</label>
            <input name="apellido_perfil" value={form.apellido_perfil} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Profesión</label>
            <input name="profesion" value={form.profesion} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Teléfono</label>
            <input name="celular" value={form.celular} onChange={handle} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>Descripción (máx. 200 caracteres)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} maxLength={200} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>URL de foto</label>
            <input name="foto_url" value={form.foto_url} onChange={handle} placeholder="https://..." />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL HABILIDAD ──────────────────────────────────────────────────────────

interface ModalHabilidadProps {
  tipo: "tecnica" | "blanda";
  catalogo: HabilidadCatalogo[];
  onClose: () => void;
  onSave: (habilidadId: number, nivel: string) => Promise<void>;
}

function ModalAgregarHabilidad({ tipo, catalogo, onClose, onSave }: ModalHabilidadProps) {
  const filtrado = catalogo.filter((h) => h.tipo === tipo);
  const [habilidadId, setHabilidadId] = useState<number | "">("");
  const [nivel, setNivel] = useState("basico");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!habilidadId) return;
    setLoading(true);
    try { await onSave(Number(habilidadId), nivel); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Habilidad {tipo === "tecnica" ? "técnica" : "blanda"}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalStack}>
          <div className={styles.modalField}>
            <label>Seleccionar habilidad</label>
            <select value={habilidadId} onChange={(e) => setHabilidadId(Number(e.target.value))}>
              <option value="">— Selecciona —</option>
              {filtrado.map((h) => (
                <option key={h.id_habilidad} value={h.id_habilidad}>{h.nombre}</option>
              ))}
            </select>
          </div>
          <div className={styles.modalField}>
            <label>Nivel</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="experto">Experto</option>
            </select>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={submit} disabled={loading || !habilidadId}>
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PROYECTO ───────────────────────────────────────────────────────────

interface ModalProyectoProps {
  proyecto?: Proyecto | null;
  onClose: () => void;
  onSave: (data: Parameters<typeof addProyecto>[0]) => Promise<void>;
}

function ModalProyecto({ proyecto, onClose, onSave }: ModalProyectoProps) {
  const [form, setForm] = useState({
    titulo: proyecto?.titulo ?? "",
    descripcion: proyecto?.descripcion ?? "",
    fecha_inicio: proyecto?.fecha_inicio ?? "",
    fecha_fin: proyecto?.fecha_fin ?? "",
    demo_url: proyecto?.demo_url ?? "",
    repositorio_url: proyecto?.repositorio_url ?? "",
    rolesStr: proyecto?.roles?.join(", ") ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.titulo.trim()) return;
    setLoading(true);
    const roles = form.rolesStr.split(",").map((r) => r.trim()).filter(Boolean);
    try { await onSave({ ...form, roles }); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{proyecto ? "Editar proyecto" : "Nuevo proyecto"}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.modalGrid}>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>Título *</label>
            <input name="titulo" value={form.titulo} onChange={handle} placeholder="Nombre del proyecto" />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} placeholder="Describe el proyecto..." />
          </div>
          <div className={styles.modalField}>
            <label>Fecha inicio</label>
            <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handle} />
          </div>
          <div className={styles.modalField}>
            <label>Fecha fin</label>
            <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handle} />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>Roles trabajados (separados por coma)</label>
            <input name="rolesStr" value={form.rolesStr} onChange={handle} placeholder="Frontend, Backend, DevOps" />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>URL Demo / Enlace</label>
            <input name="demo_url" value={form.demo_url} onChange={handle} placeholder="https://..." />
          </div>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label>URL Repositorio</label>
            <input name="repositorio_url" value={form.repositorio_url} onChange={handle} placeholder="https://github.com/..." />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={submit} disabled={loading || !form.titulo.trim()}>
            {loading ? "Guardando..." : "Guardar proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

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
    setData(await getPortafolio());
  };

  const handleAddHabilidad = async (habilidadId: number, nivel: string) => {
    await addHabilidad({ habilidad_id: habilidadId, nivel });
    setData(await getPortafolio());
  };

  const handleRemoveHabilidad = async (id: number) => {
    if (!confirm("¿Eliminar esta habilidad?")) return;
    await removeHabilidad(id);
    setData(await getPortafolio());
  };

  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    if (modalProy && modalProy !== "nuevo") {
      await updateProyecto(modalProy.id_proyecto, formData);
    } else {
      await addProyecto(formData);
    }
    setData(await getPortafolio());
  };

  const handleRemoveProyecto = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await removeProyecto(id);
    setData(await getPortafolio());
  };

  if (loadingPage) return <div className={styles.stateScreen}>Cargando portafolio...</div>;
  if (errorPage) return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;
  if (!data) return null;

  return (
    <div className={styles.layout}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandTag}>Portfolio</span>
          <p className={styles.brandName}>Editor</p>
          <p className={styles.brandSub}>Vista de edición</p>
        </div>

        <div className={styles.sidebarAvatar}>
          <div className={styles.avatarCircle}>
            {perfil?.foto_url
              ? <img src={perfil.foto_url} alt="avatar" />
              : <IconPersona />}
          </div>
          <div className={styles.avatarInfo}>
            <p className={styles.avatarName}>{nombreCompleto}</p>
            <p className={styles.avatarRole}>{perfil?.profesion ?? "Profesión"}</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>Secciones</span>

          <button
            className={`${styles.navItem} ${activeSection === "perfil" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("perfil")}
          >
            <IconPersona />
            Perfil
          </button>

          <button
            className={`${styles.navItem} ${activeSection === "habilidades" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("habilidades")}
          >
            <IconStar />
            Habilidades
          </button>

          <button
            className={`${styles.navItem} ${activeSection === "proyectos" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("proyectos")}
          >
            <IconFolder />
            Proyectos
            {proyectos.length > 0 && (
              <span className={styles.navBadge}>{proyectos.length}</span>
            )}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <IconArrowLeft />
            Volver atrás
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>

        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.breadcrumb}>
              Portafolio
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>
                {activeSection === "perfil" ? "Perfil" : activeSection === "habilidades" ? "Habilidades" : "Proyectos"}
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

        {/* CONTENT */}
        <div className={styles.content}>

          {/* ── PERFIL ── */}
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

          {/* ── HABILIDADES ── */}
          {activeSection === "habilidades" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Habilidades</span>
                <span className={styles.sectionMeta}>
                  {habilidadesTecnicas.length + habilidadesBlandas.length} registradas
                </span>
              </div>

              <div className={styles.skillsGrid}>
                {(["tecnica", "blanda"] as const).map((tipo) => {
                  const lista = tipo === "tecnica" ? habilidadesTecnicas : habilidadesBlandas;
                  const titulo = tipo === "tecnica" ? "Habilidades técnicas" : "Habilidades blandas";
                  return (
                    <div key={tipo} className={styles.skillCard}>
                      <div className={styles.skillCardHead}>
                        <span className={styles.skillCardTitle}>{titulo}</span>
                        <span className={styles.skillCountBadge}>{lista.length}</span>
                      </div>
                      <div className={styles.skillBody}>
                        {lista.length === 0
                          ? <p className={styles.skillEmpty}>Sin {tipo === "tecnica" ? "habilidades técnicas" : "habilidades blandas"}</p>
                          : (
                            <div className={styles.skillTags}>
                              {lista.map((h) => (
                                <div key={h.id_usuario_habilidad} className={styles.skillTag}>
                                  <span>{h.nombre}</span>
                                  <button className={styles.skillTagDel} onClick={() => handleRemoveHabilidad(h.id_usuario_habilidad)} title="Eliminar">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className={styles.skillFooter}>
                        <button className={`${styles.btnSm} ${styles.btnSmAccent}`} onClick={() => setModalHab(tipo)}>
                          <IconPlus /> Agregar
                        </button>
                        <button className={`${styles.btnSm} ${styles.btnSmGhost}`} onClick={() => setModalHab(tipo)}>
                          <IconPencil /> Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PROYECTOS ── */}
          {activeSection === "proyectos" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Proyectos</span>
                <span className={styles.sectionMeta}>{proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""}</span>
              </div>

              <div className={styles.projectsCard}>
                <div className={styles.projectsList}>
                  {proyectos.length === 0 ? (
                    <div className={styles.projEmpty}>
                      <p>No hay proyectos aún. ¡Agrega tu primer proyecto!</p>
                    </div>
                  ) : (
                    proyectos.map((p) => (
                      <article key={p.id_proyecto} className={styles.projectRow}>
                        <div className={styles.projMain}>
                          <div className={styles.projTitleRow}>
                            <div>
                              <p className={styles.projTitle}>{p.titulo}</p>
                              <p className={styles.projDates}>{p.fecha_inicio ?? "año ini"} — {p.fecha_fin ?? "año fin"}</p>
                            </div>
                            <div className={styles.projActions}>
                              <button className={`${styles.projBtn} ${styles.projBtnDel}`} onClick={() => handleRemoveProyecto(p.id_proyecto)} title="Eliminar">×</button>
                              <button className={`${styles.projBtn} ${styles.projBtnEdit}`} onClick={() => setModalProy(p)} title="Editar"><IconPencil /></button>
                            </div>
                          </div>
                          <div className={styles.projRoles}>
                            <span className={styles.projRolesLabel}>Roles</span>
                            {p.roles.length === 0
                              ? <span className={styles.projRoleEmpty}>Sin roles</span>
                              : (
                                <div className={styles.projRoleList}>
                                  {p.roles.map((r, i) => <span key={i} className={styles.projRolePill}>{r}</span>)}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className={styles.projDesc}>{p.descripcion || "Sin descripción"}</div>
                        <div className={styles.projMedia}>
                          <div className={styles.projImgBox}>
                            {p.imagen_principal_url ? <img src={p.imagen_principal_url} alt={p.titulo} /> : <IconImagen />}
                          </div>
                          {p.demo_url && (
                            <a href={p.demo_url} target="_blank" rel="noreferrer" className={styles.projLink}>Ver proyecto</a>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
                <div className={styles.projectsFooter}>
                  <button className={styles.addProjBtn} onClick={() => setModalProy("nuevo")}>
                    <IconPlus />
                    Agregar proyecto
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MODALES ── */}
      {modalPerfil && (
        <ModalEditarPerfil perfil={perfil} onClose={() => setModalPerfil(false)} onSave={handleSavePerfil} />
      )}
      {modalHab && (
        <ModalAgregarHabilidad tipo={modalHab} catalogo={catalogo} onClose={() => setModalHab(null)} onSave={handleAddHabilidad} />
      )}
      {modalProy !== null && (
        <ModalProyecto proyecto={modalProy === "nuevo" ? null : modalProy} onClose={() => setModalProy(null)} onSave={handleSaveProyecto} />
      )}
    </div>
  );
}