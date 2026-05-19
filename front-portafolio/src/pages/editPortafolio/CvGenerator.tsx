import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./cvGenerator.module.css";
import {
  getPortafolio,
  getExperiencias,
  getCertificaciones,
} from "../../services/portafolioservice";
import { normalizarCertificaciones } from "./hooks/usePortafolioHandlers";

import type {
  PortafolioData,
  Experiencia,
  Educacion,
  Certificacion,
  Proyecto,
  Idioma,
} from "../../types/portafolioTypes";

export default function CvGenerator() {
  const navigate = useNavigate();

  const [data, setData] = useState<PortafolioData | null>(null);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para controlar la visibilidad de los elementos
  const [visibleExperiencias, setVisibleExperiencias] = useState<Set<number>>(new Set());
  const [visibleEducaciones, setVisibleEducaciones] = useState<Set<number>>(new Set());
  const [visibleCertificaciones, setVisibleCertificaciones] = useState<Set<number>>(new Set());
  const [visibleProyectos, setVisibleProyectos] = useState<Set<number>>(new Set());
  const [visibleHabilidades, setVisibleHabilidades] = useState<Set<number>>(new Set());

  const [template, setTemplate] = useState<'cascade' | 'classic' | 'influx'>('cascade');
  const [primaryColor, setPrimaryColor] = useState<string>('#5c1825');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [portafolioRes, experienciasRes, certRes] = await Promise.all([
          getPortafolio(),
          getExperiencias(),
          getCertificaciones(),
        ]);
        setData(portafolioRes);
        
        const exps = experienciasRes || [];
        setExperiencias(exps);
        
        const certs = normalizarCertificaciones(certRes) || [];
        setCertificaciones(certs);

        // Por defecto, marcamos todos los elementos como visibles al iniciar
        setVisibleExperiencias(new Set(exps.map((e: any) => e.id_experiencia)));
        setVisibleCertificaciones(new Set(certs.map((c: any) => c.id_certificacion)));
        setVisibleEducaciones(new Set((portafolioRes?.educaciones || []).map((e: any) => e.id_educacion)));
        setVisibleProyectos(new Set((portafolioRes?.proyectos || []).map((p: any) => p.id_proyecto)));
        
        const habs = [
          ...(portafolioRes?.habilidades_tecnicas || []),
          ...(portafolioRes?.habilidades_blandas || [])
        ];
        setVisibleHabilidades(new Set(habs.map((h: any) => h.id_usuario_habilidad)));

      } catch (err) {
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const toggleVisibility = (set: Set<number>, setFunc: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) => {
    const newSet = new Set(set);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setFunc(newSet);
  };

  const handleTemplateChange = (newTemplate: 'cascade' | 'classic' | 'influx') => {
    setTemplate(newTemplate);
    if (newTemplate === 'cascade') setPrimaryColor('#5c1825');
    if (newTemplate === 'classic') setPrimaryColor('#008080');
    if (newTemplate === 'influx') setPrimaryColor('#1a2b4c');
  };

  if (loading) return <div style={{ padding: "40px", color: "#333", fontSize: "1.2rem", background: "#f3f4f6", height: "100vh" }}>Generando CV...</div>;
  if (error) return <div style={{ padding: "40px", color: "red", fontSize: "1.2rem", background: "#f3f4f6", height: "100vh" }}>{error}</div>;
  if (!data) return <div style={{ padding: "40px", color: "#333", fontSize: "1.2rem", background: "#f3f4f6", height: "100vh" }}>No se pudo cargar la información del portafolio.</div>;

  const perfil = data.perfil;
  const educaciones = (data.educaciones || []) as Educacion[];
  const proyectos = (data.proyectos || []) as Proyecto[];
  const habilidadesTecnicas = data.habilidades_tecnicas || [];
  const habilidadesBlandas = data.habilidades_blandas || [];
  const idiomas = (data.idiomas || []) as Idioma[];

  const todasHabilidades = [...habilidadesTecnicas, ...habilidadesBlandas];

  const visibleExp = experiencias.filter((e: any) => visibleExperiencias.has(e.id_experiencia));
  const visibleEdu = educaciones.filter((e: any) => visibleEducaciones.has(e.id_educacion));
  const visibleProy = proyectos.filter((p: any) => visibleProyectos.has(p.id_proyecto));
  const visibleCert = certificaciones.filter((c: any) => visibleCertificaciones.has(c.id_certificacion));
  const visibleHab = todasHabilidades.filter((h: any) => visibleHabilidades.has(h.id_usuario_habilidad));

  const renderCascade = () => (
    <div className={styles.cascadeLayout}>
      <div className={styles.cascadeLeft}>
        {perfil?.foto_url && <img src={perfil.foto_url} alt="Perfil" className={styles.cascadePhoto} />}
        <h1 className={styles.cascadeName}>{perfil?.nombre_perfil} {perfil?.apellido_perfil}</h1>
        
        <div className={styles.cascadeContact}>
          <h3 className={styles.cascadeSectionTitleLeft}>Contacto</h3>
          
          {perfil?.celular && <p className={styles.cascadeText}>{perfil.celular}</p>}
        </div>

        {idiomas.length > 0 && (
          <div className={styles.cascadeLanguages}>
            <h3 className={styles.cascadeSectionTitleLeft}>Idiomas</h3>
            {idiomas.map((idioma: any) => (
              <div key={idioma.id_usuario_idioma || idioma.nombre} className={styles.cascadeText}>
                <strong>{idioma.nombre}</strong><br/>
                Nivel {idioma.nivel}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.cascadeRight}>
        {perfil?.descripcion && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Perfil Profesional</h2>
            <p className={styles.cascadeItemDesc}>{perfil.descripcion}</p>
          </section>
        )}

        {visibleExp.length > 0 && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Experiencia Laboral</h2>
            {visibleExp.map((exp: any) => (
              <div key={exp.id_experiencia} className={styles.cascadeItem}>
                <div className={styles.cascadeItemHeader}>
                  <div className={styles.cascadeItemTitle}>{exp.puesto}</div>
                  <div className={styles.cascadeItemDate}>
                    {new Date(exp.fecha_inicio).toLocaleDateString()} - 
                    {exp.actualmente ? " Presente" : exp.fecha_fin ? ` ${new Date(exp.fecha_fin).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <div className={styles.cascadeItemSub}>{exp.nombre_empresa}</div>
                <p className={styles.cascadeItemDesc}>{exp.descripcion}</p>
              </div>
            ))}
          </section>
        )}

        {visibleEdu.length > 0 && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Educación</h2>
            {visibleEdu.map((edu: any) => (
              <div key={edu.id_educacion} className={styles.cascadeItem}>
                <div className={styles.cascadeItemHeader}>
                  <div className={styles.cascadeItemTitle}>{edu.titulo}</div>
                  <div className={styles.cascadeItemDate}>
                    {edu.fecha_inicio} - {edu.actualmente ? "Presente" : edu.fecha_fin}
                  </div>
                </div>
                <div className={styles.cascadeItemSub}>{edu.institucion}</div>
              </div>
            ))}
          </section>
        )}

        {visibleProy.length > 0 && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Proyectos</h2>
            {visibleProy.map((proy: any) => (
              <div key={proy.id_proyecto} className={styles.cascadeItem}>
                <div className={styles.cascadeItemTitle}>{proy.titulo}</div>
                <p className={styles.cascadeItemDesc}>{proy.descripcion}</p>
              </div>
            ))}
          </section>
        )}

        {visibleCert.length > 0 && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Certificaciones</h2>
            {visibleCert.map((cert: any) => (
              <div key={cert.id_certificacion} className={styles.cascadeItem}>
                <div className={styles.cascadeItemTitle}>{cert.nombre}</div>
                <div className={styles.cascadeItemSub}>{cert.nombre_entidad || cert.entidad_emisora?.nombre} {cert.fecha_obtencion ? `(${new Date(cert.fecha_obtencion).toLocaleDateString()})` : ""}</div>
              </div>
            ))}
          </section>
        )}

        {visibleHab.length > 0 && (
          <section className={styles.cascadeSection}>
            <h2 className={styles.cascadeSectionTitle}>Habilidades</h2>
            <div className={styles.cascadeSkills}>
              {visibleHab.map((hab: any) => (
                <span key={hab.id_usuario_habilidad} className={styles.cascadeSkillBadge}>
                  {hab.nombre}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderClassic = () => (
    <div className={styles.classicLayout}>
      <header className={styles.classicHeader}>
        <div className={styles.classicHeaderInfo}>
          <h1 className={styles.classicName}>{perfil?.nombre_perfil} {perfil?.apellido_perfil}</h1>
          <p className={styles.classicContact}>
           
          </p>
        </div>
        {perfil?.foto_url && <img src={perfil.foto_url} alt="Perfil" className={styles.classicPhoto} />}
      </header>

      <div className={styles.classicBody}>
        {perfil?.descripcion && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Perfil</h2>
            </div>
            <div className={styles.classicSectionContent}>
              <p className={styles.classicItemDesc}>{perfil.descripcion}</p>
            </div>
          </section>
        )}

        {visibleExp.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Experiencia</h2>
            </div>
            <div className={styles.classicSectionContent}>
              {visibleExp.map((exp: any) => (
                <div key={exp.id_experiencia} className={styles.classicItem}>
                  <div className={styles.classicItemTitle}>{exp.puesto}</div>
                  <div className={styles.classicItemSub}>{exp.nombre_empresa}</div>
                  <div className={styles.classicItemDate}>
                    {new Date(exp.fecha_inicio).toLocaleDateString()} - {exp.actualmente ? " Presente" : exp.fecha_fin ? ` ${new Date(exp.fecha_fin).toLocaleDateString()}` : ""}
                  </div>
                  <p className={styles.classicItemDesc}>{exp.descripcion}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleEdu.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Educación</h2>
            </div>
            <div className={styles.classicSectionContent}>
              {visibleEdu.map((edu: any) => (
                <div key={edu.id_educacion} className={styles.classicItem}>
                  <div className={styles.classicItemTitle}>{edu.titulo}</div>
                  <div className={styles.classicItemSub}>{edu.institucion}</div>
                  <div className={styles.classicItemDate}>
                    {edu.fecha_inicio} - {edu.actualmente ? "Presente" : edu.fecha_fin}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleProy.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Proyectos</h2>
            </div>
            <div className={styles.classicSectionContent}>
              {visibleProy.map((proy: any) => (
                <div key={proy.id_proyecto} className={styles.classicItem}>
                  <div className={styles.classicItemTitle}>{proy.titulo}</div>
                  <p className={styles.classicItemDesc}>{proy.descripcion}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleCert.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Certificados</h2>
            </div>
            <div className={styles.classicSectionContent}>
              {visibleCert.map((cert: any) => (
                <div key={cert.id_certificacion} className={styles.classicItem}>
                  <div className={styles.classicItemTitle}>{cert.nombre}</div>
                  <div className={styles.classicItemSub}>
                    {cert.nombre_entidad || cert.entidad_emisora?.nombre} {cert.fecha_obtencion ? `(${new Date(cert.fecha_obtencion).toLocaleDateString()})` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleHab.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Habilidades</h2>
            </div>
            <div className={styles.classicSectionContent}>
              <p className={styles.classicItemDesc}>
                {visibleHab.map((hab: any) => hab.nombre).join(" • ")}
              </p>
            </div>
          </section>
        )}

        {idiomas.length > 0 && (
          <section className={styles.classicSection}>
            <div className={styles.classicSectionTitle}>
              <h2>Idiomas</h2>
            </div>
            <div className={styles.classicSectionContent}>
              <p className={styles.classicItemDesc}>
                {idiomas.map((idioma: any) => `${idioma.nombre} (${idioma.nivel})`).join(" • ")}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderInflux = () => (
    <div className={styles.influxLayout}>
      <header className={styles.influxHeader}>
        <div className={styles.influxHeaderInfo}>
          <h1 className={styles.influxName}>{perfil?.nombre_perfil} {perfil?.apellido_perfil}</h1>
          <p className={styles.influxContact}>
            
          </p>
        </div>
        {perfil?.foto_url && <img src={perfil.foto_url} alt="Perfil" className={styles.influxPhoto} />}
      </header>
      
      <div className={styles.influxBody}>
        {perfil?.descripcion && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Perfil Profesional</h2>
            <p className={styles.influxItemDesc}>{perfil.descripcion}</p>
          </section>
        )}

        {visibleExp.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Experiencia Laboral</h2>
            {visibleExp.map((exp: any) => (
              <div key={exp.id_experiencia} className={styles.influxGrid}>
                <div className={styles.influxItemDate}>
                  {new Date(exp.fecha_inicio).toLocaleDateString()} - <br/>
                  {exp.actualmente ? " Presente" : exp.fecha_fin ? `${new Date(exp.fecha_fin).toLocaleDateString()}` : ""}
                </div>
                <div className={styles.influxItemContent}>
                  <div className={styles.influxItemTitle}>{exp.puesto}</div>
                  <div className={styles.influxItemSub}>{exp.nombre_empresa}</div>
                  <p className={styles.influxItemDesc}>{exp.descripcion}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {visibleEdu.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Educación</h2>
            {visibleEdu.map((edu: any) => (
              <div key={edu.id_educacion} className={styles.influxGrid}>
                <div className={styles.influxItemDate}>
                  {edu.fecha_inicio} - <br/>
                  {edu.actualmente ? "Presente" : edu.fecha_fin}
                </div>
                <div className={styles.influxItemContent}>
                  <div className={styles.influxItemTitle}>{edu.titulo}</div>
                  <div className={styles.influxItemSub}>{edu.institucion}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {visibleProy.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Proyectos</h2>
            {visibleProy.map((proy: any) => (
              <div key={proy.id_proyecto} className={styles.influxGrid}>
                <div className={styles.influxItemDate}>Proyecto</div>
                <div className={styles.influxItemContent}>
                  <div className={styles.influxItemTitle}>{proy.titulo}</div>
                  <p className={styles.influxItemDesc}>{proy.descripcion}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {visibleCert.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Certificaciones</h2>
            {visibleCert.map((cert: any) => (
              <div key={cert.id_certificacion} className={styles.influxGrid}>
                <div className={styles.influxItemDate}>
                  {cert.fecha_obtencion ? new Date(cert.fecha_obtencion).getFullYear() : ""}
                </div>
                <div className={styles.influxItemContent}>
                  <div className={styles.influxItemTitle}>{cert.nombre}</div>
                  <div className={styles.influxItemSub}>{cert.nombre_entidad || cert.entidad_emisora?.nombre}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {visibleHab.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Habilidades</h2>
            <div>
              {visibleHab.map((hab: any) => (
                <span key={hab.id_usuario_habilidad} className={styles.influxSkillBadge}>
                  {hab.nombre}
                </span>
              ))}
            </div>
          </section>
        )}

        {idiomas.length > 0 && (
          <section className={styles.influxSection}>
            <h2 className={styles.influxSectionTitle}>Idiomas</h2>
            <div>
              {idiomas.map((idioma: any) => (
                <span key={idioma.id_usuario_idioma || idioma.nombre} className={styles.influxSkillBadge}>
                  {idioma.nombre} ({idioma.nivel})
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Panel lateral con las opciones de visualización (no se imprime) */}
      <div className={styles.controls}>
        <h2>Configurar CV</h2>
        <button className={styles.printBtn} onClick={handlePrint}>Imprimir / Guardar PDF</button>
        <button className={styles.backBtn} onClick={() => navigate("/portafolio/editar")}>Volver a Edición</button>
        
        <div className={styles.controlSection}>
          <h3>Plantilla de Diseño</h3>
          <div className={styles.templateButtons}>
            <button className={`${styles.templateBtn} ${template === 'cascade' ? styles.active : ''}`} onClick={() => handleTemplateChange('cascade')}>Cascade</button>
            <button className={`${styles.templateBtn} ${template === 'classic' ? styles.active : ''}`} onClick={() => handleTemplateChange('classic')}>Classic</button>
            <button className={`${styles.templateBtn} ${template === 'influx' ? styles.active : ''}`} onClick={() => handleTemplateChange('influx')}>Influx </button>
          </div>
        </div>

        <div className={styles.controlSection}>
          <h3>Color </h3>
          <input 
            type="color" 
            value={primaryColor} 
            onChange={(e) => setPrimaryColor(e.target.value)} 
            className={styles.colorPicker}
          />
        </div>

        <div className={styles.controlSection}>
          <h3>Experiencia Laboral</h3>
          {experiencias.map((exp: any) => (
            <label key={`exp-${exp.id_experiencia}`} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={visibleExperiencias.has(exp.id_experiencia)} 
                onChange={() => toggleVisibility(visibleExperiencias, setVisibleExperiencias, exp.id_experiencia)}
              />
              {exp.puesto} en {exp.nombre_empresa}
            </label>
          ))}
        </div>

        <div className={styles.controlSection}>
          <h3>Educación</h3>
          {educaciones.map((edu: any) => (
            <label key={`edu-${edu.id_educacion}`} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={visibleEducaciones.has(edu.id_educacion)} 
                onChange={() => toggleVisibility(visibleEducaciones, setVisibleEducaciones, edu.id_educacion)}
              />
              {edu.titulo}
            </label>
          ))}
        </div>

        <div className={styles.controlSection}>
          <h3>Proyectos</h3>
          {proyectos.map((proy: any) => (
            <label key={`proy-${proy.id_proyecto}`} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={visibleProyectos.has(proy.id_proyecto)} 
                onChange={() => toggleVisibility(visibleProyectos, setVisibleProyectos, proy.id_proyecto)}
              />
              {proy.titulo}
            </label>
          ))}
        </div>

        <div className={styles.controlSection}>
          <h3>Certificaciones</h3>
          {certificaciones.map((cert: any) => (
            <label key={`cert-${cert.id_certificacion}`} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={visibleCertificaciones.has(cert.id_certificacion)} 
                onChange={() => toggleVisibility(visibleCertificaciones, setVisibleCertificaciones, cert.id_certificacion)}
              />
              {cert.nombre}
            </label>
          ))}
        </div>

        <div className={styles.controlSection}>
          <h3>Habilidades</h3>
          {todasHabilidades.map((hab: any) => (
            <label key={`hab-${hab.id_usuario_habilidad}`} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={visibleHabilidades.has(hab.id_usuario_habilidad)} 
                onChange={() => toggleVisibility(visibleHabilidades, setVisibleHabilidades, hab.id_usuario_habilidad)}
              />
              {hab.nombre}
            </label>
          ))}
        </div>
      </div>

      {/* Vista previa del CV */}
      <div className={styles.cvPreview}>
        <div className={styles.cvDocument} style={{ '--cv-primary-color': primaryColor } as React.CSSProperties}>
          {template === 'cascade' && renderCascade()}
          {template === 'classic' && renderClassic()}
          {template === 'influx' && renderInflux()}
        </div>
      </div>
    </div>
  );
}