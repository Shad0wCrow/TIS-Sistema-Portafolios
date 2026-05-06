import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ComponentsHome/Sidebar';
import Header from '../../components/ComponentsHome/Header';
import { getEstadoPublicacion, getPortafoliosPublicos } from '../../services/portafolioservice';
import type { EstadoPublicacionPortafolio, PortafolioPublicoResumen } from '../../types/portafolioTypes';
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState<EstadoPublicacionPortafolio | null>(null);
  const [portafolios, setPortafolios] = useState<PortafolioPublicoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getEstadoPublicacion(), getPortafoliosPublicos(12)])
      .then(([estado, lista]) => {
        setPublicacion(estado);
        setPortafolios(lista);
      })
      .catch(() => {
        setPublicacion(null);
        setPortafolios([]);
        setError('No se pudieron cargar los portafolios publicados.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!publicacion?.url_publica) return;
    await navigator.clipboard.writeText(publicacion.url_publica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const portafoliosFiltrados = portafolios.filter((portafolio) => {
    const texto = `${portafolio.nombre} ${portafolio.profesion ?? ''} ${portafolio.descripcion ?? ''}`.toLowerCase();
    return texto.includes(search.trim().toLowerCase());
  });

  const abrirPortafolio = (slug: string) => {
    navigate(`/portafolio/publico/${slug}`);
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <section className="dashboard-content">
            {loading ? (
              <div className="empty-state-container">
                <h2 className="empty-state-text">Cargando publicaciones...</h2>
              </div>
            ) : (
              <div className="dashboard-feed">
                <section className="dashboard-section">
                  {publicacion?.publicado ? (
                    <article className="publication-card">
                      <div className="publication-card-header">
                        <div>
                          <span className="publication-kicker">Tu publicacion</span>
                          <h2 className="publication-title">Tu portafolio publico esta activo</h2>
                        </div>
                        <span className="publication-status">Publicado</span>
                      </div>

                      <p className="publication-description">
                        Comparte este enlace con reclutadores, clientes o cualquier persona interesada.
                      </p>

                      <div className="publication-url-row">
                        <span className="publication-url">{publicacion.url_publica}</span>
                        <button type="button" className="publication-small-btn" onClick={handleCopy}>
                          {copied ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>

                      <div className="publication-actions">
                        <button
                          type="button"
                          className="publication-primary-btn"
                          onClick={() => navigate(`/portafolio/publico/${publicacion.slug_publico}`)}
                        >
                          Ver publicacion
                        </button>
                        <button
                          type="button"
                          className="publication-secondary-btn"
                          onClick={() => navigate('/portafolio/visibilidad')}
                        >
                          Configurar publicacion
                        </button>
                      </div>
                    </article>
                  ) : (
                    <article className="publication-card publication-card-compact">
                      <div>
                        <span className="publication-kicker">Tu publicacion</span>
                        <h2 className="publication-title">Publica tu portafolio para compartirlo</h2>
                        <p className="publication-description">
                          Activa tus secciones visibles y genera un enlace publico.
                        </p>
                      </div>
                      <button type="button" className="publication-primary-btn" onClick={() => navigate('/portafolio/visibilidad')}>
                        Publicar portafolio
                      </button>
                    </article>
                  )}
                </section>

                <section className="dashboard-section">
                  <div className="feed-header">
                    <div>
                      <span className="publication-kicker">Portafolios</span>
                      <h1 className="feed-title">Portafolios de referencia</h1>
                      <p className="feed-subtitle">Explora publicaciones de otros usuarios.</p>
                    </div>
                    <label className="feed-search">
                      <span className="sr-only">Buscar portafolios</span>
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por nombre o profesion"
                      />
                    </label>
                  </div>

                  {error ? (
                    <div className="feed-empty">
                      <h2 className="empty-state-text">{error}</h2>
                    </div>
                  ) : portafoliosFiltrados.length > 0 ? (
                    <div className="portfolio-grid">
                      {portafoliosFiltrados.map((portafolio) => (
                        <article className="portfolio-card" key={portafolio.id_publicacion}>
                          <button
                            type="button"
                            className="portfolio-card-action"
                            onClick={() => abrirPortafolio(portafolio.slug_publico)}
                            aria-label={`Ver portafolio de ${portafolio.nombre}`}
                          >
                            <div className="portfolio-avatar" aria-hidden="true">
                              {portafolio.foto_url ? (
                                <img src={portafolio.foto_url} alt="" />
                              ) : (
                                <span>{portafolio.nombre.charAt(0).toUpperCase()}</span>
                              )}
                            </div>

                            <div className="portfolio-card-body">
                              <h2 className="portfolio-name">{portafolio.nombre}</h2>
                              <p className="portfolio-role">{portafolio.profesion ?? 'Portafolio profesional'}</p>
                              <p className="portfolio-description">
                                {portafolio.descripcion ?? 'Publicacion disponible para revisar.'}
                              </p>
                            </div>

                            <span className="portfolio-link">Ver portafolio</span>
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="feed-empty">
                      <h2 className="empty-state-text">No hay portafolios disponibles para mostrar.</h2>
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
