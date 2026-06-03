import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopPortafoliosMes } from "../../../services/portafolioservice";
import type { TopPortafolioMes } from "../../../services/portafolioservice";
import "./TopRankingSection.css";

const MEDAL = [
  { label: "1°", className: "top-card--gold",   icon: "🥇" },
  { label: "2°", className: "top-card--silver", icon: "🥈" },
  { label: "3°", className: "top-card--bronze", icon: "🥉" },
];

export default function TopRankingSection() {
  const navigate = useNavigate();
  const [top, setTop] = useState<TopPortafolioMes[]>([]);
  const [periodoLabel, setPeriodoLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTopPortafoliosMes()
      .then((data) => {
        if (!cancelled) {
          setTop(data.portafolios);
          setPeriodoLabel(data.label);
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el ranking mensual.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="top-ranking-section" aria-label="Ranking mensual de portafolios">
      <div className="top-ranking-header">
        <span className="publication-kicker">Ranking mensual {periodoLabel ? `(${periodoLabel})` : ""}</span>
        <h2 className="top-ranking-title">Top 3 más visitados de {periodoLabel || "el mes anterior"}</h2>
        <p className="top-ranking-subtitle">
          Los portafolios con más visitas correspondientes al periodo de {periodoLabel || "cálculo"}.
        </p>
      </div>

      {loading ? (
        <div className="top-ranking-empty">
          <p className="top-ranking-empty-text">Cargando ranking…</p>
        </div>
      ) : error ? (
        <div className="top-ranking-empty">
          <p className="top-ranking-empty-text">{error}</p>
        </div>
      ) : top.length === 0 ? (
        <div className="top-ranking-empty" aria-live="polite">
          <span className="top-ranking-empty-icon" aria-hidden="true">📊</span>
          <p className="top-ranking-empty-text">
            Aún no hay portafolios visitados este mes.
          </p>
        </div>
      ) : (
        <ol className="top-ranking-list" aria-label="Portafolios más visitados">
          {top.map((p, i) => {
            const medal = MEDAL[i];
            const initial = (p.nombre ?? "P").charAt(0).toUpperCase();
            return (
              <li key={p.id_publicacion} className={`top-card ${medal.className}`}>
                <button
                  type="button"
                  className="top-card-inner"
                  onClick={() => navigate(`/portafolio/publico/${p.slug_publico}`)}
                  aria-label={`Ver portafolio de ${p.nombre}, puesto ${medal.label}, ${p.total_visualizaciones} visitas este mes`}
                >
                  <span className="top-card-medal" aria-hidden="true">
                    {medal.icon}
                  </span>

                  <div className="top-card-avatar" aria-hidden="true">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt="" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  <div className="top-card-body">
                    <p className="top-card-name">{p.nombre}</p>
                    <p className="top-card-role">
                      {p.profesion ?? "Portafolio profesional"}
                    </p>
                  </div>

                  <div className="top-card-visits" aria-hidden="true">
                    <span className="top-card-visits-count">
                      {p.total_visualizaciones.toLocaleString("es")}
                    </span>
                    <span className="top-card-visits-label">visitas</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}