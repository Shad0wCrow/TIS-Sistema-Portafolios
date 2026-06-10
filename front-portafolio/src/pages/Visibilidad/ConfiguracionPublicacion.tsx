import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './configuracionPublicacion.module.css';
import PageLoader from '../../components/ui/PageLoader/PageLoader';
import {
  getVisibilidadSecciones,
  updateVisibilidadSecciones,
  getPortafolio,
  getExperiencias,
  getCertificaciones,
} from '../../services/portafolioservice';
import type {
  ConfiguracionSecciones,
  EstadoVisibilidad,
  HabilidadItem,
  Proyecto,
  Educacion,
  Experiencia,
  Curso,
  Logro,
  Idioma,
  Certificacion,
} from '../../types/portafolioTypes';
import { SECCION_LABELS } from '../../types/portafolioTypes';

// ─── Iconos ───────────────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconSave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ width: 16, height: 16, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
type SeccionKey = Exclude<keyof ConfiguracionSecciones, 'mostrar_correo'>;

const SECCIONES: SeccionKey[] = [
  'seccion_perfil',
  'seccion_habilidades',
  'seccion_proyectos',
  'seccion_educacion',
  'seccion_experiencia',
  'seccion_cursos',
  'seccion_certificaciones',
  'seccion_logros',
  'seccion_idiomas',
];

const DEFAULTS: ConfiguracionSecciones = {
  mostrar_correo:          true,
  seccion_perfil:          'publico',
  seccion_habilidades:     'publico',
  seccion_proyectos:       'publico',
  seccion_educacion:       'publico',
  seccion_experiencia:     'publico',
  seccion_cursos:          'publico',
  seccion_certificaciones: 'publico',
  seccion_logros:          'publico',
  seccion_idiomas:         'publico',
};

const esPublico = (v: EstadoVisibilidad) => v === 'publico';
const toggle    = (v: EstadoVisibilidad): EstadoVisibilidad => v === 'publico' ? 'privado' : 'publico';

const API = 'http://localhost:8000/api';
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// ─── Tipos para elementos individuales ───────────────────────────────────────
interface ElementoVisibilidad {
  id: number;
  nombre: string;
  visibilidad: EstadoVisibilidad;
  actualizando?: boolean;
}

type MapaElementos = Partial<Record<SeccionKey, ElementoVisibilidad[]>>;

