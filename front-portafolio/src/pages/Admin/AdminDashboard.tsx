/**
 * AdminDashboard.tsx
 * Ruta: /admin
 * Solo muestra estadísticas de usuarios (HU-45, HU-46 → gestionadas en AdminReportes).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminStatsCards from "./components/AdminStatsCards";
import AdminReportsPanel from "./components/AdminReportsPanel";
import {
  getAdminReportSummary,
  type AdminReportSummary,
} from "../../services/adminService";
import "./AdminDashboard.css";
import "./UsuariosReportados.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<AdminReportSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      const data = await getAdminReportSummary();
      setSummary(data);
    } catch {
      setError("No se pudieron cargar las estadísticas.");
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

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
          <h1>Panel administrativo</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <span className="admin-nav-link admin-nav-link--active">
            Dashboard
          </span>
          <Link to="/admin/reportes" className="admin-nav-link">
            Reportes y usuarios
          </Link>
        </nav>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Salir
        </button>
      </header>

      {/* ── Alerts ── */}
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Estadísticas generales */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Estadísticas de usuarios</h2>
              <p>Resumen general de actividad en la plataforma.</p>
            </div>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={loadSummary}
              disabled={loadingSummary}
            >
              ↺ Actualizar
            </button>
          </div>

          {loadingSummary ? (
            <div className="admin-table-state">Cargando estadísticas…</div>
          ) : (
            <AdminStatsCards summary={summary?.resumen ?? null} />
          )}
        </section>

        {/* Rankings y usuarios recientes */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Rankings y actividad reciente</h2>
              <p>Portafolios con más visualizaciones, contactos y últimos registros.</p>
            </div>
          </div>

          {loadingSummary ? (
            <div className="admin-table-state">Cargando rankings…</div>
          ) : (
            <AdminReportsPanel report={summary} />
          )}
        </section>

        {/* Acceso rápido a gestión */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Gestión</h2>
              <p>
                Para habilitar, inhabilitar usuarios y gestionar reportes, accede
                a la sección de Reportes y usuarios.
              </p>
            </div>
            <Link to="/admin/reportes" className="admin-refresh-btn">
              Ir a Reportes y usuarios →
            </Link>
          </div>

          <div className="admin-dashboard-quick-links">
            <article className="admin-report-card admin-users-note">
              <h2>¿Qué puedo hacer aquí?</h2>
              <p className="admin-empty-text">
                Esta pantalla muestra únicamente estadísticas y métricas de la plataforma.
                Para revisar reportes de usuarios, habilitar o inhabilitar cuentas, accede
                al módulo de <Link to="/admin/reportes"><strong>Reportes y usuarios</strong></Link>.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}