import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortafolio } from "../../services/portafolioservice";
import type { PortafolioData, Educacion, Curso, Logro } from "../../types/portafolioTypes";
import ProjectCard from "../../components/portafolio/ProjectCard";
import SkillChip   from "../../components/portafolio/SkillChip";
import styles from "./Portafolio.module.css";




const IconBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);
const IconUser = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

function EmptyState({ label }: { label: string }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyText}>No hay {label} registradas aún</span>
    </div>
  );
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "Presente";
  const [y, m] = fecha.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}

// ── Componente de item de educación ──────────────────────────────────────────
function EducacionItem({ edu }: { edu: Educacion }) {
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>🎓</div>
      <div className={styles.timelineInfo}>
        <span className={styles.timelineTitulo}>{edu.titulo}</span>
        <span className={styles.timelineInstitucion}>{edu.institucion}</span>
        {edu.area_estudio && (
          <span className={styles.timelineArea}>{edu.area_estudio}</span>
        )}
        <span className={styles.timelineFechas}>
          {formatFecha(edu.fecha_inicio)} — {formatFecha(edu.fecha_fin)}
        </span>
        {edu.descripcion && (
          <span className={styles.timelineDesc}>{edu.descripcion}</span>
        )}
      </div>
    </div>
  );
}

// ── Componente de item de curso ───────────────────────────────────────────────
function CursoItem({ curso }: { curso: Curso }) {
  const esActual = curso.fecha_fin === null;
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>📚</div>
      <div className={styles.timelineInfo}>
        <div className={styles.timelineTituloRow}>
          <span className={styles.timelineTitulo}>{curso.titulo}</span>
          {esActual && <span className={styles.badgeActual}>En curso</span>}
        </div>
        <span className={styles.timelineInstitucion}>{curso.institucion}</span>
        <span className={styles.timelineFechas}>
          {formatFecha(curso.fecha_inicio)} — {esActual ? "En curso" : formatFecha(curso.fecha_fin)}
        </span>
        {curso.descripcion && (
          <span className={styles.timelineDesc}>{curso.descripcion}</span>
        )}
      </div>
    </div>
  );
}
function LogroItem({ logro }: { logro: Logro }) {
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineIcono}>🏅</div>
      <div className={styles.timelineInfo}>
        <span className={styles.timelineTitulo}>{logro.titulo}</span>
        <span className={styles.timelineInstitucion}>
          {logro.entidad_nombre ?? "Entidad no especificada"}
        </span>
        {logro.fecha_obtencion && (
          <span className={styles.timelineFechas}>
            {formatFecha(logro.fecha_obtencion)}
          </span>
        )}
        {logro.identificador && (
          <span className={styles.timelineArea}>ID: {logro.identificador}</span>
        )}
        {logro.descripcion && (
          <span className={styles.timelineDesc}>{logro.descripcion}</span>
        )}
      </div>
    </div>
  );
}
export default function Portafolio() {
  const navigate = useNavigate();
  const [data, setData]       = useState<PortafolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    getPortafolio()
      .then(setData)
      .catch(() => setError("Error al cargar el portafolio. Verifica tu conexión."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.stateScreen}>Cargando...</div>;
  if (error)   return <div className={`${styles.stateScreen} ${styles.stateError}`}>{error}</div>;

  const perfil      = data?.perfil ?? null;
  const tecnicas    = data?.habilidades_tecnicas ?? [];
  const blandas     = data?.habilidades_blandas ?? [];
  const proyectos   = data?.proyectos ?? [];
  
  const educaciones = (data?.educaciones ?? [] as Educacion[]).filter(e => e.visibilidad === "publico");
  const cursos      = (data?.cursos ?? [] as Curso[]).filter(c => c.visibilidad === "publico");
  const logros       = (data?.logros ?? [] as Logro[]).filter(l => l.visibilidad === "publico");
  const nombre = perfil
    ? `${perfil.nombre_perfil} ${perfil.apellido_perfil}`.trim()
    : "Sin nombre";

  return (
    <div className={styles.page}>

      <button className={styles.fabBack} onClick={() => navigate(-1)} type="button">
        <IconBack /> Volver
      </button>
      <button className={styles.fabEdit} onClick={() => navigate("/portafolio/editar")} type="button">
        <IconEdit /> Editar portafolio
      </button>

      <div className={styles.container}>

        {/* Hero / Perfil */}
        <section className={styles.hero}>
          <div className={styles.avatarWrap}>
            {perfil?.foto_url
              ? <img src={perfil.foto_url} alt={nombre} className={styles.avatarImg} />
              : <div className={styles.avatarPlaceholder}><IconUser /></div>
            }
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{nombre}</h1>
            <p className={styles.heroProfesion}>{perfil?.profesion ?? "—"}</p>
            {perfil?.descripcion && <p className={styles.heroDesc}>{perfil.descripcion}</p>}
            {perfil?.celular && <span className={styles.heroBadge}>📞 {perfil.celular}</span>}
          </div>
        </section>

        {/* Habilidades */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Habilidades</h2>
            <span className={styles.sectionCount}>{tecnicas.length + blandas.length}</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.habilidadesGrid}>
              <div className={styles.habilidadesCol}>
                <p className={styles.colLabel}>Técnicas</p>
                {tecnicas.length === 0
                  ? <EmptyState label="habilidades técnicas" />
                  : <div className={styles.chipRow}>{tecnicas.map(h => <SkillChip key={h.id_usuario_habilidad} nombre={h.nombre} nivel={h.nivel} tipo="tecnica" />)}</div>
                }
              </div>
              <div className={styles.colDivider} />
              <div className={styles.habilidadesCol}>
                <p className={styles.colLabel}>Blandas</p>
                {blandas.length === 0
                  ? <EmptyState label="habilidades blandas" />
                  : <div className={styles.chipRow}>{blandas.map(h => <SkillChip key={h.id_usuario_habilidad} nombre={h.nombre} tipo="blanda" />)}</div>
                }
              </div>
            </div>
          </div>
        </section>

        {/* Formación Académica */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Formación Académica</h2>
            <span className={styles.sectionCount}>{educaciones.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {educaciones.length === 0
              ? <EmptyState label="formaciones académicas" />
              : <div className={styles.timelineList}>{educaciones.map(e => <EducacionItem key={e.id_educacion} edu={e} />)}</div>
            }
          </div>
        </section>

        {/* Cursos y Certificados */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cursos y Certificados</h2>
            <span className={styles.sectionCount}>{cursos.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {cursos.length === 0
              ? <EmptyState label="cursos" />
              : <div className={styles.timelineList}>{cursos.map(c => <CursoItem key={c.id_educacion} curso={c} />)}</div>
            }
          </div>
          //Logros y Reconocimientos
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Logros y Reconocimientos</h2>
            <span className={styles.sectionCount}>{logros.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {logros.length === 0
              ? <EmptyState label="logros" />
              : <div className={styles.timelineList}>{logros.map(l => <LogroItem key={l.id_logro} logro={l} />)}</div>
            }
          </div>
        </section>
        {/* Proyectos */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Proyectos</h2>
            <span className={styles.sectionCount}>{proyectos.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {proyectos.length === 0
              ? <EmptyState label="proyectos" />
              : <div className={styles.projectGrid}>{proyectos.map(p => <ProjectCard key={p.id_proyecto} proyecto={p} />)}</div>
            }
          </div>
        </section>

      </div>
    </div>
  );
}