// Función para actualizar visibilidad de un elemento en el backend
async function patchVisibilidadElemento(
  seccion: SeccionKey,
  id: number,
  visibilidad: EstadoVisibilidad,
): Promise<void> {
  const pathMap: Record<SeccionKey, string> = {
    seccion_habilidades:     `habilidades/${id}/visibilidad`,
    seccion_proyectos:       `proyectos/${id}/visibilidad`,
    seccion_educacion:       `educacion/${id}/visibilidad`,
    seccion_experiencia:     `experiencias/${id}/visibilidad`,
    seccion_cursos:          `cursos/${id}/visibilidad`,
    seccion_certificaciones: `certificaciones/${id}/visibilidad`,
    seccion_logros:          `logros/${id}/visibilidad`,
    seccion_idiomas:         `idiomas/${id}/visibilidad`,
    seccion_perfil:          '',
  };
  const path = pathMap[seccion];
  if (!path) return;

  const res = await fetch(`${API}/${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ visibilidad }),
  });
  if (!res.ok) throw new Error('Error al actualizar visibilidad');
}

// ─── Subcomponente Toggle ─────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  id,
  disabled,
}: {
  value: EstadoVisibilidad;
  onChange: (v: EstadoVisibilidad) => void;
  id: string;
  disabled?: boolean;
}) {
  const activo = esPublico(value);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      id={id}
      className={`${styles.toggle} ${activo ? styles.toggleOn : styles.toggleOff}`}
      onClick={() => !disabled && onChange(toggle(value))}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ─── Subcomponente: fila de elemento individual ───────────────────────────────
function ElementoRow({
  elemento,
  seccion,
  onToggle,
}: {
  elemento: ElementoVisibilidad;
  seccion: SeccionKey;
  onToggle: (seccion: SeccionKey, id: number, nuevoValor: EstadoVisibilidad) => void;
}) {
  const publico = esPublico(elemento.visibilidad);
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.55rem 1rem 0.55rem 2.5rem',
        borderTop: '1px solid var(--color-border, #e2e8f0)',
        gap: '1rem',
        background: 'var(--color-surface-alt, #f8fafc)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 500,
            color: publico ? 'var(--color-text, #1e293b)' : 'var(--color-text-muted, #94a3b8)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {elemento.nombre}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 99,
            fontWeight: 600,
            flexShrink: 0,
            background: publico ? 'var(--color-accent-soft, #ede9fe)' : 'var(--color-surface-alt2, #f1f5f9)',
            color: publico ? 'var(--color-accent, #4f46e5)' : 'var(--color-text-muted, #94a3b8)',
          }}
        >
          {publico ? 'Público' : 'Privado'}
        </span>
      </div>
      <Toggle
        id={`toggle-elem-${seccion}-${elemento.id}`}
        value={elemento.visibilidad}
        onChange={(v) => onToggle(seccion, elemento.id, v)}
        disabled={elemento.actualizando}
      />
    </li>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConfiguracionPublicacion() {
  const navigate = useNavigate();
  const [config, setConfig]               = useState<ConfiguracionSecciones>(DEFAULTS);
  const [perfil, setPerfil]               = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [savedOk, setSavedOk]             = useState(false);
  const [error, setError]                 = useState('');
  const [validationErr, setValidationErr] = useState('');

  // Elementos individuales por sección
  const [elementos, setElementos] = useState<MapaElementos>({});
  const [expandidas, setExpandidas] = useState<Partial<Record<SeccionKey, boolean>>>({});
  const [erroresElem, setErroresElem] = useState<Partial<Record<string, string>>>({});

  // Cargar configuración + todos los elementos al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    Promise.all([
      getVisibilidadSecciones(),
      getPortafolio(),
      getExperiencias().catch(() => [] as Experiencia[]),
      getCertificaciones().catch(() => [] as Certificacion[]),
    ])
      .then(([seccionesData, portafolioData, expData, certData]) => {
        setConfig(seccionesData);
        setPerfil(portafolioData.perfil);

        // Mapear todos los elementos a formato común {id, nombre, visibilidad}
        const habilidades: HabilidadItem[] = [
          ...(portafolioData.habilidades_tecnicas ?? []),
          ...(portafolioData.habilidades_blandas ?? []),
        ];
        const proyectos: Proyecto[]       = portafolioData.proyectos ?? [];
        const educaciones: Educacion[]    = portafolioData.educaciones ?? [];
        const cursos: Curso[]             = portafolioData.cursos ?? [];
        const logros: Logro[]             = portafolioData.logros ?? [];
        const idiomas: Idioma[]           = portafolioData.idiomas ?? [];

        setElementos({
          seccion_habilidades: habilidades.map((h) => ({
            id: h.id_usuario_habilidad,
            nombre: h.nombre + (h.nivel ? ` (${h.nivel})` : ''),
            visibilidad: (h as any).visibilidad ?? 'publico',
          })),
          seccion_proyectos: proyectos.map((p) => ({
            id: p.id_proyecto,
            nombre: p.titulo,
            visibilidad: (p as any).visibilidad ?? 'publico',
          })),
          seccion_educacion: educaciones.map((e) => ({
            id: e.id_educacion,
            nombre: `${e.titulo} — ${e.institucion}`,
            visibilidad: e.visibilidad,
          })),
          seccion_experiencia: expData.map((exp: Experiencia) => ({
            id: exp.id_experiencia,
            nombre: `${exp.puesto} — ${exp.nombre_empresa}`,
            visibilidad: (exp.visibilidad ?? 'publico') as EstadoVisibilidad,
          })),
          seccion_cursos: cursos.map((c) => ({
            id: c.id_educacion,
            nombre: `${c.titulo} — ${c.institucion}`,
            visibilidad: c.visibilidad,
          })),
          seccion_logros: logros.map((l) => ({
            id: l.id_logro,
            nombre: l.titulo,
            visibilidad: l.visibilidad,
          })),
          seccion_certificaciones: certData.map((cert: Certificacion) => ({
            id: cert.id_certificacion,
            nombre: `${cert.nombre} — ${cert.nombre_entidad}`,
            visibilidad: cert.visibilidad,
          })),
          seccion_idiomas: idiomas.map((i) => ({
            id: i.id_usuario_idioma,
            nombre: i.nombre,
            visibilidad: i.visibilidad,
          })),
        });
      })
      .catch(() => setError('No se pudo cargar la configuración. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Toggle de sección completa ────────────────────────────────────────────
  const handleToggle = (key: SeccionKey, value: EstadoVisibilidad) => {
    setValidationErr('');
    setSavedOk(false);
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const todasPublicas = SECCIONES.every((k) => esPublico(config[k]));
  const handleToggleAll = () => {
    const nuevoValor: EstadoVisibilidad = todasPublicas ? 'privado' : 'publico';
    const nuevo = { mostrar_correo: config.mostrar_correo } as ConfiguracionSecciones;
    SECCIONES.forEach((k) => { nuevo[k] = nuevoValor; });
    setConfig(nuevo);
    setValidationErr('');
    setSavedOk(false);
  };

  // ── Toggle de elemento individual ─────────────────────────────────────────
  const handleToggleElemento = async (
    seccion: SeccionKey,
    id: number,
    nuevoValor: EstadoVisibilidad,
  ) => {
    const errKey = `${seccion}-${id}`;
    setErroresElem((prev) => ({ ...prev, [errKey]: '' }));

    // Optimistic update + marcar como actualizando
    setElementos((prev) => ({
      ...prev,
      [seccion]: prev[seccion]?.map((el) =>
        el.id === id ? { ...el, visibilidad: nuevoValor, actualizando: true } : el,
      ),
    }));

    try {
      await patchVisibilidadElemento(seccion, id, nuevoValor);
    } catch {
      // Revertir si falla
      setElementos((prev) => ({
        ...prev,
        [seccion]: prev[seccion]?.map((el) =>
          el.id === id ? { ...el, visibilidad: toggle(nuevoValor), actualizando: false } : el,
        ),
      }));
      setErroresElem((prev) => ({
        ...prev,
        [errKey]: 'No se pudo guardar. Intenta de nuevo.',
      }));
      return;
    }

    // Quitar flag de actualizando
    setElementos((prev) => ({
      ...prev,
      [seccion]: prev[seccion]?.map((el) =>
        el.id === id ? { ...el, actualizando: false } : el,
      ),
    }));
  };

  // ── Expandir/colapsar sección ──────────────────────────────────────────────
  const toggleExpandida = (key: SeccionKey) => {
    setExpandidas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Guardar secciones ─────────────────────────────────────────────────────
  const validar = (): boolean => {
    if (!SECCIONES.some((k) => esPublico(config[k]))) {
      setValidationErr('Debes activar al menos una sección antes de continuar.');
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setSaving(true);
    setError('');
    try {
      await updateVisibilidadSecciones(config);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch {
      setError('Error al guardar. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleVistaPrevia = async () => {
    if (!validar()) return;
    setSaving(true);
    try { await updateVisibilidadSecciones(config); } catch { /* navegar igual */ }
    finally { setSaving(false); }
    navigate('/portafolio');
  };

  const publicasCount = SECCIONES.filter((k) => esPublico(config[k])).length;
  const tieneMedioContacto = Boolean(perfil?.correo_contacto || perfil?.celular);

  const handleToggleContacto = () => {
    if (!tieneMedioContacto) return;
    setValidationErr('');
    setSavedOk(false);
    setConfig((prev) => ({ ...prev, mostrar_correo: !prev.mostrar_correo }));
  };

  if (loading) return <PageLoader message="Cargando configuración..." />;

  return (
    <div className={styles.page}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.backBtn} onClick={() => navigate('/portafolio')}>
            <IconArrowLeft />
            Volver
          </button>
          <div className={styles.topbarTitle}>
            <span className={styles.topbarKicker}>Portafolio</span>
            <h1 className={styles.topbarHeading}>Configuración de visibilidad</h1>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <button type="button" className={styles.btnSecondary} onClick={handleVistaPrevia} disabled={saving}>
            <IconEye />
            Vista previa
          </button>
          <button
            type="button"
            className={`${styles.btnPrimary} ${savedOk ? styles.btnSuccess : ''}`}
            onClick={handleGuardar}
            disabled={saving}
          >
            {savedOk ? <IconCheck /> : <IconSave />}
            {saving ? 'Guardando…' : savedOk ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </header>

      {/* Cuerpo */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Secciones visibles en tu portafolio</h2>
              <p className={styles.cardSubtitle}>
                Las secciones <strong>públicas</strong> serán visibles para cualquier visitante.
                Las <strong>privadas</strong> solo las verás tú. También puedes controlar
                la visibilidad de <strong>cada elemento individual</strong> dentro de una sección.
              </p>
            </div>
            <div className={styles.counter}>
              <span className={styles.counterNum}>{publicasCount}</span>
              <span className={styles.counterLabel}>de {SECCIONES.length} públicas</span>
            </div>
          </div>

          <div className={styles.bulkRow}>
            <button type="button" className={styles.bulkBtn} onClick={handleToggleAll}>
              {todasPublicas ? 'Hacer todo privado' : 'Hacer todo público'}
            </button>
          </div>

          {error         && <p className={styles.errorMsg}>{error}</p>}
          {validationErr && <p className={styles.validationMsg}>{validationErr}</p>}

          {/* Fila de contacto directo */}
          <div className={styles.sectionRow}>
            <label htmlFor="toggle-contacto-directo" className={styles.sectionLabel}>
              <span className={`${styles.sectionName} ${config.mostrar_correo ? styles.sectionNameActive : ''}`}>
                Contacto directo
                {!tieneMedioContacto && (
                  <span style={{ display: 'block', fontSize: '0.8em', color: 'var(--red, #e53e3e)', fontWeight: 'normal', marginTop: '2px' }}>
                    Requiere un correo o telefono en tu perfil
                  </span>
                )}
              </span>
              <span className={`${styles.sectionBadge} ${config.mostrar_correo ? styles.badgePublico : styles.badgePrivado}`}>
                {config.mostrar_correo ? 'Activo' : 'Inactivo'}
              </span>
            </label>
            <button
              type="button" role="switch" aria-checked={config.mostrar_correo}
              id="toggle-contacto-directo"
              className={`${styles.toggle} ${config.mostrar_correo ? styles.toggleOn : styles.toggleOff}`}
              onClick={handleToggleContacto}
              disabled={!tieneMedioContacto}
              style={{ opacity: !tieneMedioContacto ? 0.5 : 1, cursor: !tieneMedioContacto ? 'not-allowed' : 'pointer' }}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>

          {/* Lista de secciones */}
          <ul className={styles.sectionList} role="list">
            {SECCIONES.map((key) => {
              const publico   = esPublico(config[key]);
              const elems     = elementos[key] ?? [];
              const expanded  = expandidas[key] ?? false;
              const tieneElems = elems.length > 0 && key !== 'seccion_perfil';

              return (
                <li key={key} className={styles.sectionRow} style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0 }}>
                  {/* Fila principal de la sección */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', gap: '0.75rem' }}>
                    <label htmlFor={`toggle-${key}`} className={styles.sectionLabel} style={{ flex: 1 }}>
                      <span className={`${styles.sectionName} ${publico ? styles.sectionNameActive : ''}`}>
                        {SECCION_LABELS[key]}
                      </span>
                      <span className={`${styles.sectionBadge} ${publico ? styles.badgePublico : styles.badgePrivado}`}>
                        {publico ? 'Público' : 'Privado'}
                      </span>
                    </label>

                    {/* Botón "ver elementos" solo si hay elementos y no es perfil */}
                    {tieneElems && (
                      <button
                        type="button"
                        onClick={() => toggleExpandida(key)}
                        title={expanded ? 'Ocultar elementos' : 'Ver elementos individuales'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-text-muted, #64748b)',
                          background: 'var(--color-surface-alt, #f1f5f9)',
                          border: '1px solid var(--color-border, #e2e8f0)',
                          borderRadius: '0.375rem',
                          padding: '0.3rem 0.65rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background 0.15s',
                        }}
                      >
                        <IconChevronDown open={expanded} />
                        {elems.length} {elems.length === 1 ? 'elemento' : 'elementos'}
                      </button>
                    )}

                    <Toggle
                      id={`toggle-${key}`}
                      value={config[key]}
                      onChange={(v) => handleToggle(key, v)}
                    />
                  </div>

                  {/* Panel expandible con elementos individuales */}
                  {tieneElems && expanded && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {elems.map((elem) => {
                        const errKey = `${key}-${elem.id}`;
                        return (
                          <div key={elem.id}>
                            <ElementoRow
                              elemento={elem}
                              seccion={key}
                              onToggle={handleToggleElemento}
                            />
                            {erroresElem[errKey] && (
                              <p style={{ margin: 0, padding: '0.25rem 2.5rem', fontSize: '0.75rem', color: 'var(--red, #e53e3e)', background: 'var(--color-surface-alt, #f8fafc)' }}>
                                {erroresElem[errKey]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.cardFooter}>
            <p className={styles.footerNote}>
              Si una sección es <strong>privada</strong>, ningún elemento de esa sección se mostrará
              al público, sin importar la visibilidad individual de cada elemento.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
