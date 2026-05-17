import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './publicarPortafolio.module.css';
import PageLoader from '../../components/ui/PageLoader/PageLoader';
import {
  despublicarPortafolio,
  generarEnlacePublico,
  getEstadoPublicacion,
  getVisibilidadSecciones,
  publicarPortafolio,
  revocarEnlacePublico,
} from '../../services/portafolioservice';
import type { ConfiguracionSecciones, EstadoPublicacionPortafolio } from '../../types/portafolioTypes';

// --- Iconos ---
function IconArrowLeft() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>; }
function IconGlobe() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>; }
function IconCopy() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>; }
function IconEye() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function IconShare() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>; }
function IconLock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>; }
function IconInfo() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>; }
function IconLink() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>; }
function IconUnlink() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /><line x1="2" y1="2" x2="22" y2="22" /></svg>; }

// Social icons
function IconLinkedIn() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>); }
function IconWhatsApp() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>); }
function IconTwitterX() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>); }
function IconEmail() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>); }
function IconTelegram() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>); }

// --- Helpers ---
type SeccionKey = keyof ConfiguracionSecciones;
const SECCIONES: SeccionKey[] = [
  'seccion_perfil', 'seccion_habilidades', 'seccion_proyectos', 'seccion_educacion',
  'seccion_experiencia', 'seccion_cursos', 'seccion_certificaciones', 'seccion_logros', 'seccion_idiomas',
];

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data;
    if (data) {
      const firstFieldError = data.errors ? Object.values(data.errors)[0]?.[0] : '';
      return firstFieldError || data.message || fallback;
    }
  }
  return fallback;
};

