import { useEffect, useState } from "react";
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

// ── Icono persona placeholder ─────────────────────────────────────────────────
const IconoPersona = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

// ── Icono imagen placeholder ──────────────────────────────────────────────────
const IconoImagen = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
  </svg>
);

// ── Modal editar perfil ───────────────────────────────────────────────────────
interface ModalPerfilProps {
  perfil: PortafolioData["perfil"];
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

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
        <p className={styles.modalTitle}>Editar perfil</p>

        <div className={styles.modalField}>
          <label>Nombre</label>
          <input name="nombre_perfil" value={form.nombre_perfil} onChange={handle} placeholder="Nombre" />
        </div>
        <div className={styles.modalField}>
          <label>Apellido</label>
          <input name="apellido_perfil" value={form.apellido_perfil} onChange={handle} placeholder="Apellido" />
        </div>
        <div className={styles.modalField}>
          <label>Profesión</label>
          <input name="profesion" value={form.profesion} onChange={handle} placeholder="Profesión" />
        </div>
        <div className={styles.modalField}>
          <label>Teléfono</label>
          <input name="celular" value={form.celular} onChange={handle} placeholder="Número de teléfono" />
        </div>
        <div className={styles.modalField}>
          <label>Descripción (máx. 200 caracteres)</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handle}
            maxLength={200}
            placeholder="Descripción corta..."
          />
        </div>
        <div className={styles.modalField}>
          <label>URL de foto</label>
          <input name="foto_url" value={form.foto_url} onChange={handle} placeholder="https://..." />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onClose}>Cancelar</button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal agregar habilidad ───────────────────────────────────────────────────
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalTitle}>
          Agregar habilidad {tipo === "tecnica" ? "técnica" : "blanda"}
        </p>

        <div className={styles.modalField}>
          <label>Habilidad</label>
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
          <button className={styles.btnCancelar} onClick={onClose}>Cancelar</button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading || !habilidadId}>
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal agregar / editar proyecto ──────────────────────────────────────────
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
    rolesStr: proyecto?.roles?.join(", ") ?? "", // roles como string separado por comas
  });
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalTitle}>
          {proyecto ? "Editar proyecto" : "Nuevo proyecto"}
        </p>

        <div className={styles.modalField}>
          <label>Título *</label>
          <input name="titulo" value={form.titulo} onChange={handle} placeholder="Nombre del proyecto" />
        </div>
        <div className={styles.modalField}>
          <label>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handle} placeholder="Descripción..." />
        </div>
        <div className={styles.modalField}>
          <label>Fecha inicio</label>
          <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handle} />
        </div>
        <div className={styles.modalField}>
          <label>Fecha fin</label>
          <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handle} />
        </div>
        <div className={styles.modalField}>
          <label>Roles trabajados (separados por coma)</label>
          <input
            name="rolesStr"
            value={form.rolesStr}
            onChange={handle}
            placeholder="Ej: Desarrollador, Diseñador"
          />
        </div>
        <div className={styles.modalField}>
          <label>URL Demo / Enlace del proyecto</label>
          <input name="demo_url" value={form.demo_url} onChange={handle} placeholder="https://..." />
        </div>
        <div className={styles.modalField}>
          <label>URL Repositorio</label>
          <input name="repositorio_url" value={form.repositorio_url} onChange={handle} placeholder="https://github.com/..." />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onClose}>Cancelar</button>
          <button className={styles.btnGuardar} onClick={submit} disabled={loading || !form.titulo.trim()}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EdicionPortafolio() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortafolioData | null>(null);
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorPage, setErrorPage] = useState("");

  // Modales
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalHab, setModalHab] = useState<"tecnica" | "blanda" | null>(null);
  const [modalProy, setModalProy] = useState<Proyecto | null | "nuevo">(null);

  // Cargar datos al montar
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

  // ── Handlers perfil ─────────────────────────────────────────────────────────
  const handleSavePerfil = async (formData: Parameters<typeof updatePerfil>[0]) => {
    await updatePerfil(formData);
    const fresh = await getPortafolio();
    setData(fresh);
  };

  // ── Handlers habilidades ────────────────────────────────────────────────────
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

  // ── Handlers proyectos ──────────────────────────────────────────────────────
  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    if (modalProy && modalProy !== "nuevo") {
      // editar
      await updateProyecto(modalProy.id_proyecto, formData);
    } else {
      // crear
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

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loadingPage) return <div className={styles.loading}>Cargando portafolio...</div>;
  if (errorPage)   return <div className={styles.error}>{errorPage}</div>;
  if (!data)       return null;

  const { perfil, habilidades_tecnicas, habilidades_blandas, proyectos } = data;
  const nombreCompleto = perfil
    ? `${perfil.nombre_perfil} ${perfil.apellido_perfil}`
    : "Nombre completo";

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <p className={styles.headerTitle}>edicion portafolio</p>
      </div>

      {/* ── Sección perfil ── */}
      <div className={styles.perfilSection}>
        {/* Foto + nombre */}
        <div className={styles.fotoWrapper}>
          {perfil?.foto_url ? (
            <img src={perfil.foto_url} alt="foto" className={styles.foto} />
          ) : (
            <div className={styles.fotoPlaceholder}><IconoPersona /></div>
          )}
          <div className={styles.nombreProfesion}>
            <p>{nombreCompleto}</p>
            <p>{perfil?.profesion ?? "Profesión"}</p>
          </div>
        </div>

        {/* Descripción */}
        <div className={`${styles.descripcionBox} ${!perfil?.descripcion ? styles.placeholder : ""}`}>
          {perfil?.descripcion
            ? perfil.descripcion
            : "DESCRIPCION DE 200 caracteres — Descripción corta de cada persona para información básica de perfil con un mínimo de 0 caracteres y con un máximo de 200 caracteres"}
        </div>

        {/* Teléfono + botón editar */}
        <div className={styles.telefonoBox}>
          <span className={styles.telefonoLabel}>
            {perfil?.celular ? perfil.celular : "número de teléfono"}
          </span>
          <button className={styles.editPerfilBtn} onClick={() => setModalPerfil(true)}>
            ✎ Editar perfil
          </button>
        </div>
      </div>

      {/* ── Habilidades ── */}
      <div className={styles.habilidadesSection}>
        {/* Técnicas */}
        <div className={styles.habilidadesCol}>
          <div className={styles.habilidadesHeader}>Habilidades tecnicas</div>
          <div className={styles.habilidadGrid}>
            {habilidades_tecnicas.length === 0 && (
              <p className={styles.emptyMsg}>Sin habilidades técnicas</p>
            )}
            {habilidades_tecnicas.map((h) => (
              <div key={h.id_usuario_habilidad} className={styles.habilidadItem}>
                <span className={styles.habilidadNombre}>{h.nombre}</span>
                <button
                  className={styles.removeHabBtn}
                  title="Eliminar"
                  onClick={() => handleRemoveHabilidad(h.id_usuario_habilidad)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.habilidadAcciones}>
            <button
              className={`${styles.iconBtn} ${styles.iconBtnAdd}`}
              title="Agregar habilidad técnica"
              onClick={() => setModalHab("tecnica")}
            >
              +
            </button>
            <button
              className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
              title="Editar habilidades"
              onClick={() => setModalHab("tecnica")}
            >
              ✎
            </button>
          </div>
        </div>

        {/* Blandas */}
        <div className={styles.habilidadesCol}>
          <div className={styles.habilidadesHeader}>Habilidades blandas</div>
          <div className={styles.habilidadGrid}>
            {habilidades_blandas.length === 0 && (
              <p className={styles.emptyMsg}>Sin habilidades blandas</p>
            )}
            {habilidades_blandas.map((h) => (
              <div key={h.id_usuario_habilidad} className={styles.habilidadItem}>
                <span className={styles.habilidadNombre}>{h.nombre}</span>
                <button
                  className={styles.removeHabBtn}
                  title="Eliminar"
                  onClick={() => handleRemoveHabilidad(h.id_usuario_habilidad)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.habilidadAcciones}>
            <button
              className={`${styles.iconBtn} ${styles.iconBtnAdd}`}
              title="Agregar habilidad blanda"
              onClick={() => setModalHab("blanda")}
            >
              +
            </button>
            <button
              className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
              title="Editar habilidades"
              onClick={() => setModalHab("blanda")}
            >
              ✎
            </button>
          </div>
        </div>
      </div>

      {/* ── Proyectos ── */}
      <div className={styles.proyectosSection}>
        <div className={styles.proyectosTab}>Proyectos</div>

        <div className={styles.proyectosList}>
          {proyectos.length === 0 && (
            <p className={styles.emptyMsg} style={{ padding: "16px" }}>
              No hay proyectos. ¡Agrega tu primer proyecto!
            </p>
          )}
          {proyectos.map((p) => (
            <div key={p.id_proyecto} className={styles.proyectoCard}>
              {/* Info */}
              <div className={styles.proyectoInfo}>
                <p className={styles.proyectoTitulo}>{p.titulo}</p>
                <p className={styles.proyectoFechas}>
                  {p.fecha_inicio ?? "añoini"} - {p.fecha_fin ?? "añofin"}
                </p>
                {p.roles.length > 0 && (
                  <ul className={styles.proyectoRoles}>
                    <li>Roles trabajados</li>
                    {p.roles.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
              </div>

              {/* Descripción */}
              <div className={styles.proyectoDesc}>
                {p.descripcion || "descripcion"}
              </div>

              {/* Acciones */}
              <div className={styles.proyectoAcciones}>
                <div style={{ display: "flex", gap: 6, alignSelf: "flex-start" }}>
                  <button
                    className={styles.deleteProyBtn}
                    title="Eliminar"
                    onClick={() => handleRemoveProyecto(p.id_proyecto)}
                  >
                    ×
                  </button>
                  <button
                    className={styles.editProyBtn}
                    title="Editar"
                    onClick={() => setModalProy(p)}
                  >
                    ✎
                  </button>
                </div>
                <div className={styles.proyectoImgPlaceholder}>
                  {p.imagen_principal_url
                    ? <img src={p.imagen_principal_url} alt="img" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
                    : <IconoImagen />
                  }
                </div>
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.verProyectoLink}
                  >
                    Ver proyecto (enlace)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className={styles.addProyectoBtn} onClick={() => setModalProy("nuevo")}>
          + Agregar proyecto
        </button>
      </div>

      {/* ── Modales ── */}
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