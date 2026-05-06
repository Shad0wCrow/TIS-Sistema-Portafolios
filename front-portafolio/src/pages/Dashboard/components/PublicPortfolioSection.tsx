import { useMemo, useState } from "react";
import type { PortafolioPublicoResumen } from "../../../types/portafolioTypes";
import PageLoader from "../../../components/ui/PageLoader/PageLoader";
import PublicPortfolioCard from "./PublicPortfolioCard";

interface PublicPortfolioSectionProps {
  portafolios: PortafolioPublicoResumen[];
  loading: boolean;
  error: string | null;
  savingSlug: string | null;
  onOpen: (slug: string) => void;
  onSave: (slug: string) => void;
}

export default function PublicPortfolioSection({
  portafolios,
  loading,
  error,
  savingSlug,
  onOpen,
  onSave,
}: PublicPortfolioSectionProps) {
  const [search, setSearch] = useState("");

  const portafoliosFiltrados = useMemo(() => {
    const criterio = search.trim().toLowerCase();

    if (!criterio) {
      return portafolios;
    }

    return portafolios.filter((portafolio) => {
      const texto = `${portafolio.nombre} ${portafolio.profesion ?? ""} ${portafolio.descripcion ?? ""}`.toLowerCase();
      return texto.includes(criterio);
    });
  }, [portafolios, search]);

  return (
   
   
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

      {loading ? (
        <div className="feed-empty">
          <PageLoader message="Cargando portafolios..." fullHeight={false} />
        </div>
      ) : error ? (
        <div className="feed-empty">
          <h2 className="empty-state-text">{error}</h2>
        </div>
      ) : portafoliosFiltrados.length > 0 ? (
        <div className="portfolio-grid">
          {portafoliosFiltrados.map((portafolio) => (
            <PublicPortfolioCard
              key={portafolio.id_publicacion}
              portafolio={portafolio}
              onOpen={onOpen}
              onSave={onSave}
              saving={savingSlug === portafolio.slug_publico}
            />
          ))}
        </div>
      ) : (
        <div className="feed-empty">
          <h2 className="empty-state-text">No hay portafolios disponibles para mostrar.</h2>
        </div>
      )}
    </section>
  );
}