// --- Componente principal ---
export default function PublicarPortafolio() {
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState<EstadoPublicacionPortafolio | null>(null);
  const [config, setConfig] = useState<ConfiguracionSecciones | null>(null);
  const [loading, setLoading] = useState(true);

  // -- Estado de visualización (Tabs) --
  const [activeTab, setActiveTab] = useState<'plataforma' | 'enlace'>('plataforma');

  // -- Estado: Publicar en plataforma --
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState('');
  const [pubValidation, setPubValidation] = useState('');
  const [pubSuccess, setPubSuccess] = useState('');

  // -- Estado: Exportar Enlace --
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    Promise.all([getEstadoPublicacion(), getVisibilidadSecciones()])
      .then(([pub, cfg]) => { setPublicacion(pub); setConfig(cfg); })
      .catch(() => setPubError('No se pudo cargar la información. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const seccionesPublicas = config ? SECCIONES.filter(k => config[k] === 'publico').length : 0;

  const validarPublicacion = (): boolean => {
    if (!config || !SECCIONES.some(k => config[k] === 'publico')) {
      setPubValidation('Debes configurar al menos una sección como pública. Ve a Configurar Visibilidad.');
      return false;
    }
    return true;
  };

  // --- Handlers: Publicar en plataforma ---

  const handlePublicar = async () => {
    if (!validarPublicacion()) return;
    setPublishing(true); setPubError(''); setPubValidation(''); setPubSuccess('');
    try {
      const estado = await publicarPortafolio();
      setPublicacion(estado);
      setPubSuccess('¡Portafolio publicado exitosamente!');
      setTimeout(() => setPubSuccess(''), 4000);
    } catch (err) {
      setPubValidation(getErrorMessage(err, 'No se pudo publicar. Intenta nuevamente.'));
    } finally { setPublishing(false); }
  };

  const handleDespublicar = async () => {
    setPublishing(true); setPubError(''); setPubValidation(''); setPubSuccess('');
    try {
      const estado = await despublicarPortafolio();
      setPublicacion(estado);
      setPubSuccess('Portafolio oculto correctamente.');
      setTimeout(() => setPubSuccess(''), 4000);
    } catch (err) {
      setPubError(getErrorMessage(err, 'No se pudo despublicar. Intenta nuevamente.'));
    } finally { setPublishing(false); }
  };

  // --- Handlers: Exportar enlace público ---

  const handleGenerarEnlace = async () => {
    setGeneratingLink(true); setLinkError(''); setLinkSuccess('');
    try {
      const estado = await generarEnlacePublico();
      setPublicacion(estado);
      setLinkSuccess('¡Enlace público generado correctamente!');
      setTimeout(() => setLinkSuccess(''), 4000);
    } catch (err) {
      setLinkError(getErrorMessage(err, 'No se pudo generar el enlace. Intenta nuevamente.'));
    } finally { setGeneratingLink(false); }
  };

  const handleRevocarEnlace = async () => {
    setGeneratingLink(true); setLinkError(''); setLinkSuccess('');
    try {
      const estado = await revocarEnlacePublico();
      setPublicacion(estado);
      setLinkSuccess('Enlace revocado. Ya no es accesible públicamente.');
      setTimeout(() => setLinkSuccess(''), 4000);
    } catch (err) {
      setLinkError(getErrorMessage(err, 'No se pudo revocar el enlace. Intenta nuevamente.'));
    } finally { setGeneratingLink(false); }
  };

  const handleCopiarUrl = async () => {
    if (!publicacion?.url_publica) return;
    setLinkError('');
    try {
      await navigator.clipboard.writeText(publicacion.url_publica);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setLinkError('No se pudo copiar el enlace.'); }
  };

  const handleAbrirPublico = () => {
    if (publicacion?.slug_publico) {
      window.open(`/portafolio/publico/${publicacion.slug_publico}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <PageLoader message="Cargando configuración..." />;

  return (
    <div className={styles.page}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.backBtn} onClick={() => navigate('/portafolio')}>
            <IconArrowLeft /> Volver
          </button>
          <div className={styles.topbarTitle}>
            <span className={styles.topbarKicker}>Portafolio</span>
            <h1 className={styles.topbarHeading}>Publicar y compartir</h1>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>

          {/* Tabs Navigation */}
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'plataforma' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('plataforma')}
            >
              <IconGlobe /> En plataforma
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'enlace' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('enlace')}
            >
              <IconLink /> Exportar Enlace
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────
              VISTA 1: Publicar en plataforma
          ───────────────────────────────────────────────────────── */}
          {activeTab === 'plataforma' && (
            <section className={`${styles.card} ${styles.fadeEnter}`} aria-labelledby="publish-title">
              <div className={styles.cardBody}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconPublish}`}>
                    <IconGlobe />
                  </div>
                  <div className={styles.sectionCopy}>
                    <p className={`${styles.sectionEyebrow} ${styles.eyebrowPublish}`}>Comunidad</p>
                    <h2 id="publish-title" className={styles.sectionTitle}>Visibilidad en plataforma</h2>
                    <p className={styles.sectionSubtitle}>
                      Haz que tu perfil aparezca en el buscador interno para reclutadores y usuarios.
                    </p>
                  </div>
                  <span className={`${styles.statusPill} ${publicacion?.publicado ? styles.statusPublished : styles.statusDraft}`}>
                    {publicacion?.publicado ? 'Público' : 'Oculto'}
                  </span>
                </div>

                <div className={`${styles.guideBox} ${styles.guidePublish}`}>
                  <IconInfo />
                  <p className={styles.guideText}>
                    Al publicar, tu portafolio será listado en la plataforma. Asegúrate de tener configurado
                    lo que quieres mostrar. Tienes <strong>{seccionesPublicas} de {SECCIONES.length}</strong> secciones
                    marcadas como públicas.
                  </p>
                </div>

                {pubError && <p className={styles.errorMsg}>{pubError}</p>}
                {pubValidation && <p className={styles.validationMsg}>{pubValidation}</p>}
                {pubSuccess && <p className={styles.successMsg}>{pubSuccess}</p>}

                <div className={styles.publishActions}>
                  <button type="button" className={styles.btnPrimary} onClick={handlePublicar} disabled={publishing}>
                    <IconGlobe /> {publishing ? 'Procesando...' : publicacion?.publicado ? 'Actualizar perfil' : 'Publicar perfil'}
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={() => navigate('/portafolio/visibilidad')}>
                    Configurar visibilidad
                  </button>
                  {publicacion?.publicado && (
                    <button type="button" className={styles.btnDanger} onClick={handleDespublicar} disabled={publishing}>
                      Ocultar perfil
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────
              VISTA 2: Exportar Enlace Público
              Independiente de si está publicado en plataforma.
          ───────────────────────────────────────────────────────── */}
          {activeTab === 'enlace' && (
            <section className={`${styles.card} ${styles.fadeEnter}`} aria-labelledby="share-title">
              <div className={styles.cardBody}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionIcon} ${styles.sectionIconShare}`}>
                    <IconLink />
                  </div>
                  <div className={styles.sectionCopy}>
                    <p className={`${styles.sectionEyebrow} ${styles.eyebrowShare}`}>Externo</p>
                    <h2 id="share-title" className={styles.sectionTitle}>Exportar enlace único</h2>
                    <p className={styles.sectionSubtitle}>
                      Comparte un enlace directo a tu portafolio con cualquier persona, cliente o en redes.
                      No requiere que estés publicado en la plataforma.
                    </p>
                  </div>
                  {/* Pill de estado del enlace */}
                  <span className={`${styles.statusPill} ${publicacion?.enlace_activo ? styles.statusPublished : styles.statusDraft}`}>
                    {publicacion?.enlace_activo ? 'Enlace activo' : 'Sin enlace'}
                  </span>
                </div>

                {linkError && <p className={styles.errorMsg}>{linkError}</p>}
                {linkSuccess && <p className={styles.successMsg}>{linkSuccess}</p>}

                {publicacion?.enlace_activo && publicacion?.url_publica ? (
                  <>
                    <div className={styles.urlBox}>
                      <span className={styles.urlText}>{publicacion.url_publica}</span>
                      <button type="button" className={styles.iconActionBtn} onClick={handleCopiarUrl} aria-label="Copiar enlace">
                        {copied ? <IconCheck /> : <IconCopy />}
                      </button>
                    </div>
                    {copied && <p className={styles.copiedToast}>¡Enlace copiado!</p>}

                    <div className={styles.linkActions}>
                      <button type="button" className={styles.btnSecondary} onClick={handleAbrirPublico}>
                        <IconEye /> Visualizar enlace
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={handleRevocarEnlace}
                        disabled={generatingLink}
                      >
                        <IconUnlink /> {generatingLink ? 'Procesando...' : 'Revocar enlace'}
                      </button>
                    </div>

                    <div className={styles.sharePanel}>
                      <div className={styles.sharePanelHeader}>
                        <IconShare />
                        <div>
                          <p className={styles.sharePanelTitle}>Redes y Contactos</p>
                          <p className={styles.sharePanelSub}>Envía tu portafolio directamente con un clic.</p>
                        </div>
                      </div>
                      <div className={styles.shareButtons}>
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicacion.url_publica)}`} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareBtnLinkedIn}`}>
                          <IconLinkedIn /><span>LinkedIn</span>
                        </a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(`Mira mi portafolio profesional: ${publicacion.url_publica}`)}`} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareBtnWhatsApp}`}>
                          <IconWhatsApp /><span>WhatsApp</span>
                        </a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicacion.url_publica)}&text=${encodeURIComponent('Mira mi portafolio profesional')}`} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareBtnTwitter}`}>
                          <IconTwitterX /><span>X</span>
                        </a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(publicacion.url_publica)}&text=${encodeURIComponent('Mira mi portafolio profesional')}`} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareBtnTelegram}`}>
                          <IconTelegram /><span>Telegram</span>
                        </a>
                        <a href={`mailto:?subject=${encodeURIComponent('Mi portafolio profesional')}&body=${encodeURIComponent(`Te comparto mi portafolio profesional: ${publicacion.url_publica}`)}`} className={`${styles.shareBtn} ${styles.shareBtnEmail}`}>
                          <IconEmail /><span>Email</span>
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Estado vacío: aún no se generó un enlace */
                  <div className={styles.unpublishedNotice}>
                    <div className={styles.unpublishedIcon}><IconLock /></div>
                    <div>
                      <p className={styles.unpublishedTitle}>Sin enlace generado</p>
                      <p className={styles.unpublishedText}>
                        Genera un enlace único para compartir tu portafolio externamente.
                        No necesitas publicarlo en la plataforma para obtener el enlace.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleGenerarEnlace}
                      disabled={generatingLink}
                    >
                      <IconLink /> {generatingLink ? 'Generando...' : 'Generar enlace público'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}