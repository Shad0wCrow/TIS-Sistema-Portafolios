import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ComponentsHome/Header";
import Sidebar from "../../components/ComponentsHome/Sidebar";
import PageLoader from "../../components/ui/PageLoader/PageLoader";
import {
  eliminarPortafolioGuardado,
  getPortafoliosGuardados,
} from "../../services/portafolioservice";
import type { PortafolioGuardadoResumen } from "../../types/portafolioTypes";
import "../Dashboard/Dashboard.css";

export default function Guardados() {
  const navigate = useNavigate();
  const [guardados, setGuardados] = useState<PortafolioGuardadoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  useEffect(() => {
    getPortafoliosGuardados()
      .then(setGuardados)
      .catch(() => setError("No se pudieron cargar los portafolios guardados."))
      .finally(() => setLoading(false));
  }, []);

  const abrirPortafolio = (slug: string) => {
    navigate(`/portafolio/publico/${slug}`);
  };

  const eliminarGuardado = async (slug: string) => {
    if (removingSlug) return;

    try {
      setRemovingSlug(slug);
      await eliminarPortafolioGuardado(slug);
      setGuardados((actuales) => actuales.filter((item) => item.slug_publico !== slug));
    } catch {
      setError("No se pudo eliminar el portafolio guardado.");
    } finally {
      setRemovingSlug(null);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <section className="dashboard-content">
            <div className="dashboard-feed">
              <section className="dashboard-section">
                <div className="feed-header">
                  <div>
                    <span className="publication-kicker">Guardados</span>
                    <h1 className="feed-title">Portafolios guardados</h1>
                    <p className="feed-subtitle">Perfiles profesionales que marcaste para revisar despues.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="feed-empty">
                    <PageLoader message="Cargando guardados..." fullHeight={false} />
                  </div>
                ) : error ? (
                  <div className="feed-empty">
                    <h2 className="empty-state-text">{error}</h2>
                  </div>
                ) : guardados.length > 0 ? (
                  <div className="portfolio-grid">
                    {guardados.map((guardado) => (
                      <article className="portfolio-card" key={guardado.id_guardado}>
                        <div className={`portfolio-card-action ${!guardado.disponible ? "portfolio-card-muted" : ""}`}>
                          <div className="portfolio-avatar" aria-hidden="true">
                            {guardado.foto_url ? (
                              <img src={guardado.foto_url} alt="" />
                            ) : (
                              <span>{guardado.nombre.charAt(0).toUpperCase()}</span>
                            )}
                          </div>

                          <div className="portfolio-card-body">
                            <h2 className="portfolio-name">{guardado.nombre}</h2>
                            <p className="portfolio-role">{guardado.profesion ?? "Portafolio profesional"}</p>
                            <p className="portfolio-description">
                              {guardado.disponible
                                ? guardado.descripcion ?? "Publicacion disponible para revisar."
                                : "Este portafolio ya no esta disponible."}
                            </p>
                          </div>

                          <div className="portfolio-card-actions">
                            <button
                              type="button"
                              className="portfolio-link"
                              onClick={() => abrirPortafolio(guardado.slug_publico)}
                            >
                              Ver portafolio
                            </button>
                            <button
                              type="button"
                              className="portfolio-delete-btn"
                              onClick={() => eliminarGuardado(guardado.slug_publico)}
                              disabled={removingSlug === guardado.slug_publico}
                            >
                              {removingSlug === guardado.slug_publico ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="feed-empty">
                    <h2 className="empty-state-text">No hay portafolios guardados aun.</h2>
                  </div>
                )}
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
