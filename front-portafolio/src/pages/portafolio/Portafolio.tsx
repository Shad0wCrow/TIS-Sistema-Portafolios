import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortafolio } from "../../services/portafolioservice";
import type { PortafolioData, Educacion, Curso, Logro, Idioma } from "../../types/portafolioTypes";
import ProjectCard from "../../components/portafolio/ProjectCard";
import SkillChip   from "../../components/portafolio/SkillChip";
import styles from "./Portafolio.module.css";

import { IconBack, IconEdit, IconUser } from "./components/PortafolioIcons";
import EmptyState from "./components/EmptyState";
import EducacionItem from "./components/EducacionItem";
import CursoItem from "./components/CursoItem";
import LogroItem from "./components/LogroItem";

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
  const idiomas      = (data?.idiomas ?? [] as Idioma[]).filter(i => i.visibilidad === "publico");


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

        {/* Cursos */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cursos</h2>
            <span className={styles.sectionCount}>{cursos.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {cursos.length === 0
              ? <EmptyState label="cursos" />
              : <div className={styles.timelineList}>{cursos.map(c => <CursoItem key={c.id_educacion} curso={c} />)}</div>
            }
          </div>
          
         {/* Logros y reconocimientos */}
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
        {/* Idiomas */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Idiomas</h2>
            <span className={styles.sectionCount}>{idiomas.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {idiomas.length === 0
              ? <EmptyState label="idiomas" />
              : <div className={styles.timelineList}>
                  {idiomas.map(i => (
                    <div key={i.id_usuario_idioma} className={styles.timelineItem}>
                      <div className={styles.timelineIcono}>🌐</div>
                      <div className={styles.timelineInfo}>
                        <span className={styles.timelineTitulo}>{i.nombre}</span>
                        {i.nivel && <span className={styles.timelineArea}>{i.nivel.toUpperCase()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </section>
      </div>
    </div>
  );
}