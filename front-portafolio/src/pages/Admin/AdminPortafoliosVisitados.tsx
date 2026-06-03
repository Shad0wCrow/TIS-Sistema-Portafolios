import { useState, useEffect, useCallback } from "react";
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

export default function AdminPortafoliosVisitados() {
  const navigate = useNavigate();

  const [periodo, setPeriodo] = useState<"historico" | "anio" | "mes" | "semana" | "dia">("historico");
  const [fecha, setFecha] = useState("");
  const [ranking, setRanking] = useState<PortafolioRanking[]>([]);
  const [top1, setTop1] = useState<PortafolioRanking | null>(null);
  const [mensajeVacio, setMensajeVacio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setMensajeVacio(null);
    try {
      const data = await getPortafoliosMasVisitados(periodo, fecha, 15);
      
      const rankingData = data.ranking || [];
      setRanking(rankingData);
      setTop1(data.top_1 || null); // HU-11
      
      // HU-13: Mensaje vacío
      if (data.mensaje) {
        setMensajeVacio(data.mensaje);
      } else if (rankingData.length === 0) {
        setMensajeVacio("No hay portafolios publicados aún");
      }
    } catch (error) {
      console.error("Error al cargar el ranking", error);
      // Fallback local en caso de que el backend falle
      setMensajeVacio("No hay portafolios publicados aún");
    } finally {
      setLoading(false);
    }
  }, [periodo, fecha]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) =>
      localStorage.removeItem(k)
    );
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  return (
    <div className="admin-page admin-users-page">
      {/* ── Header ── */}
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Publicaciones más visitadas</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <Link to="/admin" className="admin-nav-link">
            Dashboard
          </Link>
          <Link to="/admin/estadisticas-usuarios" className="admin-nav-link">
            Estadísticas Usuarios
          </Link>
          <Link to="/admin/estadisticas-portafolios" className="admin-nav-link">
            Estadísticas Portafolios
          </Link>
          <span className="admin-nav-link admin-nav-link--active">
            Publicaciones más visitadas
          </span>
          <Link to="/admin/reportes" className="admin-nav-link">
            Reportes y usuarios
          </Link>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="admin-main">
        {/* Encabezado y Filtros (HU-2 a HU-10 y HU-12) */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Ranking de Portafolios</h2>
              <p>Top 15 de los portafolios con más vistas en el periodo seleccionado.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            
            {/* Navegación por teclado soportada por elementos nativos (HU-14) */}
            <div className="admin-filter-field">
              <span>Periodo</span>
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value as any)}
                aria-label="Seleccionar periodo"
              >
                <option value="historico">Histórico</option>
                <option value="anio">Por año</option>
                <option value="mes">Por mes</option>
                <option value="semana">Por semana</option>
                <option value="dia">Por día</option>
              </select>
            </div>

            {periodo !== "historico" && (
              <div className="admin-filter-field">
                <span>Fecha Específica</span>
                <input 
                  type="date" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)}
                  aria-label="Seleccionar fecha específica"
                />
              </div>
            )}

            <button onClick={fetchRanking} className="admin-refresh-btn" style={{ height: "38px" }} disabled={loading}>
              {loading ? "Cargando..." : "Filtrar"}
            </button>
          </div>
        </section>

        {/* HU-13: Mensaje si no hay portafolios */}
        {mensajeVacio ? (
          <div className="admin-alert admin-alert-info" style={{ backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", borderColor: "var(--admin-border-strong)" }} role="alert" tabIndex={0}>
            {mensajeVacio}
          </div>
        ) : (
          <div className="admin-reports">
            {/* HU-1: Tarjetas blancas con info, Ranking Top 15 (Responsivo HU-15) */}
            {ranking.map((item, index) => (
              <article key={item.id_publicacion} className="admin-report-card" tabIndex={0} style={index === 0 ? { borderLeft: "4px solid var(--admin-accent)" } : {}}>
                <h3 style={{ margin: 0, color: "var(--admin-text)", fontSize: "16px", fontWeight: "bold" }}>
                  #{index + 1} {item.nombre_usuario} {index === 0 && "🏆"}
                </h3>
                <p style={{ color: "var(--admin-text-muted)", fontSize: "13px", marginTop: "4px" }}>{item.correo}</p>
                <p style={{ marginTop: "12px", color: "var(--admin-accent)", fontWeight: "bold" }}>{item.total_vistas} 👀 Vistas</p>
                <a href={`/portafolio/publico/${item.slug_publico}`} target="_blank" rel="noreferrer" className="admin-current-user" style={{ marginTop: "12px", textDecoration: "none" }}>Ver más</a>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}