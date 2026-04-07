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

const IconoPersona = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const IconoImagen = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.4 11H20a1 1 0 1 1 0 2h-9.6l4.3 4.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.55-9.55.92.92-9.55 9.55zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.82 1.82 3.75 3.75 1.82-1.82z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9zm1 2h4v0H10zm-2 4a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1zm6 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0v-8a1 1 0 0 1 1-1z" />
  </svg>
);

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
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>Editar perfil</p>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
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

          <div className={styles.modalFieldFull}>
            <label>Descripción (máx. 200 caracteres)</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handle}
              maxLength={200}
            />
          </div>

          <div className={styles.modalFieldFull}>
            <label>URL de foto</label>
            <input name="foto_url" value={form.foto_url} onChange={handle} />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    try {
      await onSave(Number(habilidadId), nivel);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>
            Habilidad {tipo === "tecnica" ? "técnica" : "blanda"}
          </p>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.modalField}>
          <label>Seleccionar habilidad</label>
          <select value={habilidadId} onChange={(e) => setHabilidadId(Number(e.target.value))}>
            <option value="">-- Selecciona --</option>
            {filtrado.map((h) => (
              <option key={h.id_habilidad} value={h.id_habilidad}>
                {h.nombre}
              </option>
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

        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading || !habilidadId}>
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

    const roles = form.rolesStr
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      await onSave({ ...form, roles });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>{proyecto ? "Editar proyecto" : "Nuevo proyecto"}</p>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.modalGrid}>
          <div className={styles.modalFieldFull}>
            <label>Título *</label>
            <input name="titulo" value={form.titulo} onChange={handle} />
          </div>

          <div className={styles.modalFieldFull}>
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} />
          </div>

          <div className={styles.modalField}>
            <label>Fecha inicio</label>
            <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handle} />
          </div>

          <div className={styles.modalField}>
            <label>Fecha fin</label>
            <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handle} />
          </div>

          <div className={styles.modalFieldFull}>
            <label>Roles trabajados (separados por coma)</label>
            <input name="rolesStr" value={form.rolesStr} onChange={handle} />
          </div>

          <div className={styles.modalFieldFull}>
            <label>URL Demo / Enlace del proyecto</label>
            <input name="demo_url" value={form.demo_url} onChange={handle} />
          </div>

          <div className={styles.modalFieldFull}>
            <label>URL Repositorio</label>
            <input name="repositorio_url" value={form.repositorio_url} onChange={handle} />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading || !form.titulo.trim()}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SkillSectionProps {
  title: string;
  habilidades: Array<{
    id_usuario_habilidad: number;
    nombre: string;
  }>;
  emptyText: string;
  onAdd: () => void;
  onEdit: () => void;
  onRemove: (id: number) => void;
}

