import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ComponentsHome/Sidebar';
import Header from '../../components/ComponentsHome/Header';
import { getEstadoPublicacion } from '../../services/portafolioservice';
import type { EstadoPublicacionPortafolio } from '../../types/portafolioTypes';
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState<EstadoPublicacionPortafolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getEstadoPublicacion()
      .then(setPublicacion)
      .catch(() => setPublicacion(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!publicacion?.url_publica) return;
    await navigator.clipboard.writeText(publicacion.url_publica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            ) : publicacion?.publicado ? (
              <article className="publication-card">
                <div className="publication-card-header">
                  <div>
                    <span className="publication-kicker">Portafolio publicado</span>
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
              <div className="empty-state-container">
                <h2 className="empty-state-text">Publicaciones aun no disponibles</h2>
                <button type="button" className="empty-state-btn" onClick={() => navigate('/portafolio/visibilidad')}>
                  Publicar portafolio
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
