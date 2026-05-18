import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './configuracionPublicacion.module.css';
import PageLoader from '../../components/ui/PageLoader/PageLoader';
import {
  getVisibilidadSecciones,
  updateVisibilidadSecciones,
} from '../../services/portafolioservice';
import type { ConfiguracionSecciones, EstadoVisibilidad } from '../../types/portafolioTypes';
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
  mostrar_correo:          false,
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

// ─── Subcomponente Toggle ─────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  id,
}: {
  value: EstadoVisibilidad;
  onChange: (v: EstadoVisibilidad) => void;
  id: string;
}) {
  const activo = esPublico(value);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      id={id}
      className={`${styles.toggle} ${activo ? styles.toggleOn : styles.toggleOff}`}
      onClick={() => onChange(toggle(value))}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConfiguracionPublicacion() {
  const navigate = useNavigate();
  const [config, setConfig]               = useState<ConfiguracionSecciones>(DEFAULTS);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [savedOk, setSavedOk]             = useState(false);
  const [error, setError]                 = useState('');
  const [validationErr, setValidationErr] = useState('');

  // Cargar configuración al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    getVisibilidadSecciones()
      .then((seccionesData) => {
        setConfig(seccionesData);
      })
      .catch(() => setError('No se pudo cargar la configuración. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleToggle = (key: SeccionKey, value: EstadoVisibilidad) => {
    setValidationErr('');
    setSavedOk(false);
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Activar / desactivar todo
  const todasPublicas = SECCIONES.every((k) => esPublico(config[k]));
  const handleToggleAll = () => {
    const nuevoValor: EstadoVisibilidad = todasPublicas ? 'privado' : 'publico';
    const nuevo = { mostrar_correo: config.mostrar_correo } as ConfiguracionSecciones;
    SECCIONES.forEach((k) => { nuevo[k] = nuevoValor; });
    setConfig(nuevo);
    setValidationErr('');
    setSavedOk(false);
  };

  // CA-4: al menos una sección pública
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
  const handleToggleContacto = () => {
    setValidationErr('');
    setSavedOk(false);
    setConfig((prev) => ({ ...prev, mostrar_correo: !prev.mostrar_correo }));
  };

  if (loading) {
    return <PageLoader message="Cargando configuracion..." />;
  }

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
                Las <strong>privadas</strong> solo las verás tú en el editor.
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

          <div className={styles.sectionRow}>
            <label htmlFor="toggle-contacto-directo" className={styles.sectionLabel}>
              <span className={`${styles.sectionName} ${config.mostrar_correo ? styles.sectionNameActive : ''}`}>
                Contacto directo
              </span>
              <span className={`${styles.sectionBadge} ${config.mostrar_correo ? styles.badgePublico : styles.badgePrivado}`}>
                {config.mostrar_correo ? 'Activo' : 'Inactivo'}
              </span>
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={config.mostrar_correo}
              id="toggle-contacto-directo"
              className={`${styles.toggle} ${config.mostrar_correo ? styles.toggleOn : styles.toggleOff}`}
              onClick={handleToggleContacto}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>

          <ul className={styles.sectionList} role="list">
            {SECCIONES.map((key) => {
              const publico = esPublico(config[key]);
              return (
                <li key={key} className={styles.sectionRow}>
                  <label htmlFor={`toggle-${key}`} className={styles.sectionLabel}>
                    <span className={`${styles.sectionName} ${publico ? styles.sectionNameActive : ''}`}>
                      {SECCION_LABELS[key]}
                    </span>
                    <span className={`${styles.sectionBadge} ${publico ? styles.badgePublico : styles.badgePrivado}`}>
                      {publico ? 'Público' : 'Privado'}
                    </span>
                  </label>
                  <Toggle id={`toggle-${key}`} value={config[key]} onChange={(v) => handleToggle(key, v)} />
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
