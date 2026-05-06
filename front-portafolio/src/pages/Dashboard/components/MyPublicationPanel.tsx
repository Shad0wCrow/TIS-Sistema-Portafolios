import type { EstadoPublicacionPortafolio } from "../../../types/portafolioTypes";
import PageLoader from "../../../components/ui/PageLoader/PageLoader";

interface MyPublicationPanelProps {
  publicacion: EstadoPublicacionPortafolio | null;
  loading: boolean;
  copied: boolean;
  onCopy: () => void;
  onOpen: (slug: string) => void;
  onConfigure: () => void;
}

export default function MyPublicationPanel({
  publicacion,
  loading,
  copied,
  onCopy,
  onOpen,
  onConfigure,
}: MyPublicationPanelProps) {
  if (loading) {
    return (
      <article className="publication-card publication-card-compact">
        <PageLoader message="Cargando estado de publicacion..." fullHeight={false} />
      </article>
    );
  }

  if (!publicacion?.publicado) {
    return (
      <article className="publication-card publication-card-compact">
        <div>
          <span className="publication-kicker">Tu publicacion</span>
          <h2 className="publication-title">Publica tu portafolio para compartirlo</h2>
          <p className="publication-description">
            Activa tus secciones visibles y genera un enlace publico.
          </p>
        </div>
        <button type="button" className="publication-primary-btn" onClick={onConfigure}>
          Publicar portafolio
        </button>
      </article>
    );
  }

  return (
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
        <button type="button" className="publication-small-btn" onClick={onCopy}>
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className="publication-actions">
        <button
          type="button"
          className="publication-primary-btn"
          onClick={() => publicacion.slug_publico && onOpen(publicacion.slug_publico)}
        >
          Ver publicacion
        </button>
        <button type="button" className="publication-secondary-btn" onClick={onConfigure}>
          Configurar publicacion
        </button>
      </div>
    </article>
  );
}
