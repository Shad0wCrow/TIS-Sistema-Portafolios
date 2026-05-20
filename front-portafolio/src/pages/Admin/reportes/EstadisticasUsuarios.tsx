import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminUserStats, type UserStatsResponse } from "../../../services/adminService";
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

export default function EstadisticasUsuarios() {
  const navigate = useNavigate();
  const [rango, setRango] = useState<string>("mes");
  const [fecha, setFecha] = useState<string>(getThisMonthString());
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
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
      const data = await getAdminUserStats(rango, fecha);
      setStats(data);
    } catch {
      setError("No se pudieron cargar las estadísticas de usuarios.");
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

  // Calculate SVG dimensions and point coordinates
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingX = 50;
  const paddingY = 40;

  const dataPoints = stats?.crecimiento || [];
  const isEmpty = dataPoints.length === 0 || dataPoints.every((d) => d.valor === 0);

  // Find max value to scale chart
  const rawMax = dataPoints.reduce((max, d) => (d.valor > max ? d.valor : max), 0);
  const maxValue = rawMax === 0 ? 10 : Math.ceil(rawMax * 1.1); // add 10% headroom

  // Grid ticks (y axis)
  const ticksCount = 5;
  const yTicks = Array.from({ length: ticksCount }).map((_, i) => {
    const val = (maxValue / (ticksCount - 1)) * i;
    return Math.round(val);
  });

  // Map data to SVG coordinate space
  const points = dataPoints.map((d, index) => {
    const x = paddingX + (index * (svgWidth - 2 * paddingX)) / Math.max(1, dataPoints.length - 1);
    const y = svgHeight - paddingY - (d.valor * (svgHeight - 2 * paddingY)) / maxValue;
    return { x, y, label: d.label, valor: d.valor, index };
  });

  // Build SVG path strings
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="admin-page admin-users-page">
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
          <span className="admin-nav-link admin-nav-link--active">
            Estadísticas Usuarios
          </span>
          <Link to="/admin/estadisticas-portafolios" className="admin-nav-link">
            Estadísticas Portafolios
          </Link>
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
            <h1>Crecimiento de Usuarios</h1>
            <p>Monitorea y analiza el ritmo de registro de cuentas en la plataforma.</p>
          </div>

          <div className="stats-controls">
            <label htmlFor="rango-select" className="admin-stat-label" style={{ marginBottom: 0 }}>
              Periodo:
            </label>
            <select
              id="rango-select"
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
            >
              <option value="hoy">Por Día</option>
              <option value="semana">Por Semana</option>
              <option value="mes">Por Mes</option>
              <option value="anio">Por Año</option>
            </select>

            {rango === "hoy" && (
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="stats-select"
                style={{ marginLeft: "8px" }}
              />
            )}
            {rango === "semana" && (
              <input
                type="week"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="stats-select"
                style={{ marginLeft: "8px" }}
              />
            )}
            {rango === "mes" && (
              <input
                type="month"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="stats-select"
                style={{ marginLeft: "8px" }}
              />
            )}
            {rango === "anio" && (
              <select
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="stats-select"
                style={{ marginLeft: "8px" }}
              >
                {Array.from({ length: new Date().getFullYear() - 2023 }).map((_, i) => {
                  const y = String(2024 + i);
                  return <option key={y} value={y}>{y}</option>;
                }).reverse()}
              </select>
            )}
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
              <span className="indicator-title">Total de usuarios registrados</span>
              <span className="indicator-value">
                {loading ? "..." : stats?.total_usuarios.toLocaleString()}
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

          <div className="indicator-card">
            <div className="indicator-info">
              <span className="indicator-title">Nuevos usuarios en el periodo</span>
              <span className="indicator-value">
                {loading ? "..." : stats?.nuevos_usuarios.toLocaleString()}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="17" y1="11" x2="23" y2="11" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Main Chart ── */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Gráfico de Registros de Usuarios</h3>
            <p>Visualización temporal de cuentas creadas según el rango seleccionado.</p>
          </div>

          {loading ? (
            <div className="admin-table-state">Cargando gráfico de usuarios…</div>
          ) : (
            <div className="chart-svg-wrapper">
              {isEmpty && (
                <div className="chart-empty-overlay">
                  <div className="chart-empty-message">
                    <h4>Sin registros</h4>
                    <p>No se crearon cuentas de usuarios en el rango seleccionado.</p>
                  </div>
                </div>
              )}

              {/* Custom SVG Line Chart */}
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg">
                <defs>
                  {/* Linear Gradient for Area Fill */}
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {yTicks.map((tick, i) => {
                  const y =
                    svgHeight - paddingY - (tick * (svgHeight - 2 * paddingY)) / maxValue;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        className="chart-grid-line"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 3}
                        textAnchor="end"
                        className="chart-axis-text"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* Axis lines */}
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  className="chart-axis-line"
                />

                {/* Growth Curve Line and Area */}
                {!isEmpty && points.length > 0 && (
                  <>
                    <path d={areaPath} className="chart-area-path" />
                    <path d={linePath} className="chart-line-path" />
                  </>
                )}

                {/* Interactive circles and X Axis Labels */}
                {points.map((p, idx) => {
                  // Only display label for subset of items if too crowded
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
                          x={p.x}
                          y={svgHeight - paddingY + 18}
                          textAnchor="middle"
                          className="chart-axis-text"
                        >
                          {p.label}
                        </text>
                      )}

                      {!isEmpty && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredPoint?.index === idx ? 6 : 4}
                          className="chart-dot"
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="chart-tooltip chart-tooltip--visible"
                  style={{
                    left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                    top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                  }}
                >
                  <span className="chart-tooltip-label">{hoveredPoint.label}</span>
                  <span className="chart-tooltip-value">
                    {hoveredPoint.valor} {hoveredPoint.valor === 1 ? "usuario" : "usuarios"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
