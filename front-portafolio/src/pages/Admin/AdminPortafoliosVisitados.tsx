import { useState, useEffect, useCallback, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { getPortafoliosMasVisitados } from "../../services/adminService";

export type PortafolioRanking = {
  id_publicacion: number;
  slug_publico: string;
  nombre_usuario: string;
  correo: string;
  total_vistas: number;
};

type Periodo = "historico" | "anio" | "mes" | "semana" | "dia";

const PERIODOS: { value: Periodo; label: string; inputType: string | null }[] = [
  { value: "historico", label: "Histórico",  inputType: null     },
  { value: "anio",      label: "Por año",    inputType: "number" },
  { value: "mes",       label: "Por mes",    inputType: "month"  },
  { value: "semana",    label: "Por semana", inputType: "week"   },
  { value: "dia",       label: "Por día",    inputType: "date"   },
];

const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function medalEmoji(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminPortafoliosVisitados() {
  const navigate   = useNavigate();
  const tabGroupId = useId();

  const [periodo,      setPeriodo]      = useState<Periodo>("historico");
  const [fecha,        setFecha]        = useState("");
  const [ranking,      setRanking]      = useState<PortafolioRanking[]>([]);
  const [top1,         setTop1]         = useState<PortafolioRanking | null>(null);
  const [mensajeVacio, setMensajeVacio] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Cada vez que cambia el periodo reseteamos la fecha y el paginado
  const handlePeriodo = (p: Periodo) => {
    setPeriodo(p);
    setFecha("");
    setVisibleCount(PAGE_SIZE);
  };

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setMensajeVacio(null);
    setVisibleCount(PAGE_SIZE);
    try {
      const data = await getPortafoliosMasVisitados(periodo, fecha, 100); // traemos hasta 100 para paginar en cliente
      const rankingData: PortafolioRanking[] = data.ranking ?? [];
      setRanking(rankingData);
      setTop1(data.top_1 ?? null);
      if (data.mensaje) {
        setMensajeVacio(data.mensaje);
      } else if (rankingData.length === 0) {
        setMensajeVacio("No hay portafolios publicados aún");
      }
    } catch {
      setMensajeVacio("No hay portafolios publicados aún");
    } finally {
      setLoading(false);
    }
  }, [periodo, fecha]);

  useEffect(() => { fetchRanking(); }, [fetchRanking]);

  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) =>
      localStorage.removeItem(k)
    );
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  const periodoInfo   = PERIODOS.find((p) => p.value === periodo)!;
  const visibleRows   = ranking.slice(0, visibleCount);
  const hasMore       = visibleCount < ranking.length;
  const totalVisible  = visibleRows.length;

  return (
    <div className="admin-page admin-users-page">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Publicaciones más visitadas</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <Link to="/admin"                              className="admin-nav-link">Dashboard</Link>
          <Link to="/admin/estadisticas-usuarios"        className="admin-nav-link">Estadísticas Usuarios</Link>
          <Link to="/admin/estadisticas-portafolios"     className="admin-nav-link">Estadísticas Portafolios</Link>
          <span className="admin-nav-link admin-nav-link--active">Publicaciones más visitadas</span>
          <Link to="/admin/reportes"                     className="admin-nav-link">Reportes y usuarios</Link>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="admin-main">

        {/* ── Top portafolio (CA-11) ────────────────────────────────────── */}
        {top1 && !mensajeVacio && (
          <section className="admin-section apv-top-section" aria-label="Portafolio más visitado">
            <div className="apv-top-badge">⭐ Portafolio más visitado</div>
            <div className="apv-top-body">
              <div className="admin-avatar apv-top-avatar" aria-hidden="true">
                {initials(top1.nombre_usuario)}
              </div>
              <div className="apv-top-info">
                <strong className="apv-top-name">{top1.nombre_usuario}</strong>
                <span  className="apv-top-email">{top1.correo}</span>
              </div>
              <div className="apv-top-views">
                <span className="apv-views-num">{top1.total_vistas.toLocaleString()}</span>
                <span className="apv-views-label">vistas</span>
              </div>
              <a
                href={`/#/portafolio/publico/${top1.slug_publico}`}
                target="_blank"
                rel="noreferrer"
                className="admin-current-user"
                aria-label={`Ver portafolio de ${top1.nombre_usuario}`}
              >
                Ver portafolio
              </a>
            </div>
          </section>
        )}

        {/* ── Filtros ───────────────────────────────────────────────────── */}
        <section className="admin-section" aria-label="Filtros de periodo">
          <div className="admin-section-header">
            <div>
              <h2>Ranking de portafolios</h2>
              <p>
                Top {PAGE_SIZE} por periodo · mostrando {totalVisible} resultado{totalVisible !== 1 ? "s" : ""}
                {ranking.length > totalVisible ? ` de ${ranking.length}` : ""}
              </p>
            </div>
          </div>

          {/* Tabs de periodo (CA-2 a CA-10) */}
          <div
            className="apv-tabs"
            role="tablist"
            aria-label="Seleccionar periodo"
          >
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                id={`${tabGroupId}-tab-${p.value}`}
                role="tab"
                aria-selected={periodo === p.value}
                aria-controls={`${tabGroupId}-panel`}
                className={`apv-tab${periodo === p.value ? " apv-tab--active" : ""}`}
                onClick={() => handlePeriodo(p.value)}
                tabIndex={periodo === p.value ? 0 : -1}
                onKeyDown={(e) => {
                  const idx   = PERIODOS.findIndex((x) => x.value === periodo);
                  let next = idx;
                  if (e.key === "ArrowRight") next = (idx + 1) % PERIODOS.length;
                  if (e.key === "ArrowLeft")  next = (idx - 1 + PERIODOS.length) % PERIODOS.length;
                  if (next !== idx) handlePeriodo(PERIODOS[next].value);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filtro de fecha específica (CA-12) */}
          {periodoInfo.inputType && (
            <div className="apv-fecha-row">
              <div className="admin-filter-field">
                <span>
                  {periodo === "anio"   ? "Año"
                  : periodo === "mes"   ? "Mes"
                  : periodo === "semana" ? "Semana"
                  : "Día"}
                </span>
                <input
                  type={periodoInfo.inputType}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  aria-label={`Filtrar por ${periodoInfo.label.toLowerCase()}`}
                />
              </div>
              <button
                className="admin-action-enable apv-filtrar-btn"
                onClick={fetchRanking}
                disabled={loading}
                aria-label="Aplicar filtro"
              >
                {loading ? "Cargando…" : "Filtrar"}
              </button>
            </div>
          )}
        </section>

        {/* ── Contenido principal ───────────────────────────────────────── */}
        <div
          id={`${tabGroupId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabGroupId}-tab-${periodo}`}
        >

          {/* CA-13: estado vacío */}
          {mensajeVacio ? (
            <div
              className="admin-table-state"
              role="status"
              aria-live="polite"
              tabIndex={0}
            >
              <span style={{ fontSize: 32 }}>📭</span>
              <p style={{ margin: 0, fontWeight: 600 }}>{mensajeVacio}</p>
              <p style={{ margin: 0, fontSize: 12 }}>
                Cuando se publiquen portafolios aparecerán aquí.
              </p>
            </div>
          ) : loading ? (
            <div className="admin-table-state" role="status" aria-live="polite">
              <span style={{ fontSize: 28 }}>⏳</span>
              <p style={{ margin: 0 }}>Cargando ranking…</p>
            </div>
          ) : (

            /* ── Tabla (CA-1, CA-14, CA-15) ─────────────────────────── */
            <div className="admin-section" style={{ padding: 0, overflow: "hidden" }}>
              <div className="admin-table-wrap">
                <table
                  className="admin-users-table apv-table"
                  aria-label={`Ranking portafolios – ${periodoInfo.label}`}
                >
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: 52 }}>#</th>
                      <th scope="col">Usuario</th>
                      <th scope="col">Correo</th>
                      <th scope="col" style={{ textAlign: "right" }}>Vistas</th>
                      <th scope="col" style={{ textAlign: "center" }}>Portafolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((item, index) => {
                      const rank    = index + 1;
                      const isTop3  = rank <= 3;
                      return (
                        <tr
                          key={item.id_publicacion}
                          tabIndex={0}
                          className={isTop3 ? "apv-row-top" : ""}
                          aria-label={`Posición ${rank}: ${item.nombre_usuario}, ${item.total_vistas} vistas`}
                        >
                          {/* Posición */}
                          <td>
                            <span className={`apv-rank${isTop3 ? ` apv-rank--${rank}` : ""}`}>
                              {medalEmoji(rank) || rank}
                            </span>
                          </td>

                          {/* Usuario */}
                          <td>
                            <div className="admin-user-cell">
                              <div
                                className="admin-avatar"
                                aria-hidden="true"
                                style={
                                  rank === 1
                                    ? { background: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" }
                                    : rank === 2
                                    ? { background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" }
                                    : rank === 3
                                    ? { background: "#fef2e7", color: "#7c3d00", borderColor: "#fdba74" }
                                    : {}
                                }
                              >
                                {initials(item.nombre_usuario)}
                              </div>
                              <div>
                                <strong>{item.nombre_usuario}</strong>
                              </div>
                            </div>
                          </td>

                          {/* Correo */}
                          <td>
                            <span className="admin-muted">{item.correo}</span>
                          </td>

                          {/* Vistas */}
                          <td style={{ textAlign: "right" }}>
                            <span className="apv-views-badge">
                              {item.total_vistas.toLocaleString()}
                            </span>
                          </td>

                          {/* Acción */}
                          <td style={{ textAlign: "center" }}>
                            <a
                              href={`/#/portafolio/publico/${item.slug_publico}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-current-user"
                              aria-label={`Ver portafolio de ${item.nombre_usuario}`}
                            >
                              Ver
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ver más (CA-3/4/5/6/7/8/9/10) */}
              {hasMore && (
                <div className="apv-ver-mas-row">
                  <span className="admin-muted" style={{ fontSize: 12 }}>
                    Mostrando {visibleCount} de {ranking.length}
                  </span>
                  <button
                    type="button"
                    className="admin-action-enable apv-ver-mas-btn"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Ver más ({ranking.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}