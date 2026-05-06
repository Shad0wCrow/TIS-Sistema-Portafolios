import type { PortafolioPublicoResumen } from "../../../types/portafolioTypes";

interface PublicPortfolioCardProps {
  portafolio: PortafolioPublicoResumen;
  onOpen: (slug: string) => void;
  onSave: (slug: string) => void;
  saving?: boolean;
}

export default function PublicPortfolioCard({
  portafolio,
  onOpen,
  onSave,
  saving = false,
}: PublicPortfolioCardProps) {
  return (
    <article className="portfolio-card">
      <div className="portfolio-card-action">
        <div className="portfolio-avatar" aria-hidden="true">
          {portafolio.foto_url ? (
            <img src={portafolio.foto_url} alt="" />
          ) : (
            <span>{portafolio.nombre.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="portfolio-card-body">
          <h2 className="portfolio-name">{portafolio.nombre}</h2>
          <p className="portfolio-role">{portafolio.profesion ?? "Portafolio profesional"}</p>
          <p className="portfolio-description">
            {portafolio.descripcion ?? "Publicacion disponible para revisar."}
          </p>
        </div>

        <div className="portfolio-card-actions">
          <button type="button" className="portfolio-link" onClick={() => onOpen(portafolio.slug_publico)}>
            Ver portafolio
          </button>
          <button
            type="button"
            className="portfolio-save-btn"
            onClick={() => onSave(portafolio.slug_publico)}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </article>
  );
}