function SkillSection({
  title,
  habilidades,
  emptyText,
  onAdd,
  onEdit,
  onRemove,
}: SkillSectionProps) {
  return (
    <section className={styles.skillsCard}>
      <div className={styles.skillsHeader}>{title}</div>

      <div className={styles.skillsBody}>
        <div className={styles.skillsList}>
          {habilidades.length === 0 ? (
            <p className={styles.emptyMsg}>{emptyText}</p>
          ) : (
            habilidades.map((h) => (
              <div key={h.id_usuario_habilidad} className={styles.skillItem}>
                <span className={styles.skillName}>{h.nombre}</span>
                <button
                  className={styles.skillRemoveBtn}
                  onClick={() => onRemove(h.id_usuario_habilidad)}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.skillsActions}>
          <button className={styles.circleBtn} onClick={onAdd} title="Agregar habilidad">
            <PlusIcon />
          </button>
          <button className={styles.circleBtnDark} onClick={onEdit} title="Editar habilidades">
            <PencilIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  proyecto: Proyecto;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ proyecto, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className={styles.projectCard}>
      <div className={styles.projectLeft}>
        <div className={styles.projectTitleRow}>
          <div>
            <p className={styles.projectTitle}>{proyecto.titulo}</p>
            <p className={styles.projectDates}>
              {proyecto.fecha_inicio ?? "año ini"} - {proyecto.fecha_fin ?? "año fin"}
            </p>
          </div>

          <div className={styles.projectSmallActions}>
            <button className={styles.projectDeleteBtn} onClick={onDelete} title="Eliminar">
              ×
            </button>
            <button className={styles.projectEditBtn} onClick={onEdit} title="Editar">
              <PencilIcon />
            </button>
          </div>
        </div>

        <div className={styles.projectRoles}>
          <strong>Roles trabajados</strong>
          {proyecto.roles.length === 0 ? (
            <div className={styles.projectRoleEmpty}>Sin roles</div>
          ) : (
            <ul>
              {proyecto.roles.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.projectDescription}>
        {proyecto.descripcion || "descripcion"}
      </div>

      <div className={styles.projectRight}>
        <div className={styles.projectImageBox}>
          {proyecto.imagen_principal_url ? (
            <img src={proyecto.imagen_principal_url} alt={proyecto.titulo} />
          ) : (
            <IconoImagen />
          )}
        </div>

        {proyecto.demo_url && (
          <a href={proyecto.demo_url} target="_blank" rel="noreferrer" className={styles.projectLink}>
            Ver proyecto (enlace)
          </a>
        )}
      </div>
    </article>
  );
}

export default function EdicionPortafolio() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");

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
    const fresh = await getPortafolio();
    setData(fresh);
  };

  const handleAddHabilidad = async (habilidadId: number, nivel: string) => {
    await addHabilidad({ habilidad_id: habilidadId, nivel });
    const fresh = await getPortafolio();
    setData(fresh);
  };

  const handleRemoveHabilidad = async (id: number) => {
    if (!confirm("¿Eliminar esta habilidad?")) return;
    await removeHabilidad(id);
    const fresh = await getPortafolio();
    setData(fresh);
  };

  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    if (modalProy && modalProy !== "nuevo") {
      await updateProyecto(modalProy.id_proyecto, formData);
    } else {
      await addProyecto(formData);
    }
    const fresh = await getPortafolio();
    setData(fresh);
  };

  const handleRemoveProyecto = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await removeProyecto(id);
    const fresh = await getPortafolio();
    setData(fresh);
  };

  if (loadingPage) return <div className={styles.loading}>Cargando portafolio...</div>;
  if (errorPage) return <div className={styles.error}>{errorPage}</div>;
  if (!data) return null;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeftIcon />
        </button>
        <span className={styles.topBarTitle}>edicion portafolio</span>
      </div>

      <div className={styles.container}>
        <section className={styles.profileSection}>
          <div className={styles.profileAvatarBlock}>
            <div className={styles.profileAvatar}>
              {perfil?.foto_url ? (
                <img src={perfil.foto_url} alt="Foto perfil" />
              ) : (
                <IconoPersona />
              )}
            </div>

            <div className={styles.profileNameBlock}>
              <p className={styles.profileName}>{nombreCompleto}</p>
              <p className={styles.profileProfession}>{perfil?.profesion ?? "Profesión"}</p>
            </div>
          </div>

          <div className={styles.profileDescription}>
            {perfil?.descripcion
              ? perfil.descripcion
              : "DESCRIPCION DE 200 caracteres Descripcion corta de cada persona para información basica de perfil con un minimo de 0 caracteres y con un maximo de 200 caracteres"}
          </div>

          <div className={styles.profileContact}>
            <p className={styles.profilePhone}>
              {perfil?.celular ? perfil.celular : "número de telefono"}
            </p>
            <button className={styles.editProfileBtn} onClick={() => setModalPerfil(true)}>
              Editar perfil
            </button>
          </div>
        </section>

        <section className={styles.skillsSection}>
          <SkillSection
            title="Habilidades tecnicas"
            habilidades={habilidadesTecnicas}
            emptyText="Sin habilidades técnicas"
            onAdd={() => setModalHab("tecnica")}
            onEdit={() => setModalHab("tecnica")}
            onRemove={handleRemoveHabilidad}
          />

          <SkillSection
            title="Habilidades blandas"
            habilidades={habilidadesBlandas}
            emptyText="Sin habilidades blandas"
            onAdd={() => setModalHab("blanda")}
            onEdit={() => setModalHab("blanda")}
            onRemove={handleRemoveHabilidad}
          />
        </section>

        <section className={styles.projectsSection}>
          <div className={styles.projectsTab}>Proyectos</div>

          <div className={styles.projectsList}>
            {proyectos.length === 0 ? (
              <div className={styles.emptyProjects}>
                <p className={styles.emptyMsg}>No hay proyectos. ¡Agrega tu primer proyecto!</p>
              </div>
            ) : (
              proyectos.map((p) => (
                <ProjectCard
                  key={p.id_proyecto}
                  proyecto={p}
                  onEdit={() => setModalProy(p)}
                  onDelete={() => handleRemoveProyecto(p.id_proyecto)}
                />
              ))
            )}
          </div>

          <button className={styles.addProjectBtn} onClick={() => setModalProy("nuevo")}>
            <PlusIcon />
            Agregar proyecto
          </button>
        </section>
      </div>

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
    </div>
  );
}