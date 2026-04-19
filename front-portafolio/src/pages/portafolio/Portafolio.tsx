import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortafolio } from "../../services/portafolioservice";
import type { PortafolioData } from "../../types/portafolioTypes";


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

//Vacio generico
function EmptyState({ label }: { label: string }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyText}>No hay {label} registradas aún</span>
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

  const perfil    = data?.perfil ?? null;
  const tecnicas  = data?.habilidades_tecnicas ?? [];
  const blandas   = data?.habilidades_blandas ?? [];
  const proyectos = data?.proyectos ?? [];
  const nombre    = perfil
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
                  : (
                    <div className={styles.chipRow}>
                      {tecnicas.map(h => (
                        <SkillChip key={h.id_usuario_habilidad} nombre={h.nombre} nivel={h.nivel} tipo="tecnica" />
                      ))}
                    </div>
                  )
                }
              </div>

              <div className={styles.colDivider} />

              <div className={styles.habilidadesCol}>
                <p className={styles.colLabel}>Blandas</p>
                {blandas.length === 0
                  ? <EmptyState label="habilidades blandas" />
                  : (
                    <div className={styles.chipRow}>
                      {blandas.map(h => (
                        <SkillChip key={h.id_usuario_habilidad} nombre={h.nombre} tipo="blanda" />
                      ))}
                    </div>
                  )
                }
              </div>

            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Proyectos</h2>
            <span className={styles.sectionCount}>{proyectos.length}</span>
          </div>
          <div className={styles.sectionBody}>
            {proyectos.length === 0
              ? <EmptyState label="proyectos" />
              : (
                <div className={styles.projectGrid}>
                  {proyectos.map(p => (
                    <ProjectCard key={p.id_proyecto} proyecto={p} />
                  ))}
                </div>
              )
            }
          </div>
        </section>

        {/*
          Para agregar secciones futuras
        */}

      </div>
    </div>
  );
}