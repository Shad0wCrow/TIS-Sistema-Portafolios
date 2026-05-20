import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminPortfolioStats, type PortfolioStatsResponse } from "../../../services/adminService";
import "../AdminDashboard.css";
import "./Estadisticas.css";

export default function EstadisticasPortafolios() {
  const navigate = useNavigate();
  const [rango, setRango] = useState<string>("mes");
  const [profesion, setProfesion] = useState<string>("");
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

  const [hoveredSliceIdx, setHoveredSliceIdx] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPortfolioStats(rango, profesion);
      setStats(data);
    } catch {
      setError("No se pudieron cargar las estadísticas de portafolios.");
    } finally {
      setLoading(false);
    }
  }, [rango, profesion]);

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

  // Color palette for the Donut chart slices (Admin green theme variations)
  const sliceColors = [
    "#166644", // --admin-accent
    "#1e8a5a", // --admin-accent-mid
    "#31a372",
    "#4db889",
    "#70cc9f",
    "#98e0b7",
    "#c0f0d2",
    "#8a6010", // warning-gold
    "#9b3520", // danger-red
    "#527063", // --admin-text-muted
  ];

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

  // 2. Donut Chart Logic
  const distData = stats?.distribucion_profesiones || [];
  const totalPortafoliosPeriodo = distData.reduce((sum, item) => sum + item.total, 0);
  const isDistEmpty = totalPortafoliosPeriodo === 0;

  // Donut geometry parameters
  const donutR = 70;
  const donutCenter = 120;
  const circumference = 2 * Math.PI * donutR; // 439.82

  let accumulatedPercent = 0;

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
              Estadísticas sobre los portafolios publicados y su distribución por áreas
              profesionales.
            </p>
          </div>

          <div className="stats-controls">
            <div className="admin-filter-field" style={{ minWidth: 160 }}>
              <span className="admin-stat-label">Profesión:</span>
              <select
                value={profesion}
                onChange={(e) => setProfesion(e.target.value)}
                className="stats-select"
                style={{ width: "100%" }}
              >
                <option value="">Todas las áreas</option>
                {stats?.profesiones_disponibles.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-filter-field" style={{ minWidth: 140 }}>
              <span className="admin-stat-label">Periodo:</span>
              <select
                value={rango}
                onChange={(e) => setRango(e.target.value)}
                className="stats-select"
                style={{ width: "100%" }}
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mes</option>
                <option value="anio">Este Año</option>
              </select>
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
                {profesion ? `Activos (${profesion})` : "Total histórico de activos"}
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
        <div className="stats-grid">
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

          {/* Chart 2: Profession Distribution Donut */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>Distribución por Profesión</h3>
              <p>Top 10 áreas profesionales de portafolios creados en el periodo.</p>
            </div>

            {loading ? (
              <div className="admin-table-state">Cargando distribución…</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 0.9fr",
                  gap: "10px",
                  alignItems: "center",
                  flexGrow: 1,
                }}
              >
                {isDistEmpty ? (
                  <div
                    style={{ gridColumn: "1 / -1", height: "100%" }}
                    className="chart-svg-wrapper"
                  >
                    <div className="chart-empty-overlay">
                      <div className="chart-empty-message">
                        <h4>Sin datos</h4>
                        <p>No hay datos de distribución profesional para el lapso elegido.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SVG Donut Chart */}
                    <div className="chart-svg-wrapper" style={{ minHeight: 200 }}>
                      <svg viewBox="0 0 240 240" className="chart-svg">
                        <circle
                          cx={donutCenter}
                          cy={donutCenter}
                          r={donutR}
                          fill="transparent"
                          stroke="var(--admin-surface-muted)"
                          strokeWidth="22"
                        />

                        {distData.map((item, idx) => {
                          const percent = item.total / totalPortafoliosPeriodo;
                          const dashLength = percent * circumference;
                          const strokeOffset = -accumulatedPercent * circumference;

                          // Accumulate percentage for the next slice
                          accumulatedPercent += percent;

                          const color = sliceColors[idx % sliceColors.length];
                          const isHovered = hoveredSliceIdx === idx;

                          return (
                            <circle
                              key={idx}
                              cx={donutCenter}
                              cy={donutCenter}
                              r={donutR}
                              fill="transparent"
                              stroke={color}
                              strokeWidth={isHovered ? "28" : "22"}
                              strokeDasharray={`${dashLength} ${circumference}`}
                              strokeDashoffset={strokeOffset}
                              transform="rotate(-90 120 120)"
                              className="chart-donut-slice"
                              onMouseEnter={() => setHoveredSliceIdx(idx)}
                              onMouseLeave={() => setHoveredSliceIdx(null)}
                            />
                          );
                        })}

                        {/* Centered Total Indicator */}
                        <text
                          x={donutCenter}
                          y={donutCenter - 4}
                          textAnchor="middle"
                          fontFamily="var(--admin-font)"
                          fontWeight="700"
                          fontSize="22"
                          fill="var(--admin-text)"
                        >
                          {totalPortafoliosPeriodo}
                        </text>
                        <text
                          x={donutCenter}
                          y={donutCenter + 14}
                          textAnchor="middle"
                          fontFamily="var(--admin-font-mono)"
                          fontWeight="700"
                          fontSize="9"
                          letterSpacing="0.05em"
                          fill="var(--admin-text-faint)"
                        >
                          PORTAFOLIOS
                        </text>
                      </svg>
                    </div>

                    {/* Donut Legend */}
                    <div className="chart-legend">
                      {distData.map((item, idx) => {
                        const color = sliceColors[idx % sliceColors.length];
                        const isHovered = hoveredSliceIdx === idx;
                        const percent = ((item.total / totalPortafoliosPeriodo) * 100).toFixed(
                          1
                        );

                        return (
                          <div
                            key={idx}
                            className="chart-legend-item"
                            style={{
                              background: isHovered ? "var(--admin-surface-hover)" : undefined,
                            }}
                            onMouseEnter={() => setHoveredSliceIdx(idx)}
                            onMouseLeave={() => setHoveredSliceIdx(null)}
                          >
                            <span
                              className="chart-legend-color"
                              style={{ backgroundColor: color }}
                            />
                            <span className="chart-legend-text" title={item.profesion}>
                              {item.profesion}
                            </span>
                            <span className="chart-legend-value">
                              {item.total} ({percent}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
