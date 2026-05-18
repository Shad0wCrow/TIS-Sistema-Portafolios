import type { PortafolioPublicoResumen } from "../../../types/portafolioTypes";
import PageLoader from "../../../components/ui/PageLoader/PageLoader";
import PublicPortfolioCard from "./PublicPortfolioCard";
import PortfolioSearchBox from "./PortfolioSearchBox";
import { usePortfolioSearch } from "../hooks/usePortfolioSearch";

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
  const {
    query,
    setQuery,
    results,
    loading: searchLoading,
    error: searchError,
    shouldSearch,
    needsMoreCharacters,
  } = usePortfolioSearch();

  const visiblePortafolios = shouldSearch ? results : portafolios;
  const visibleLoading = shouldSearch ? searchLoading : loading;
  const visibleError = shouldSearch ? searchError : error;
  const emptyMessage = shouldSearch
    ? "No se encontraron resultados."
    : "No hay portafolios disponibles para mostrar.";

  return (
    <section className="dashboard-section">
      <div className="feed-header">
        <div>
          <span className="publication-kicker">Portafolios</span>
          <h1 className="feed-title">Portafolios de referencia</h1>
          <p className="feed-subtitle">Explora publicaciones de otros usuarios.</p>
        </div>
        <PortfolioSearchBox value={query} onChange={setQuery} />
      </div>

      {needsMoreCharacters ? (
        <div className="feed-empty">
          <h2 className="empty-state-text">Escribe al menos 2 caracteres para buscar.</h2>
        </div>
      ) : visibleLoading ? (
        <div className="feed-empty">
          <PageLoader message={shouldSearch ? "Buscando portafolios..." : "Cargando portafolios..."} fullHeight={false} />
        </div>
      ) : visibleError ? (
        <div className="feed-empty">
          <h2 className="empty-state-text">{visibleError}</h2>
        </div>
      ) : visiblePortafolios.length > 0 ? (
        <div className="portfolio-grid">
          {visiblePortafolios.map((portafolio) => (
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
          <h2 className="empty-state-text">{emptyMessage}</h2>
        </div>
      )}
    </section>
  );
}
