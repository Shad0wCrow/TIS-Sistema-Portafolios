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
  const isPrivate = Boolean(portafolio.perfil_privado);
  const initial = portafolio.nombre.charAt(0).toUpperCase() || "P";

  return (
    <article className="portfolio-card">
      <div className={`portfolio-card-action ${isPrivate ? "portfolio-card-private" : ""}`}>
        <div className="portfolio-avatar" aria-hidden="true">
          {portafolio.foto_url && !isPrivate ? (
            <img src={portafolio.foto_url} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div className="portfolio-card-body">
          <h2 className="portfolio-name">{portafolio.nombre}</h2>
          <p className="portfolio-role">{isPrivate ? "Perfil privado" : portafolio.profesion ?? "Portafolio profesional"}</p>
          <p className="portfolio-description">
            {isPrivate ? "Este usuario mantiene privado el contenido de su perfil." : portafolio.descripcion ?? "Publicacion disponible para revisar."}
          </p>
        </div>

        <div className="portfolio-card-actions">
          <button
            type="button"
            className="portfolio-link"
            onClick={() => onOpen(portafolio.slug_publico)}
            disabled={isPrivate}
          >
            {isPrivate ? "Perfil privado" : "Ver portafolio"}
          </button>
          <button
            type="button"
            className="portfolio-save-btn"
            onClick={() => onSave(portafolio.slug_publico)}
            disabled={saving || isPrivate}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </article>
  );
}
