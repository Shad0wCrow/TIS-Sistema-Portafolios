import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminPortfolioStats, type PortfolioStatsResponse } from "../../../services/adminService";
import "../AdminDashboard.css";
import "./Estadisticas.css";

const getTodayString = () => new Date().toISOString().split("T")[0];

const getThisWeekString = () => {
  const d = new Date();
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((d.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const getThisMonthString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getThisYearString = () => {
  return String(new Date().getFullYear());
};

export default function EstadisticasPortafolios() {
  const navigate = useNavigate();
  const [rango, setRango] = useState<string>("mes");
  const [fecha, setFecha] = useState<string>(getThisMonthString());
  const [stats, setStats] = useState<PortfolioStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactivity states
  const [hoveredBar, setHoveredBar] = useState<{
    x: number;
    y: number;
    label: string;
    valor: number;
    index: number;
  } | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPortfolioStats(rango, undefined, fecha);
      setStats(data);
    } catch {
      setError("No se pudieron cargar las estadísticas de portafolios.");
    } finally {
      setLoading(false);
    }
  }, [rango, fecha]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) =>
      localStorage.removeItem(k)
    );
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  // 1. Growth Bar Chart Logic
  const barSvgWidth = 600;
  const barSvgHeight = 240;
  const barPaddingX = 50;
  const barPaddingY = 45;

  const growthPoints = stats?.crecimiento || [];
  const isGrowthEmpty = growthPoints.length === 0 || growthPoints.every((d) => d.valor === 0);

  const rawMax = growthPoints.reduce((max, d) => (d.valor > max ? d.valor : max), 0);
  const maxBarValue = rawMax === 0 ? 10 : Math.ceil(rawMax * 1.1);

  const yTicks = Array.from({ length: 5 }).map((_, i) => {
    const val = (maxBarValue / 4) * i;
    return Math.round(val);
  });

  const barWidth = Math.max(
    4,
    Math.min(
      32,
      ((barSvgWidth - 2 * barPaddingX) / growthPoints.length) * 0.65
    )
  );

  return (
    <div className="admin-page admin-portfolios-page">
      {/* ── Header ── */}
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Panel administrativo</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <Link to="/admin" className="admin-nav-link">
            Dashboard
          </Link>
          <Link to="/admin/estadisticas-usuarios" className="admin-nav-link">
            Estadísticas Usuarios
          </Link>
          <span className="admin-nav-link admin-nav-link--active">
            Estadísticas Portafolios
          </span>
          <Link to="/admin/reportes" className="admin-nav-link">
            Reportes y usuarios
          </Link>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="stats-header-bar">
          <div className="stats-title-block">
            <h1>Volumen de Portafolios</h1>
            <p>
              Estadísticas sobre los portafolios publicados y su crecimiento a lo largo del tiempo.
            </p>
          </div>

          <div className="stats-controls">
            <div className="admin-filter-field" style={{ minWidth: 280, display: "flex", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <span className="admin-stat-label">Periodo:</span>
                <select
                  value={rango}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRango(val);
                    if (val === "hoy") setFecha(getTodayString());
                    else if (val === "semana") setFecha(getThisWeekString());
                    else if (val === "mes") setFecha(getThisMonthString());
                    else if (val === "anio") setFecha(getThisYearString());
                  }}
                  className="stats-select"
                  style={{ width: "100%" }}
                >
                  <option value="hoy">Por Día</option>
                  <option value="semana">Por Semana</option>
                  <option value="mes">Por Mes</option>
                  <option value="anio">Por Año</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <span className="admin-stat-label">Fecha:</span>
                {rango === "hoy" && (
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="stats-select"
                    style={{ width: "100%" }}
                  />
                )}
                {rango === "semana" && (
                  <input
                    type="week"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="stats-select"
                    style={{ width: "100%" }}
                  />
                )}
                {rango === "mes" && (
                  <input
                    type="month"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="stats-select"
                    style={{ width: "100%" }}
                  />
                )}
                {rango === "anio" && (
                  <select
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="stats-select"
                    style={{ width: "100%" }}
                  >
                    {Array.from({ length: new Date().getFullYear() - 2023 }).map((_, i) => {
                      const y = String(2024 + i);
                      return <option key={y} value={y}>{y}</option>;
                    }).reverse()}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        {/* ── Indicators ── */}
        <div className="indicators-row">
          <div className="indicator-card">
            <div className="indicator-info">
              <span className="indicator-title">
                Total histórico de activos
              </span>
              <span className="indicator-value">
                {loading ? "..." : stats?.total_historico_activo.toLocaleString()}
              </span>
            </div>
            <div className="indicator-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
          </div>

          <div className="indicator-card">
            <div className="indicator-info">
              <span className="indicator-title">Creados en el periodo</span>
              <span className="indicator-value">
                {loading ? "..." : stats?.periodo_creados.toLocaleString()}
              </span>
            </div>
            <div className="indicator-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Charts Grid ── */}
        <div className="stats-grid stats-grid--full">
          {/* Chart 1: Volume Growth */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>Portafolios Creados en el Tiempo</h3>
              <p>Visualización del volumen de nuevos portafolios por unidad de tiempo.</p>
            </div>

            {loading ? (
              <div className="admin-table-state">Cargando gráfico de crecimiento…</div>
            ) : (
              <div className="chart-svg-wrapper">
                {isGrowthEmpty && (
                  <div className="chart-empty-overlay">
                    <div className="chart-empty-message">
                      <h4>Sin registros</h4>
                      <p>No se crearon portafolios en el rango de tiempo seleccionado.</p>
                    </div>
                  </div>
                )}

                {/* Custom SVG Bar Chart */}
                <svg viewBox={`0 0 ${barSvgWidth} ${barSvgHeight}`} className="chart-svg">
                  {/* Grid Lines */}
                  {yTicks.map((tick, i) => {
                    const y =
                      barSvgHeight -
                      barPaddingY -
                      (tick * (barSvgHeight - 2 * barPaddingY)) / maxBarValue;
                    return (
                      <g key={i}>
                        <line
                          x1={barPaddingX}
                          y1={y}
                          x2={barSvgWidth - barPaddingX}
                          y2={y}
                          className="chart-grid-line"
                        />
                        <text
                          x={barPaddingX - 10}
                          y={y + 3}
                          textAnchor="end"
                          className="chart-axis-text"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={barPaddingX}
                    y1={barSvgHeight - barPaddingY}
                    x2={barSvgWidth - barPaddingX}
                    y2={barSvgHeight - barPaddingY}
                    className="chart-axis-line"
                  />

                  {/* Render Bars */}
                  {growthPoints.map((d, idx) => {
                    const plotWidth = barSvgWidth - 2 * barPaddingX;
                    const x =
                      barPaddingX +
                      (idx * plotWidth) / Math.max(1, growthPoints.length) +
                      (plotWidth / growthPoints.length - barWidth) / 2;
                    const h = (d.valor * (barSvgHeight - 2 * barPaddingY)) / maxBarValue;
                    const y = barSvgHeight - barPaddingY - h;

                    const showLabel =
                      rango === "hoy"
                        ? idx % 4 === 0
                        : rango === "mes"
                        ? idx % 3 === 0
                        : true;

                    return (
                      <g key={idx}>
                        {showLabel && (
                          <text
                            x={x + barWidth / 2}
                            y={barSvgHeight - barPaddingY + 18}
                            textAnchor="middle"
                            className="chart-axis-text"
                          >
                            {d.label}
                          </text>
                        )}

                        {!isGrowthEmpty && d.valor > 0 && (
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(3, h)}
                            className="chart-bar-rect"
                            onMouseEnter={() =>
                              setHoveredBar({
                                x: x + barWidth / 2,
                                y,
                                label: d.label,
                                valor: d.valor,
                                index: idx,
                              })
                            }
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip for Bar Chart */}
                {hoveredBar && (
                  <div
                    className="chart-tooltip chart-tooltip--visible"
                    style={{
                      left: `${(hoveredBar.x / barSvgWidth) * 100}%`,
                      top: `${(hoveredBar.y / barSvgHeight) * 100}%`,
                    }}
                  >
                    <span className="chart-tooltip-label">{hoveredBar.label}</span>
                    <span className="chart-tooltip-value">{hoveredBar.valor} portafolios</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
